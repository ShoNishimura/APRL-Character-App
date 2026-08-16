# OBS-0001 — Semantic-Score Consistency

> Status: Open observation / exploratory
> Scope: APRL Character App MVP v0.1
> Lens: Temperament / Negative Affectivity

## Observation

Situation:

> 慣れていない新しい方法を試せる機会が提示された。

`gpt-5.6-luna` で生成した比較において、自然言語から人間が受け取るPerceptionと、同一生成結果に含まれるOpportunity / Dangerの自己評定スコアが整合しないように感じられるケースを確認した。

### Character A — N High / S Low

- Surface: `不慣れさと失敗への不安が目立つ`
- Summary: `未知の方法に伴う不安や危うさが強く感じられる`
- LLM score: Opportunity 2 / 4, Danger 1 / 4

### Character B — N Low / S Low

- Surface: `新しい方法の未知さが目に留まる`
- Summary: `新しさは感じられるが、機会としての魅力は控えめに映る`
- LLM score: Opportunity 3 / 4, Danger 2 / 4

## Human observation

- AのDangerはBより高く感じられる。
- Aでは自然言語上、Danger > Opportunityに感じられる。
- 一方、LLM自己評定ではAのDangerがBより低く、AでもOpportunity > Dangerとなっている。

## Interpretation boundary

この観察だけでPF-EXP-0001の研究結果を再判定しない。現行MVPでは自然言語表現と0–4の定量値を同じLLM呼び出しで同時生成しているため、まずはCharacter App側の測定・表現整合性の問題として扱う。

## Quality metric candidate

**Semantic-Score Consistency**

> Characterの自然言語表現から人間が受け取る意味と、内部の定量表現が一致しているか。

## App response

MVPに `Diagnostic Observation` を追加する。評価順序を次のように分離する。

`Character View → Blind Handfeel → 保存 → Lab View → Diagnostic Observation`

Diagnostic Observationでは、定量値への違和感の有無、Temperament Lensでは人間によるOpportunity / Danger再評定、自由記述コメントをローカル保存する。

スコアを直ちに人間評価へ合わせて修正せず、不一致事例を蓄積してから評価方式の見直しを判断する。
