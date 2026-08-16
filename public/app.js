const state = {
  design: null,
  lensId: 'temperament',
  variantId: 'seeking',
  scenarioId: null,
  result: null,
  displayOrder: [],
  labView: false,
  labEverViewed: false,
  ratings: { differenceStrength: null, naturalness: null, identification: null },
  saved: false,
  diagnostic: {
    mismatch: null,
    humanScores: {
      A: { opportunity: null, danger: null },
      B: { opportunity: null, danger: null }
    },
    comment: ''
  },
  diagnosticSaved: false
};

const $ = (id) => document.getElementById(id);
const escapeHtml = (text) => String(text ?? '').replace(/[&<>'"]/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[ch]);

function currentLens() { return state.design.lenses[state.lensId]; }
function currentVariant() { const lens = currentLens(); return lens.variants ? lens.variants[state.variantId] : lens; }
function currentScenario() { return currentVariant().scenarios.find((x) => x.id === state.scenarioId); }

function resetDiagnosticState() {
  state.diagnostic = {
    mismatch: null,
    humanScores: {
      A: { opportunity: null, danger: null },
      B: { opportunity: null, danger: null }
    },
    comment: ''
  };
  state.diagnosticSaved = false;
}

function resetRun() {
  state.result = null;
  state.displayOrder = [];
  state.labView = false;
  state.labEverViewed = false;
  state.ratings = { differenceStrength: null, naturalness: null, identification: null };
  state.saved = false;
  resetDiagnosticState();
  $('handfeel').classList.add('hidden');
  $('diagnostic').classList.add('hidden');
  $('run-meta').classList.add('hidden');
  $('error').classList.add('hidden');
}

function selectLens(lensId) {
  state.lensId = lensId;
  const lens = currentLens();
  state.variantId = lens.variants ? Object.keys(lens.variants)[0] : null;
  state.scenarioId = currentVariant().scenarios[0].id;
  resetRun();
  renderAll();
}

function renderLensTabs() {
  const order = ['temperament', 'valuesBeliefs', 'relationship'];
  $('lens-tabs').innerHTML = order.map((id, i) => {
    const lens = state.design.lenses[id];
    return `<button type="button" class="lens-tab ${state.lensId === id ? 'active' : ''}" data-lens="${id}"><span>0${i + 1}</span>${escapeHtml(lens.title.replace(' Lens',''))}</button>`;
  }).join('');
  $('lens-tabs').querySelectorAll('[data-lens]').forEach((button) => button.addEventListener('click', () => selectLens(button.dataset.lens)));
}

function renderLensHeader() {
  const lens = currentLens();
  $('lens-eyebrow').textContent = `${lens.title} · ${lens.evidence}`;
  $('lens-title').textContent = lens.subtitle;
  $('lens-stage').textContent = `観測対象: ${lens.stage}`;

  if (lens.variants) {
    $('variant-wrap').classList.remove('hidden');
    $('variant-buttons').innerHTML = Object.values(lens.variants).map((variant) => `<button type="button" data-variant="${variant.id}" class="${state.variantId === variant.id ? 'active' : ''}">${escapeHtml(variant.label)}</button>`).join('');
    $('variant-buttons').querySelectorAll('[data-variant]').forEach((button) => button.addEventListener('click', () => {
      state.variantId = button.dataset.variant;
      state.scenarioId = currentVariant().scenarios[0].id;
      resetRun(); renderAll();
    }));
    $('variant-note').textContent = currentVariant().comparison;
  } else {
    $('variant-wrap').classList.add('hidden');
  }
}

function renderSituations() {
  const variant = currentVariant();
  $('presets').innerHTML = variant.scenarios.map((item, i) => `<button type="button" data-scenario="${item.id}" class="${state.scenarioId === item.id ? 'active' : ''}">${i + 1}</button>`).join('');
  $('presets').querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => {
    state.scenarioId = button.dataset.scenario; resetRun(); renderAll();
  }));
  const scenario = currentScenario();
  $('situation').textContent = scenario.situation;
  if (scenario.fixedPerception) {
    $('fixed-perception').classList.remove('hidden');
    $('fixed-perception-text').textContent = scenario.fixedPerception;
  } else {
    $('fixed-perception').classList.add('hidden');
  }
}

