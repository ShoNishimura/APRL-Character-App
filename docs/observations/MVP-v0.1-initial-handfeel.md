# MVP v0.1 初回手触り確認

> Date: 2026-08-16  
> Scope: APRL Character App MVP v0.1 — Evidence Lenses

## Purpose

APRLで実験的に支持された／一部支持されたCharacter内部状態の違いが、人間にとって知覚可能なCharacter差として感じられるかを、MVP上で初回確認した記録。

本記録は研究実験のconfirmatory PASS / FAILではなく、Character Appにおける手触り確認の観察記録として扱う。

## Evaluation set

初回集計では、Blind Handfeel保存後にLab Viewを開き、その後Diagnostic Observationを保存した **12ケース**を対応セットとして扱う。

- Temperament / Seeking Reactivity: 3ケース
- Temperament / Negative Affectivity: 3ケース
- Values & Beliefs: 3ケース
- Relationship / Trust: 3ケース

Raw Handfeel JSONには、この評価順序を導入する前の試行や追加試行も含まれる。これらは一次記録として残すが、以下の集計には含めない。

Raw data:

- `data/handfeel/aprl-character-app-handfeel-2026-08-16.json`
- `data/diagnostics/aprl-character-app-diagnostics-2026-08-16.json`

## Results

| Lens | n | Character差の強さ 平均 / 5 | 人の違いとしての自然さ 平均 / 5 | 条件識別 | Semantic-Score mismatch | Initial interpretation |
|---|---:|---:|---:|---:|---:|---|
| Temperament / Seeking | 3 | 4.67 | 4.00 | 3 / 3 | **3 / 3** | Character差は知覚できたが、Opportunity / Danger定量表現には全ケースで違和感 |
| Temperament / Negative Affectivity | 3 | 4.67 | 4.00 | 3 / 3 | **2 / 3** | Character差は知覚できたが、定量表現には一部ケースで違和感 |
| Values & Beliefs → Experience | 3 | 5.00 | 5.00 | 3 / 3 | 0 / 3 | VB差によるExperience meaningの違いを自然に知覚でき、顕著な定量表現上の違和感なし |
| Trust within Relationship → Experience | 3 | 5.00 | 4.33 | 3 / 3 | 0 / 3 | Trust差によるExperience meaningの違いを自然に知覚でき、顕著な定量表現上の違和感なし |

12ケース全体では、条件識別は **12 / 12**、Character差の強さ平均は **4.83 / 5**、人の違いとしての自然さ平均は **4.33 / 5** だった。

## Temperament Lens

### Handfeel

Seeking / Negative Affectivityともに、3ケースすべてで操作条件を正しく識別できた。Character差の強さは両variantとも平均4.67 / 5、自然さは平均4.00 / 5であり、自然言語としてのPerception差そのものは初回確認では明瞭に知覚された。

### Diagnostic observation

一方、Perceptionの自然言語表現から受ける印象と、同じ生成結果に含まれるOpportunity / Dangerの0–4定量値の間には不整合感が残った。

- Seeking: 3 / 3 mismatch
- Negative Affectivity: 2 / 3 mismatch
- Temperament合計: **5 / 6 mismatch**

特にSeekingでは3ケースすべてでLLM自己評定が `Opportunity = 0 / Danger = 0` だった一方、S High側の自然言語は「新鮮な面白さ」「新しい可能性」「わくわく感」などOpportunity方向のsalienceを明確に表現していた。人間再評定のS High Opportunityはそれぞれ **2 / 4、2 / 4、3 / 4** だった。

Negative Affectivityでも、例えば「不慣れさと失敗への不安が目立つ」という自然言語に対し、LLM自己評定が `Opportunity 2 / Danger 1`、人間再評定が `Opportunity 0 / Danger 3` となるケースがあった。

この結果から、現時点では **TemperamentによるCharacter差の手触り** と **Opportunity / Dangerによる定量表現の妥当性** を分けて扱う。

### Current interpretation

現時点では、この不整合をTemperamentモデルそのものへの反証とは扱わない。

まずは、

- 自然言語として生成されたPerception
- LLMが同時に出力したOpportunity / Danger自己評定値
- 人間が自然言語から知覚したOpportunity / Danger

の間の **Semantic-Score Consistency** の問題として追跡する。

また、High / Low条件に合わせるためだけにOpportunity / Dangerの大小関係をプロンプトで強制しない。期待結果を生成側へ埋め込むと、手触り確認としての意味が弱くなるためである。

詳細は Issue #1 および `OBS-0001-semantic-score-consistency.md` に記録する。

## Values & Beliefs Lens

3ケースすべてで条件を正しく識別し、Character差の強さ・自然さはいずれも平均5.00 / 5だった。Diagnostic Observationでも3ケースすべて `mismatch = false` だった。

初回の手触り確認では、VB差によりExperience meaningが変わることに顕著な違和感はなかった。

これはCharacter App上の初回観察であり、人間一般への一般化や研究上の追加証拠を意味しない。

## Relationship Lens

3ケースすべてで条件を正しく識別し、Character差の強さは平均5.00 / 5、自然さは平均4.33 / 5だった。Diagnostic Observationでも3ケースすべて `mismatch = false` だった。

初回の手触り確認では、Trust状態の差によりExperience meaningが変わることに顕著な違和感はなかった。

Relationshipの自然な形成・更新機構はまだ実装・検証していないため、本観察は既存Trust状態からExperienceへの作用だけを対象とする。

## Next actions

1. Temperament LensではDiagnostic Observationを継続し、LLM scoreとHuman scoreのズレを蓄積する。
2. Seekingで観察された `Opportunity = 0 / Danger = 0` の再現性について、キャッシュ済み結果固有か新規生成でも生じるかを切り分ける。
3. Values & Beliefs / Relationship Lensは現行MVPの表現を維持し、追加の違和感が出た場合に観察記録を追加する。
4. Opportunity / Dangerの表示・評価方式は、Semantic-Score Consistencyの追加観察後に別Issueで検討する。
5. 本記録はAPRL研究実験の判定とは分離して管理する。

## Status

- Values & Beliefs Lens: initial handfeel **provisionally acceptable**
- Relationship Lens: initial handfeel **provisionally acceptable**
- Temperament Lens — natural-language Character difference: **provisionally acceptable**
- Temperament Lens — Opportunity / Danger quantitative representation: **pending diagnostic follow-up**
