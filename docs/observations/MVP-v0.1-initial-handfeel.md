# MVP v0.1 初回手触り確認

> Date: 2026-08-16  
> Scope: APRL Character App MVP v0.1 — Evidence Lenses

## Purpose

APRLで実験的に支持された／一部支持されたCharacter内部状態の違いが、人間にとって知覚可能なCharacter差として感じられるかを、MVP上で初回確認した記録。

本記録は研究実験のconfirmatory PASS / FAILではなく、Character Appにおける手触り確認の観察記録として扱う。

## Summary

| Lens | Research evidence | Initial handfeel | App-side interpretation |
|---|---|---|---|
| Temperament → Perception | PF-EXP-0001 pilot-002：一部支持 | **保留 / 改善対象** | 自然言語としてのPerceptionには差を感じられる一方、Opportunity / Dangerの定量値および大小関係に違和感が残った |
| Values & Beliefs → Experience | PF-EXP-0005 pilot-002：支持 | **暫定的に違和感なし** | VB差によるExperience meaningの違いは、初回確認では自然に知覚できた |
| Trust within Relationship → Experience | PF-EXP-0006 pilot-001：支持 | **暫定的に違和感なし** | Trust差によるExperience meaningの違いは、初回確認では自然に知覚できた |

## Temperament Lens

### Observation

Perceptionの自然言語表現から受ける印象と、同じ生成結果に含まれるOpportunity / Dangerの0–4定量値、とくに大小関係が一致しないと感じるケースがあった。

代表例は Issue #1 および `OBS-0001-semantic-score-consistency.md` に記録する。

### Current interpretation

現時点では、これをTemperamentモデルそのものへの反証とは扱わない。

まずは、

- 自然言語として生成されたPerception
- LLMが同時に出力したOpportunity / Danger自己評定値
- 人間が自然言語から知覚したOpportunity / Danger

の間の **Semantic-Score Consistency** の問題として追跡する。

また、High / Low条件に合わせるためだけにOpportunity / Dangerの大小関係をプロンプトで強制しない。期待結果を生成側へ埋め込むと、手触り確認としての意味が弱くなるためである。

## Values & Beliefs Lens

初回の手触り確認では、VB差によりExperience meaningが変わることに顕著な違和感はなかった。

これはCharacter App上の初回観察であり、人間一般への一般化や研究上の追加証拠を意味しない。

## Relationship Lens

初回の手触り確認では、Trust状態の差によりExperience meaningが変わることに顕著な違和感はなかった。

Relationshipの自然な形成・更新機構はまだ実装・検証していないため、本観察は既存Trust状態からExperienceへの作用だけを対象とする。

## Next actions

1. Temperament LensではDiagnostic Observationを継続し、LLM scoreとHuman scoreのズレを蓄積する。
2. Values & Beliefs / Relationship Lensは現行MVPの表現を維持し、追加の違和感が出た場合のみ観察記録を追加する。
3. Opportunity / Danger定量値を通常UIでどの程度強く見せるべきかは、Semantic-Score Consistencyの観察が複数件集まってから判断する。
4. 本記録はAPRL研究実験の判定とは分離して管理する。

## Status

- Values & Beliefs Lens: initial handfeel **provisionally acceptable**
- Relationship Lens: initial handfeel **provisionally acceptable**
- Temperament Lens: initial handfeel **pending diagnostic follow-up**