function meter(label, value) {
  const safe = Math.max(0, Math.min(4, Number(value) || 0));
  return `<div class="level-row"><span>${escapeHtml(label)}</span><div class="meter"><span style="width:${safe * 25}%"></span></div><b>${safe}/4</b></div>`;
}

function conditionDetail(conditionId) {
  return currentVariant().conditions.find((item) => item.id === conditionId);
}

function renderConditionLab(condition, result) {
  if (state.lensId === 'temperament') {
    return `<div class="lab-details">
      <div class="lab-block"><span class="lab-label">Manipulated state</span><p>S: <strong>${escapeHtml(condition.temperament.seeking)}</strong> / N: <strong>${escapeHtml(condition.temperament.negative)}</strong></p></div>
      <div class="lab-block"><span class="lab-label">Perception</span><p>${escapeHtml(result.perception.summary)}</p>${meter('Opportunity', result.perception.opportunitySalience)}${meter('Danger', result.perception.dangerSalience)}</div>
    </div>`;
  }
  if (state.lensId === 'valuesBeliefs') {
    return `<div class="lab-details">
      <div class="lab-block"><span class="lab-label">Fixed Perception</span><p>${escapeHtml(currentScenario().fixedPerception)}</p></div>
      <div class="lab-block"><span class="lab-label">Manipulated Values & Beliefs</span><p><strong>${escapeHtml(condition.valuesBeliefs.label)}</strong></p><p>${escapeHtml(condition.valuesBeliefs.description)}</p></div>
      <div class="lab-block"><span class="lab-label">Experience meaning</span><p>${escapeHtml(result.experience.meaning)}</p>${meter('Arousal', result.experience.arousal)}</div>
    </div>`;
  }
  return `<div class="lab-details">
    <div class="lab-block"><span class="lab-label">Fixed Perception</span><p>${escapeHtml(currentScenario().fixedPerception)}</p></div>
    <div class="lab-block"><span class="lab-label">Manipulated Relationship</span><p>Trust: <strong>${escapeHtml(condition.relationship.trust)}</strong></p><p>${escapeHtml(condition.relationship.description)}</p></div>
    <div class="lab-block"><span class="lab-label">Experience meaning</span><p>${escapeHtml(result.experience.meaning)}</p>${meter('Arousal', result.experience.arousal)}</div>
  </div>`;
}

function renderCharacters() {
  if (!state.result) {
    $('characters').innerHTML = [0,1].map((i) => `<article class="character-card empty-card"><header><div class="avatar">${i === 0 ? 'A' : 'B'}</div><div><h3>Character ${i === 0 ? 'A' : 'B'}</h3><p>まだ生成されていません</p></div></header><div class="empty-state">Situationを選び、「比較を生成」を押してください。</div></article>`).join('');
    return;
  }

  const resultMap = new Map(state.result.results.map((item) => [item.conditionId, item]));
  $('characters').innerHTML = state.displayOrder.map((conditionId, index) => {
    const result = resultMap.get(conditionId);
    const condition = conditionDetail(conditionId);
    const label = index === 0 ? 'A' : 'B';
    const summary = result.perception?.summary ?? result.experience?.summary ?? '';
    return `<article class="character-card">
      <header><div class="avatar">${label}</div><div><h3>Character ${label}</h3><p>${state.labView ? escapeHtml(conditionId) : '条件は伏せています'}</p></div></header>
      <blockquote class="experience-voice">「${escapeHtml(result.surfaceText)}」</blockquote>
      <p class="experience-summary">${escapeHtml(summary)}</p>
      ${state.labView ? renderConditionLab(condition, result) : ''}
    </article>`;
  }).join('');
}

