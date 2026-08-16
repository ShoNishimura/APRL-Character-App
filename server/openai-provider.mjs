const temperamentSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['results'],
  properties: {
    results: {
      type: 'array', minItems: 2, maxItems: 2,
      items: {
        type: 'object', additionalProperties: false,
        required: ['conditionId', 'surfaceText', 'perception'],
        properties: {
          conditionId: { type: 'string' },
          surfaceText: { type: 'string' },
          perception: {
            type: 'object', additionalProperties: false,
            required: ['summary', 'opportunitySalience', 'dangerSalience'],
            properties: {
              summary: { type: 'string' },
              opportunitySalience: { type: 'integer', minimum: 0, maximum: 4 },
              dangerSalience: { type: 'integer', minimum: 0, maximum: 4 }
            }
          }
        }
      }
    }
  }
};


const separateTemperamentScoreSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['scores'],
  properties: {
    scores: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['itemId', 'opportunitySalience', 'dangerSalience', 'rationale'],
        properties: {
          itemId: { type: 'string' },
          opportunitySalience: { type: 'integer', minimum: 0, maximum: 4 },
          dangerSalience: { type: 'integer', minimum: 0, maximum: 4 },
          rationale: { type: 'string' }
        }
      }
    }
  }
};

const experienceSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['results'],
  properties: {
    results: {
      type: 'array', minItems: 2, maxItems: 2,
      items: {
        type: 'object', additionalProperties: false,
        required: ['conditionId', 'surfaceText', 'experience'],
        properties: {
          conditionId: { type: 'string' },
          surfaceText: { type: 'string' },
          experience: {
            type: 'object', additionalProperties: false,
            required: ['summary', 'meaning', 'valence', 'arousal'],
            properties: {
              summary: { type: 'string' },
              meaning: { type: 'string' },
              valence: { type: 'integer', minimum: -2, maximum: 2 },
              arousal: { type: 'integer', minimum: 0, maximum: 4 }
            }
          }
        }
      }
    }
  }
};

function extractOutputText(response) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  throw new Error('OpenAI responseにoutput_textがありません。');
}

function buildPrompt(runSpec) {
  if (runSpec.lensId === 'temperament') {
    return {
      schema: temperamentSchema,
      schemaName: 'aprl_temperament_lens',
      instructions: [
        'You are an implementation adapter for the APRL Personality Formation research model.',
        'Generate Perception only. Do NOT generate Experience, Response, decisions, actions, personality updates, relationship updates, or future behavior.',
        'Use the exact same external Situation for both conditions.',
        'Only Temperament differs between the two conditions. Seeking Reactivity biases salience of opportunity, reward, novelty, pleasure, and exploration value. Negative Affectivity biases salience of threat, loss, rejection, unpleasantness, fear, sadness, and irritation.',
        'Treat these as probabilistic tendencies, not deterministic rules. Do not invent Values & Beliefs or Relationship.',
        'surfaceText is one short Japanese first-person phrase expressing what immediately stands out or feels salient. It must not contain an action, intention, choice, or decision.',
        'Avoid parroting labels such as Seeking, Negative, High, or Low. All natural-language fields must be concise Japanese.'
      ].join('\n'),
      input: {
        situation: runSpec.scenario.situation,
        conditions: runSpec.conditions.map((item) => ({ id: item.id, temperament: item.temperament }))
      }
    };
  }

  if (runSpec.lensId === 'valuesBeliefs') {
    return {
      schema: experienceSchema,
      schemaName: 'aprl_values_beliefs_lens',
      instructions: [
        'You are an implementation adapter for the APRL Personality Formation research model.',
        'Generate Experience only from the supplied Situation, fixed Perception, and Values & Beliefs. Do NOT alter the fixed Perception.',
        'Relationship is neutral and identical in both conditions. Do NOT invent relationship differences, Response, decisions, actions, personality updates, or future behavior.',
        'The two conditions differ only in Values & Beliefs.',
        'surfaceText is one short Japanese first-person inner phrase expressing what the event means to the character. It must not contain an action, intention, choice, or decision.',
        'Avoid parroting profile labels. Render plausible subjective meaning rather than a diagnostic explanation. All natural-language fields must be concise Japanese.'
      ].join('\n'),
      input: {
        situation: runSpec.scenario.situation,
        fixedPerception: runSpec.scenario.fixedPerception,
        relationship: 'neutral',
        conditions: runSpec.conditions.map((item) => ({ id: item.id, valuesBeliefs: item.valuesBeliefs }))
      }
    };
  }

  return {
    schema: experienceSchema,
    schemaName: 'aprl_relationship_lens',
    instructions: [
      'You are an implementation adapter for the APRL Personality Formation research model.',
      'Generate Experience only from the supplied Situation, fixed Perception, target-neutral Values & Beliefs, and counterpart-specific Relationship Trust state. Do NOT alter the fixed Perception.',
      'The two conditions differ only in Trust toward this specific counterpart. Do not introduce closeness, affection, power, dependency, generalized beliefs, concrete past episodes, or facts not supplied here.',
      'Do NOT generate Response, decisions, actions, relationship updates, personality updates, or future behavior.',
      'surfaceText is one short Japanese first-person inner phrase expressing what the event means to the character. It must not contain an action, intention, choice, or decision.',
      'Avoid parroting labels such as Trusting or Distrustful. All natural-language fields must be concise Japanese.'
    ].join('\n'),
    input: {
      situation: runSpec.scenario.situation,
      fixedPerception: runSpec.scenario.fixedPerception,
      valuesBeliefs: 'target-neutral',
      conditions: runSpec.conditions.map((item) => ({ id: item.id, relationship: item.relationship }))
    }
  };
}

