# Architecture

## Repository boundary

- **AI-Personality-Research-Lab**：Research Framework / Research Model / Experiment / Gate / Auditの正本
- **APRL-Character-App**：Characterの形成・相互作用・Biographyを、人間が体験・観察するアプリ

研究repoが「何を支持できるか」を決め、Character Appは「それが人間にCharacter差として感じられるか」を観測する。

## MVP v0.1

```text
Browser (plain HTML/CSS/JS)
  ├─ 3 Evidence Lenses
  │    ├─ Temperament → Perception
  │    ├─ Values & Beliefs → Experience
  │    └─ Trust(Relationship) → Experience
  ├─ Character View / Lab View
  ├─ Blind identification
  ├─ Handfeel ratings (localStorage)
  └─ JSON export
            │
            ▼
Local Node API (standard library only)
  ├─ canonical fixed study design
  ├─ daily call guard
  ├─ content-addressed file cache
  └─ provider boundary
            │
            ▼
OpenAI Responses API
```

## Evidence isolation

### Temperament Lens

```text
Same Situation
      │
      ├─ S High vs S Low (N fixed)
      └─ N High vs N Low (S fixed)
             ↓
         Perception only
```

S/Nを同時に変更しない。PF-EXP-0001の主効果をアプリ上でも分離する。

### Values & Beliefs Lens

```text
Same Situation
Same fixed Perception
Neutral Relationship
      │
      └─ VB only changes
             ↓
          Experience
```

### Relationship Lens

```text
Same Situation
Same fixed Perception
Target-neutral VB
      │
      └─ Trust only changes
             ↓
          Experience
```

TrustからResponseを生成したり、Experience後にTrustを更新したりしない。

## Model-independent boundary

LLMを替えても次は変更しない。

- Evidence Registry
- Lens / condition definitions
- fixed Situation set
- fixed Perception set
- Perception / Experience output contracts
- Handfeel evaluation schema
- Character Identity Consistencyの評価方針

```text
Provider
  ├─ OpenAI
  ├─ Gemini   (future)
  └─ Local    (future)
```

## Cost boundary

1回の比較で2条件を同時生成する。

```text
cache key = hash(app version + model + Lens + fixed design)
```

- 最小確認：3 Lens × 1例 = 3 calls
- 固定セット全確認：Temperament 2軸×3例 + VB 3例 + Relationship 3例 = 12 calls
- cache hit：0 calls

## Research guardrail

MVP v0.1では以下を実装しない。

- Response生成
- VB自動更新
- Relationship自動更新
- RelationshipをTrust一軸で十分だと仮定すること
- Episodic Memoryによる形成
- Chat / multi-character interaction
- Biography生成

新しい機構は、研究repoで支持された後にCharacter Appへ昇格させる。
