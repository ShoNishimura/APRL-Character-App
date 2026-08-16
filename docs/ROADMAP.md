# Roadmap

アプリのバージョンは機能都合ではなく、APRLの実験エビデンスと手触り評価に追従する。

## v0.1 — Evidence Lenses（今回）

**Evidence**
- Temperament → Perception：一部支持（PF-EXP-0001 pilot-002）
- Values & Beliefs → Experience：支持（PF-EXP-0005 pilot-002）
- Trust within Relationship → Experience：支持（PF-EXP-0006 pilot-001）

**Experience**
- Temperament / VB / RelationshipをLensとして個別に比較
- 条件ラベルを伏せたCharacter View
- Lab Viewで研究変数を確認
- Difference Strength / Character Naturalness / Blind Identificationを保存
- model IDと評価を一緒に保存

**入れない**
- Response
- VB / Relationship更新
- Chat
- Biography

## v0.2 — Integrated Character

**Gate**：v0.1のLensで、支持された差が人間に知覚可能であることを確認する。

**Add**：支持済みのTemperament / VB / Trustを一人のCharacter profileへ統合し、複数Situationをまたいでも「同じ人」と感じるかを確認する。

ここで初めて次を本格評価する。

- Character Consistency
- Character Differentiation
- Character Identity Consistency across LLMs

状態はまだ自動更新しない。

## v0.3 — Response

**Gate**：`Experience + Situation → Response` の必要な関係が実験で支持されること。

**Add**：Action / Intensity / Latency。会話UIはResponse研究の結果と整合する場合に候補とする。

## v0.4 — Personality Formation

**Gate**：VB更新機構が実験で支持されること。

**Add**：Experience / Response / OutcomeによるVBの時間更新。「この人が変わった」と感じるFormation handfeelを測る。

## v0.5 — Relationship Formation / Multi-character

**Gate**：Relationship更新機構が支持されること。

**Add**：Character A ↔ Character B ↔ User、非対称Relationship、Character間相互作用。

## v0.6 — Biography

**Gate**：人格・関係の形成循環が最低限成立すること。

**Add**：Situation / Perception / Experience / Response / Outcome / state changesの時間軌跡。「なぜ今この人なのか」を遡るBiography View。

## Character App scope boundary

APRL-Character-Appは当面、以下に閉じる。

```text
Character formation
      ↓
Character interaction / Relationship formation
      ↓
Biography
```

Creator / Communicator / Audience / ResonanceはAPRL Framework上では重要だが、このアプリの現行スコープには入れない。必要になった時点で別アプリまたは別モードとして再判断する。

## Model-change quality gates

1. **Semantic compatibility** — 固定SituationでPerception / Experienceの意味方向が維持される
2. **Character naturalness** — 差が機械的なラベル反映ではなく人物差として感じられる
3. **Character differentiation** — 人物間の識別感が劣化しない
4. **Character Identity Consistency** — LLMを替えても同じCharacterだと感じられる
5. **Cost** — 1〜4を満たす構成のうち低コスト側を採用

コストは品質Gateを通過した後の最適化対象とする。
