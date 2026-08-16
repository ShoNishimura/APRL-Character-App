# OBS-0001 — Semantic-Score Consistency

> Status: Open observation / exploratory  
> Scope: APRL Character App MVP v0.1  
> Lens: Temperament (Seeking / Negative Affectivity)

## Quality metric

**Semantic-Score Consistency**

> Characterの自然言語表現から人間が受け取る意味と、内部の定量表現が一致しているか。

## Initial trigger

最初の観察はNegative Affectivity / `new-method` で確認された。

### N High / S Low

- Surface: `不慣れさと失敗への不安が目立つ`
- Summary: `未知の方法に伴う不安や危うさが強く感じられる`
- LLM: Opportunity 2 / 4, Danger 1 / 4
- Human: Opportunity 0 / 4, Danger 3 / 4

### N Low / S Low

- Surface: `新しい方法の未知さが目に留まる`
- Summary: `新しさは感じられるが、機会としての魅力は控えめに映る`
- LLM: Opportunity 3 / 4, Danger 2 / 4
- Human: Opportunity 0 / 4, Danger 1 / 4

自然言語と同時生成されたOpportunity / Danger自己評定に意味的不整合が観察された。

## Initial diagnostic results

Blind HandfeelとDiagnostic Observationが対応する12ケースでは、

| Lens | n | mismatch |
|---|---:|---:|
| Temperament / Seeking | 3 | **3 / 3** |
| Temperament / Negative Affectivity | 3 | **2 / 3** |
| Values & Beliefs | 3 | 0 / 3 |
| Relationship / Trust | 3 | 0 / 3 |

Temperamentでは **5 / 6 mismatch** だった。

Blind Handfeelでは全12ケースで条件識別に成功しており、
Character差の自然言語表現と定量スコアを分けて扱う必要が生じた。

Raw:

- `data/diagnostics/aprl-character-app-diagnostics-2026-08-16.json`
- `data/handfeel/aprl-character-app-handfeel-2026-08-16.json`

## Follow-up 1 — Seeking fresh live retest

初回Seeking 3ケースはいずれも `cacheHit = true` だったため、
all-zero patternがキャッシュ済み生成結果固有かを切り分けた。

ローカルresponse cacheをバイパスし、
現行条件・Situation・promptを変更せず、

**3 Situation × 2反復 = 6 fresh live API calls**

を実行した。

結果:

- exact all-zero pair: **5 / 6**
- S HighがO0 / D0: **5 / 6**
- いずれかがO0 / D0: **5 / 6**

したがってSeekingのall-zero patternは、
**ローカルresponse cache固有ではない**。

さらに残る1ケースでも、

- S High: `未知の楽しさがありそうな誘いに感じる`
  - O0 / D2
- S Low: `突然で、馴染みのない誘いが目につく`
  - O3 / D2

となり、自然言語から受け取るOpportunity方向と
自己評定値の方向が逆転した。

Raw:

- `data/diagnostics/aprl-character-app-seeking-live-retest-2026-08-16.json`

## Follow-up 2 — Blind independent rescoring

fresh live retestで得られた12個のPerception自然言語を、
別API呼び出しでblind再採点した。

Evaluatorには以下を提示していない。

- S High / S Low
- Temperament値
- 元Opportunity / Danger
- 仮説
- 期待順序

Opportunity / Dangerについては0–4の絶対尺度だけを定義した。

結果:

| Metric | Result |
|---|---:|
| Items | 12 |
| Original all-zero | 10 |
| All-zero → Evaluator non-zero | **10 / 10** |
| Original O=0 → Evaluator O>=2 | **6 / 11** |
| Originalとの完全一致 | **0 / 12** |
| Hidden S High Opportunity mean | **2.83 / 4** |
| Hidden S Low Opportunity mean | **0.17 / 4** |

代表例:

| Perception | Original | Blind evaluator |
|---|---:|---:|
| `新しい可能性が目を引く` | O0 / D0 | **O3 / D0** |
| `新しい可能性が開けている感じがする` | O0 / D0 | **O3 / D0** |
| `思いがけない探索の機会が目立つ` | O0 / D0 | **O3 / D0** |
| `不慣れな方法であることが気になる` | O0 / D0 | **O0 / D2** |

conditionを見せていないblind再採点でも、
自然言語表現からSeeking方向のOpportunity差が再構成された。

Raw:

- `data/diagnostics/aprl-character-app-seeking-blind-evaluator-2026-08-16.json`

## Current interpretation

現時点では次のように切り分ける。

### Natural-language Perception

SeekingによるCharacter差は、

- Blind Handfeelで識別可能だった
- fresh liveでも自然言語上に繰り返し現れた
- condition blindの別EvaluatorでもOpportunity差として再構成された

したがってCharacter App上では、
**Seekingによる自然言語Perception差そのものは知覚可能**である。

### Opportunity / Danger self-rating

一方、自然言語と同一生成で出力している
Opportunity / Danger自己評定は、

- all-zeroをfresh liveでも繰り返す
- 自然言語と逆方向になる場合がある
- blind再採点と0 / 12しか完全一致しない

ため、Semantic-Score Consistencyに明確な問題がある。

### Cache

fresh live 6回中5回でexact all-zero pairが再現したため、
ローカルresponse cacheはall-zero patternの原因ではない。

## Interpretation boundary

この観察だけでPF-EXP-0001を再判定しない。

特に今回のblind EvaluatorはGeneratorとは別API呼び出しであり、
condition情報も隠しているが、

**Generator / Evaluatorはいずれも `gpt-5.6-luna`**

である。

したがって同一モデル系の意味的一貫性が結果を強めた可能性は残る。
blind evaluator score自体をground truthとは扱わない。

## Current hypothesis

現時点で優先度が高い原因候補は、

1. 自然言語生成とOpportunity / Danger自己評定を
   同一LLM呼び出しで同時生成していること
2. Opportunity / Dangerの0–4尺度が生成prompt内で
   十分operationalizeされていないこと

である。

High / Lowに合わせるために、
期待する数値関係を生成promptへ埋め込まない。

## Next questions

1. 数値評価をGeneratorから分離するとSemantic-Score Consistencyは改善するか
2. Generatorとは異なるEvaluator modelでも同じ傾向が再現するか
3. Human scoreと独立Evaluator scoreの一致度はどの程度か
4. Opportunity / DangerをCharacter内部状態として扱うべきか、
   それとも観察・評価のための補助指標として扱うべきか

## Current app response

現時点では生成promptを期待結果へ合わせて修正しない。

まず数値評価を生成から分離する方式を比較し、
その結果を見てLab View上のOpportunity / Dangerの扱いを再検討する。
