# OBS-0001 — Semantic-Score Consistency

> Status: Open observation / exploratory
> Scope: APRL Character App MVP v0.1
> Lens: Temperament (Seeking / Negative Affectivity)

## Quality metric

**Semantic-Score Consistency**

> Characterの自然言語表現から人間が受け取る意味と、内部の定量表現が一致しているか。

## Initial trigger

最初の観察はNegative Affectivity / `new-method` で確認された。

Situation:

> 慣れていない新しい方法を試せる機会が提示された。

### Character A — N High / S Low

- Surface: `不慣れさと失敗への不安が目立つ`
- Summary: `未知の方法に伴う不安や危うさが強く感じられる`
- LLM score: Opportunity 2 / 4, Danger 1 / 4
- Human score: Opportunity 0 / 4, Danger 3 / 4

### Character B — N Low / S Low

- Surface: `新しい方法の未知さが目に留まる`
- Summary: `新しさは感じられるが、機会としての魅力は控えめに映る`
- LLM score: Opportunity 3 / 4, Danger 2 / 4
- Human score: Opportunity 0 / 4, Danger 1 / 4

人間の知覚ではAのDangerはBより高く、AではDanger > Opportunityに感じられた。一方、LLM自己評定ではAのDangerがBより低く、AでもOpportunity > Dangerだった。

## Diagnostic Observation implementation

MVPに `Diagnostic Observation` を追加し、評価順序を次のように分離した。

`Character View → Blind Handfeel → 保存 → Lab View → Diagnostic Observation`

Diagnostic Observationでは、定量値への違和感の有無、Temperament Lensでは人間によるOpportunity / Danger再評定、自由記述コメントをローカル保存する。

Raw data:

- `data/handfeel/aprl-character-app-handfeel-2026-08-16.json`
- `data/diagnostics/aprl-character-app-diagnostics-2026-08-16.json`

## Initial diagnostic results

Blind HandfeelとDiagnostic Observationが対応する12ケースを初回評価セットとして集計した。

| Lens | n | mismatch | mismatch rate |
|---|---:|---:|---:|
| Temperament / Seeking | 3 | **3** | **100%** |
| Temperament / Negative Affectivity | 3 | **2** | **67%** |
| Values & Beliefs | 3 | 0 | 0% |
| Relationship / Trust | 3 | 0 | 0% |

Temperamentだけを見ると **5 / 6** でSemantic-Score mismatchが記録された。

### Seeking

Seekingでは3ケースすべてで、LLM自己評定がA/Bともに `Opportunity = 0 / Danger = 0` だった。

一方、S High側の自然言語には以下のようなOpportunity方向のsalienceが明確に現れていた。

- `未知の活動への新鮮な面白さが目立つ`
- `新しい可能性が目を引く`
- `未知の場所へのわくわく感が目立つ`

S High側に対する人間のOpportunity再評定はそれぞれ **2 / 4、2 / 4、3 / 4** だった。

したがって、少なくともこの初回セットでは、Seekingによる自然言語上のPerception差は表現されている一方、Opportunity / Danger自己評定はその差を反映できていない。

なお、Seekingの3ケースはいずれも `cacheHit = true` だったため、キャッシュ済み生成結果固有の問題か、新規生成でも再現する問題かは未分離である。

### Negative Affectivity

Negative Affectivityでは3ケース中2ケースでmismatchが記録された。

- `new-activity`: mismatchなし。N HighはLLM score `Opportunity 2 / Danger 4`、N Lowは `Opportunity 3 / Danger 1` で、自然言語との顕著な違和感はなかった。
- `new-method`: mismatchあり。N HighのLLM score `Opportunity 2 / Danger 1` に対し、人間再評定は `Opportunity 0 / Danger 3`。
- `unknown-place`: mismatchあり。N Highの自然言語は未知の場所と予定外時間への不安を強く表現したが、LLM scoreは `Opportunity 0 / Danger 0`。人間再評定は `Opportunity 1 / Danger 3`。

数値化が常に破綻するわけではないが、自然言語と定量値が一致しないケースが複数再現した。

## Relation to handfeel

同じ12ケースのBlind Handfeelでは条件識別が **12 / 12** で成功した。

TemperamentでもSeeking / Negative Affectivityともに3 / 3で条件識別でき、Character差の強さ平均は両variantとも4.67 / 5、自然さ平均は4.00 / 5だった。

このため現時点では、

> **Character差の自然言語表現そのものは知覚可能だが、Temperament LensのOpportunity / Danger定量表現には整合性上の問題がある**

と切り分ける。

詳細は `MVP-v0.1-initial-handfeel.md` を参照する。

## Interpretation boundary

この観察だけでPF-EXP-0001の研究結果を再判定しない。

現行MVPでは自然言語表現と0–4の定量値を同じLLM呼び出しで生成しているため、まずはCharacter App側の測定・表現整合性の問題として扱う。

また、VBおよびRelationshipで今回mismatchが0 / 3だったことは、それらの定量指標一般の妥当性を証明するものではない。あくまで今回の初回手触り確認で顕著な違和感が記録されなかったことを示す。

## Next questions

1. Seekingの `Opportunity = 0 / Danger = 0` はキャッシュ済み結果固有か、新規生成でも再現するか。
2. 自然言語生成と定量自己評定を同一LLM呼び出しで行うことが不整合の原因か。
3. Opportunity / Dangerのoperationalization自体に曖昧さがあるか。
4. 定量値を別Evaluatorで評価した場合、人間評定との整合性は改善するか。
5. 通常のLab ViewでOpportunity / Dangerをどの程度強く表示すべきか。

## Current app response

スコアを直ちに人間評価へ合わせて修正せず、不一致事例を蓄積する。

High / Low条件に一致するよう大小関係をプロンプトで強制しない。期待結果を生成側へ埋め込まず、原因の切り分けと評価方式の見直しを別Issueで検討する。