function ratingHtml(id, label, value) {
  return `<div class="rating-control"><span>${escapeHtml(label)}</span><div class="rating-buttons" data-rating="${id}">${[1,2,3,4,5].map((score) => `<button type="button" data-score="${score}" class="${value === score ? 'selected' : ''}">${score}</button>`).join('')}</div><small>1 = ほとんど感じない / 5 = はっきり感じる</small></div>`;
}

function renderHandfeel() {
  if (!state.result) return;
  const question = state.result.identificationQuestion;
  $('handfeel-body').innerHTML = `
    ${ratingHtml('differenceStrength', 'AとBに、受け取り方・意味づけの違いを感じた？', state.ratings.differenceStrength)}
    ${ratingHtml('naturalness', 'その違いは、単なる文体差ではなく「人の違い」として自然に感じた？', state.ratings.naturalness)}
    <div class="identification-control"><span>${escapeHtml(question)}</span><div class="identify-buttons">
      <button type="button" data-identify="A" class="${state.ratings.identification === 'A' ? 'selected' : ''}">Character A</button>
      <button type="button" data-identify="B" class="${state.ratings.identification === 'B' ? 'selected' : ''}">Character B</button>
    </div><small>条件ラベルを見る前に選ぶと、よりよい手触り確認になります。</small></div>`;

  $('handfeel-body').querySelectorAll('[data-rating]').forEach((container) => {
    container.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      state.ratings[container.dataset.rating] = Number(button.dataset.score); renderHandfeel();
    }));
  });
  $('handfeel-body').querySelectorAll('[data-identify]').forEach((button) => button.addEventListener('click', () => {
    state.ratings.identification = button.dataset.identify; renderHandfeel();
  }));

  if (state.saved) {
    $('handfeel-body').querySelectorAll('button').forEach((button) => {
      button.disabled = true;
    });
  }

  const complete = state.ratings.differenceStrength && state.ratings.naturalness && state.ratings.identification;
  $('save-rating').disabled = state.saved || !complete;
  $('save-rating').textContent = state.saved ? '保存済み' : '手触りをローカル保存';
}

function loadDiagnostics() {
  try { return JSON.parse(localStorage.getItem('aprl-character-app:diagnostics:v1') ?? '[]'); } catch { return []; }
}

function humanScoreButtons(characterLabel, metric, value) {
  const key = `${characterLabel}.${metric}`;
  return `<div class="diagnostic-score-row"><span>${escapeHtml(metric === 'opportunity' ? 'Opportunity' : 'Danger')}</span><div class="diagnostic-score-buttons" data-human-score="${key}">${[0,1,2,3,4].map((score) => `<button type="button" data-score="${score}" class="${value === score ? 'selected' : ''}">${score}</button>`).join('')}</div></div>`;
}