export async function generateWithOpenAI({ apiKey, model, runSpec }) {
  const prompt = buildPrompt(runSpec);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      reasoning: { effort: 'low' },
      text: {
        verbosity: 'low',
        format: { type: 'json_schema', name: prompt.schemaName, strict: true, schema: prompt.schema }
      },
      instructions: prompt.instructions,
      input: JSON.stringify(prompt.input)
    })
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? `OpenAI API error (${response.status})`);

  const parsed = JSON.parse(extractOutputText(payload));
  const ids = new Set(runSpec.conditions.map((condition) => condition.id));
  if (!Array.isArray(parsed.results) || parsed.results.length !== 2) throw new Error('構造化出力の条件数が不正です。');
  for (const result of parsed.results) {
    if (!ids.has(result.conditionId)) throw new Error(`未知のconditionIdが返されました: ${result.conditionId}`);
  }

  return {
    model,
    requestId: payload.id,
    usage: payload.usage ? {
      inputTokens: payload.usage.input_tokens ?? 0,
      outputTokens: payload.usage.output_tokens ?? 0,
      totalTokens: payload.usage.total_tokens ?? 0
    } : undefined,
    results: parsed.results
  };
}

export async function scoreTemperamentPerceptionWithOpenAI({
  apiKey,
  model,
  runSpec,
  results
}) {
  if (runSpec.lensId !== 'temperament') {
    throw new Error('Separate perception scoring is only available for Temperament Lens.');
  }

  if (!Array.isArray(results) || results.length !== 2) {
    throw new Error('Separate perception scoring requires exactly two results.');
  }

  const resultMap = new Map(results.map((item) => [item.conditionId, item]));

  const blindItems = runSpec.conditions.map((condition, index) => {
    const source = resultMap.get(condition.id);
    if (
      !source ||
      typeof source.surfaceText !== 'string' ||
      typeof source.perception?.summary !== 'string'
    ) {
      throw new Error(`Missing Perception text for condition: ${condition.id}`);
    }

    return {
      itemId: `item-${index + 1}`,
      surfaceText: source.surfaceText,
      summary: source.perception.summary
    };
  });

  const itemToCondition = new Map(
    blindItems.map((item, index) => [item.itemId, runSpec.conditions[index].id])
  );

  const instructions = [
    'You are a separate-pass blind evaluator of perceived salience.',
    'You are evaluating already-generated Perception text. Do not generate a new Character response.',
    'You do not know experimental conditions, Temperament values, hypotheses, original numeric scores, or expected ordering.',
    'Use only the external Situation and each supplied Perception surfaceText and summary.',
    '',
    'Opportunity salience:',
    '0 = reward, novelty value, positive possibility, exploration value, or useful opportunity is not salient',
    '1 = faint or weakly implied',
    '2 = clearly present but secondary',
    '3 = strong and prominent',
    '4 = dominant or central to what stands out',
    '',
    'Danger salience:',
    '0 = threat, loss, rejection, unpleasantness, failure risk, fear, or aversive uncertainty is not salient',
    '1 = faint or weakly implied',
    '2 = clearly present but secondary',
    '3 = strong and prominent',
    '4 = dominant or central to what stands out',
    '',
    'Score each item independently.',
    'Do not infer hidden personality traits or experimental conditions.',
    'Opportunity and Danger are independent dimensions.',
    'Unknown or unfamiliar is not automatically Danger.',
    'New is not automatically Opportunity.',
    'Score the meaning actually expressed by the supplied Perception.',
    'Keep rationale concise.'
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: 'low' },
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'aprl_separate_temperament_score',
          strict: true,
          schema: separateTemperamentScoreSchema
        }
      },
      instructions,
      input: JSON.stringify({
        situation: runSpec.scenario.situation,
        items: blindItems
      })
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ?? `OpenAI API error (${response.status})`
    );
  }

  const parsed = JSON.parse(extractOutputText(payload));

  if (!Array.isArray(parsed.scores) || parsed.scores.length !== 2) {
    throw new Error('Separate scoring returned an invalid item count.');
  }

  const seen = new Set();

  const scores = parsed.scores.map((score) => {
    const conditionId = itemToCondition.get(score.itemId);

    if (!conditionId || seen.has(conditionId)) {
      throw new Error(`Invalid separate scoring itemId: ${score.itemId}`);
    }

    seen.add(conditionId);

    return {
      conditionId,
      opportunitySalience: score.opportunitySalience,
      dangerSalience: score.dangerSalience,
      rationale: score.rationale
    };
  });

  return {
    model,
    requestId: payload.id,
    usage: payload.usage ? {
      inputTokens: payload.usage.input_tokens ?? 0,
      outputTokens: payload.usage.output_tokens ?? 0,
      totalTokens: payload.usage.total_tokens ?? 0
    } : undefined,
    scores
  };
}
