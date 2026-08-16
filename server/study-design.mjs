export const evidenceRegistry = [
  {
    relation: 'Temperament → Perception',
    status: 'PARTIALLY_SUPPORTED',
    label: '一部支持',
    evidence: 'PF-EXP-0001 pilot-002',
    note: 'Seeking / Negative の主効果と弁別性はPASS。Conflict coactivationの事前Gate G4は未達。MVPではSとNの主効果を別々に比較する。'
  },
  {
    relation: 'Values & Beliefs → Experience',
    status: 'SUPPORTED',
    label: '支持',
    evidence: 'PF-EXP-0005 pilot-002',
    note: '同一Situation / Perception / neutral RelationshipでVBのみを操作し、P1〜P5・G1〜G5をすべてPASS。'
  },
  {
    relation: 'Trust within Relationship → Experience',
    status: 'SUPPORTED',
    label: '支持',
    evidence: 'PF-EXP-0006 pilot-001',
    note: '同一Situation / Perception / target-neutral VBでTrust状態のみを操作し、P1〜P5・G1〜G5をすべてPASS。'
  },
  {
    relation: 'Experience → Response',
    status: 'UNTESTED',
    label: '未検証',
    evidence: '—',
    note: '未検証のためMVPではResponseを生成しない。'
  },
  {
    relation: 'Experience / Outcome → state update',
    status: 'UNTESTED',
    label: '未検証',
    evidence: '—',
    note: 'VB / Relationshipの自然な更新則は未検証。MVPでは人格・関係を自動更新しない。'
  }
];

const temperamentScenarios = [
  { id: 'new-activity', situation: '参加したことのない活動に、知人から突然誘われた。' },
  { id: 'new-method', situation: '慣れていない新しい方法を試せる機会が提示された。' },
  { id: 'unknown-place', situation: '初めて訪れる場所で、予定になかった自由時間ができた。' }
];

export const studyDesign = {
  temperament: {
    id: 'temperament',
    title: 'Temperament Lens',
    subtitle: '同じSituationでも、何がsalientになるかは違うか',
    stage: 'Perception',
    evidence: 'PF-EXP-0001 pilot-002',
    variants: {
      seeking: {
        id: 'seeking',
        label: 'Seeking Reactivity',
        comparison: 'S High vs S Low（NはLowで固定）',
        identificationQuestion: 'どちらが、新奇性・機会・探索価値をより強く感じ取っていると思う？',
        expectedConditionId: 'S_HIGH',
        scenarios: temperamentScenarios,
        conditions: [
          { id: 'S_HIGH', publicLabel: 'Character A', temperament: { seeking: 'high', negative: 'low' } },
          { id: 'S_LOW', publicLabel: 'Character B', temperament: { seeking: 'low', negative: 'low' } }
        ]
      },
      negative: {
        id: 'negative',
        label: 'Negative Affectivity',
        comparison: 'N High vs N Low（SはLowで固定）',
        identificationQuestion: 'どちらが、脅威・損失・不快の可能性をより強く感じ取っていると思う？',
        expectedConditionId: 'N_HIGH',
        scenarios: temperamentScenarios,
        conditions: [
          { id: 'N_HIGH', publicLabel: 'Character A', temperament: { seeking: 'low', negative: 'high' } },
          { id: 'N_LOW', publicLabel: 'Character B', temperament: { seeking: 'low', negative: 'low' } }
        ]
      }
    }
  },
  valuesBeliefs: {
    id: 'valuesBeliefs',
    title: 'Values & Beliefs Lens',
    subtitle: '同じものを感じ取っても、経験の意味は違うか',
    stage: 'Experience',
    evidence: 'PF-EXP-0005 pilot-002',
    identificationQuestion: 'どちらが、出来事を学習・改善の機会として意味づけていると思う？',
    expectedConditionId: 'VB_L',
    scenarios: [
      {
        id: 'revision-request',
        situation: '進めていた仕事について、相手から「一度やり方を見直した方がいい」と言われた。',
        fixedPerception: '自分の進め方に改善の余地があるという評価情報がsalientになった。'
      },
      {
        id: 'additional-review',
        situation: '自分が出した案について、会議で追加の検討が必要だと指摘された。',
        fixedPerception: '自分の案が十分ではない可能性を示すフィードバックがsalientになった。'
      },
      {
        id: 'different-approach',
        situation: '現在の進め方とは異なる方法を試すことを提案された。',
        fixedPerception: '現在の方法と別の改善可能性が比較対象としてsalientになった。'
      }
    ],
    conditions: [
      {
        id: 'VB_L',
        publicLabel: 'Character A',
        valuesBeliefs: {
          label: 'Learning / Improvement orientation',
          description: '不完全さや指摘を、能力を伸ばすための情報や学習機会として意味づけやすい。'
        },
        relationship: 'neutral'
      },
      {
        id: 'VB_E',
        publicLabel: 'Character B',
        valuesBeliefs: {
          label: 'Evaluation / Competence-protection orientation',
          description: '不完全さや指摘を、自分の能力評価や立場への脅威として意味づけやすい。'
        },
        relationship: 'neutral'
      }
    ]
  },
  relationship: {
    id: 'relationship',
    title: 'Relationship Lens',
    subtitle: '同じ出来事でも、相手へのTrustで経験の意味は違うか',
    stage: 'Experience',
    evidence: 'PF-EXP-0006 pilot-001',
    identificationQuestion: 'どちらが、相手の発言をより善意・誠実な意図として意味づけていると思う？',
    expectedConditionId: 'REL_T',
    scenarios: [
      {
        id: 'review-request',
        situation: '相手から「その案は、一度見直した方がいいと思う」と言われた。',
        fixedPerception: '相手が自分の案に再検討を求めていることがsalientになった。'
      },
      {
        id: 'schedule-change',
        situation: '相手から予定を変更したいという連絡があり、短い理由が添えられていた。',
        fixedPerception: '相手が予定変更を求め、その理由を説明していることがsalientになった。'
      },
      {
        id: 'help-offer',
        situation: '作業中に、相手から「必要なら一部を代わろうか」と申し出があった。',
        fixedPerception: '相手が自分の作業を手伝う提案をしていることがsalientになった。'
      }
    ],
    conditions: [
      {
        id: 'REL_T',
        publicLabel: 'Character A',
        valuesBeliefs: 'neutral',
        relationship: {
          trust: 'high',
          description: 'この特定相手の発言・説明・約束は、通常は誠実で信頼できると見積もっている。'
        }
      },
      {
        id: 'REL_D',
        publicLabel: 'Character B',
        valuesBeliefs: 'neutral',
        relationship: {
          trust: 'low',
          description: 'この特定相手の発言・説明・約束は、そのまま信頼せず慎重に受け取る傾向がある。'
        }
      }
    ]
  }
};

export function getRunSpec({ lensId, variantId, scenarioId }) {
  const lens = studyDesign[lensId];
  if (!lens) throw new Error('未知のLensです。');

  const variant = lens.variants ? lens.variants[variantId] : lens;
  if (!variant) throw new Error('未知のTemperament比較です。');

  const scenario = variant.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) throw new Error('未知のSituationです。');

  return {
    lensId,
    variantId: lens.variants ? variant.id : null,
    title: lens.title,
    stage: lens.stage,
    scenario,
    conditions: variant.conditions,
    identificationQuestion: variant.identificationQuestion ?? lens.identificationQuestion,
    expectedConditionId: variant.expectedConditionId ?? lens.expectedConditionId
  };
}

export function getPublicDesign() {
  const clone = structuredClone(studyDesign);
  return { evidenceRegistry, lenses: clone };
}