function renderDiagnostic() {
  const section = $('diagnostic');
  if (!state.result || !state.saved || !state.labView) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  const mismatch = state.diagnostic.mismatch;
  const resultMap = new Map(state.result.results.map((item) => [item.conditionId, item]));
  let scoreEditor = '';
  if (mismatch === true && state.lensId === 'temperament') {
    scoreEditor = `<div class="diagnostic-grid">${state.displayOrder.map((conditionId, index) => {
      const label = index === 0 ? 'A' : 'B';
      const result = resultMap.get(conditionId);
      const scores = state.diagnostic.humanScores[label];
      return `<article class="diagnostic-character"><strong>Character ${label}</strong><p>LLM: Opportunity ${result.perception.opportunitySalience}/4 · Danger ${result.perception.dangerSalience}/4</p><span>あなたが自然言語から感じた値</span>${humanScoreButtons(label, 'opportunity', scores.opportunity)}${humanScoreButtons(label, 'danger', scores.danger)}</article>`;
    }).join('')}</div>`;
  }

  $('diagnostic-body').innerHTML = `
    <div class="diagnostic-question"><span>自然言語から感じた意味と、Lab Viewの定量値に違和感がありますか？</span><div class="identify-buttons">
      <button type="button" data-mismatch="no" class="${mismatch === false ? 'selected' : ''}">違和感なし</button>
      <button type="button" data-mismatch="yes" class="${mismatch === true ? 'selected' : ''}">違和感あり</button>
    </div><small>ここはBlind Handfeel保存後の診断です。研究結果の判定そのものとは分けて扱います。</small></div>
    ${scoreEditor}
    <label class="diagnostic-comment"><span>観察メモ（任意）</span><textarea id="diagnostic-comment" rows="4" placeholder="例: Character Aは不安や危うさが前面に出ており、Danger > Opportunityに感じる。">${escapeHtml(state.diagnostic.comment)}</textarea></label>`;

  $('diagnostic-body').querySelectorAll('[data-mismatch]').forEach((button) => button.addEventListener('click', () => {
    state.diagnostic.mismatch = button.dataset.mismatch === 'yes';
    state.diagnosticSaved = false;
    renderDiagnostic();
  }));
  $('diagnostic-body').querySelectorAll('[data-human-score]').forEach((container) => {
    container.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      const [label, metric] = container.dataset.humanScore.split('.');
      state.diagnostic.humanScores[label][metric] = Number(button.dataset.score);
      state.diagnosticSaved = false;
      renderDiagnostic();
    }));
  });
  $('diagnostic-comment').addEventListener('input', (event) => {
    state.diagnostic.comment = event.target.value;
    state.diagnosticSaved = false;
    $('save-diagnostic').textContent = '診断をローカル保存';
  });

  if (state.diagnosticSaved) {
    $('diagnostic-body').querySelectorAll('button, textarea').forEach((control) => {
      control.disabled = true;
    });
  }

  const temperamentScoresComplete = state.lensId !== 'temperament' || mismatch !== true || ['A','B'].every((label) => {
    const scores = state.diagnostic.humanScores[label];
    return scores.opportunity !== null && scores.danger !== null;
  });
  $('save-diagnostic').disabled = state.diagnosticSaved || mismatch === null || !temperamentScoresComplete;
  $('save-diagnostic').textContent = state.diagnosticSaved ? '診断保存済み' : '診断をローカル保存';
}

function diagnosticRepresentation() {
  const resultMap = new Map(state.result.results.map((item) => [item.conditionId, item]));
  return state.displayOrder.map((conditionId, index) => {
    const result = resultMap.get(conditionId);
    const label = index === 0 ? 'A' : 'B';
    return {
      character: label, conditionId, surfaceText: result.surfaceText,
      summary: result.perception?.summary ?? result.experience?.summary ?? '',
      llmScores: result.perception ? { opportunity: result.perception.opportunitySalience, danger: result.perception.dangerSalience } : { arousal: result.experience?.arousal },
      humanScores: state.lensId === 'temperament' ? state.diagnostic.humanScores[label] : undefined
    };
  });
}

function saveDiagnostic() {
  if (state.diagnosticSaved) return;
  const rows = loadDiagnostics();
  rows.push({
    id: crypto.randomUUID(), createdAt: new Date().toISOString(),
    lensId: state.result.lensId, variantId: state.result.variantId, scenarioId: state.result.scenario.id,
    situation: state.result.scenario.situation, model: state.result.model, cacheHit: state.result.cacheHit,
    mismatch: state.diagnostic.mismatch, comment: state.diagnostic.comment.trim(),
    representation: diagnosticRepresentation(),
    qualityMetric: 'Semantic-Score Consistency',
    handfeelSavedBeforeDiagnostic: state.saved, labViewUsed: state.labView
  });
  localStorage.setItem('aprl-character-app:diagnostics:v1', JSON.stringify(rows));
  state.diagnosticSaved = true;
  renderDiagnostic();
}

function exportDiagnostics() {
  const blob = new Blob([JSON.stringify(loadDiagnostics(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = `aprl-character-app-diagnostics-${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
}

function renderEvidence() {
  $('evidence').innerHTML = state.design.evidenceRegistry.map((item) => `<article class="evidence-row"><div><strong>${escapeHtml(item.relation)}</strong><p>${escapeHtml(item.note)}</p><small>${escapeHtml(item.evidence)}</small></div><span class="badge badge-${item.status.toLowerCase()}">${escapeHtml(item.label)}</span></article>`).join('');
}

function renderAll() {
  renderLensTabs(); renderLensHeader(); renderSituations(); renderCharacters(); renderEvidence(); renderDiagnostic();
  $('view-toggle').disabled = !state.result || (!state.saved && !state.labView);
  $('view-toggle').textContent = state.labView ? 'Character View' : (state.result && !state.saved ? 'Lab View（評価保存後）' : 'Lab View');
  if (state.result) renderHandfeel();
}

async function generate() {
  const button = $('generate');
  button.disabled = true; button.textContent = '生成中…'; $('error').classList.add('hidden');
  try {
    const response = await fetch('/api/run', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lensId: state.lensId, variantId: state.variantId, scenarioId: state.scenarioId })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? '生成に失敗しました。');
    state.result = payload;
    state.displayOrder = payload.results.map((item) => item.conditionId).sort(() => Math.random() - 0.5);
    state.ratings = { differenceStrength: null, naturalness: null, identification: null };
    state.saved = false; state.labView = false; state.labEverViewed = false; resetDiagnosticState();
    $('handfeel').classList.remove('hidden');
    $('run-meta').classList.remove('hidden');
    $('run-meta').innerHTML = `model: <code>${escapeHtml(payload.model)}</code> · ${payload.cacheHit ? 'cache hit / API費用なし' : 'live API'}${payload.usage ? ` · ${Number(payload.usage.totalTokens).toLocaleString()} tokens` : ''}`;
    renderAll();
  } catch (error) {
    $('error').textContent = error.message; $('error').classList.remove('hidden');
  } finally {
    button.disabled = false; button.textContent = '比較を生成';
  }
}

function loadRatings() {
  try { return JSON.parse(localStorage.getItem('aprl-character-app:ratings:v1') ?? '[]'); } catch { return []; }
}

function identificationResult() {
  const selectedIndex = state.ratings.identification === 'A' ? 0 : 1;
  const selectedConditionId = state.displayOrder[selectedIndex];
  return { selectedConditionId, correct: selectedConditionId === state.result.expectedConditionId };
}

function saveRatings() {
  if (state.saved) return;
  const ident = identificationResult();
  const rows = loadRatings();
  rows.push({
    id: crypto.randomUUID(), createdAt: new Date().toISOString(),
    lensId: state.result.lensId, variantId: state.result.variantId, scenarioId: state.result.scenario.id,
    situation: state.result.scenario.situation, model: state.result.model, cacheHit: state.result.cacheHit,
    displayOrder: state.displayOrder, differenceStrength: state.ratings.differenceStrength,
    naturalness: state.ratings.naturalness, identificationChoice: state.ratings.identification,
    identificationConditionId: ident.selectedConditionId, identificationCorrect: ident.correct,
    labViewedBeforeSave: state.labEverViewed
  });
  localStorage.setItem('aprl-character-app:ratings:v1', JSON.stringify(rows));
  state.saved = true; renderAll();
}

function exportRatings() {
  const blob = new Blob([JSON.stringify(loadRatings(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = `aprl-character-app-handfeel-${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
}

$('generate').addEventListener('click', generate);
$('view-toggle').addEventListener('click', () => {
  if (!state.result || !state.saved) return;
  state.labView = !state.labView;
  if (state.labView) state.labEverViewed = true;
  renderAll();
});
$('save-rating').addEventListener('click', saveRatings);
$('export-ratings').addEventListener('click', exportRatings);
$('save-diagnostic').addEventListener('click', saveDiagnostic);
$('export-diagnostics').addEventListener('click', exportDiagnostics);

async function init() {
  try {
    const response = await fetch('/api/design');
    state.design = await response.json();
    state.scenarioId = currentVariant().scenarios[0].id;
    renderAll();
  } catch {
    $('error').textContent = 'MVP設計データを読み込めませんでした。サーバーを再起動してください。';
    $('error').classList.remove('hidden');
  }
}

init();
