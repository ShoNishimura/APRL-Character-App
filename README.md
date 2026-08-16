# APRL Character App

> Characterの形成・相互作用・Biographyを、人間が体験・観察するためのアプリ。

研究正本・実験監査は [AI-Personality-Research-Lab](https://github.com/ShoNishimura/AI-Personality-Research-Lab) に置く。このリポジトリは、APRLで支持されたメカニズムをCharacterとして体験し、その「手触り」を確認するアプリだけを扱う。

## MVP v0.1 — Evidence Lenses

MVPの問いは次の一つ。

> **APRLで実験的に支持されたCharacter内部状態の違いは、人間にとって知覚可能なCharacter差として感じられるか。**

現在のMVPは3つのLensで、支持された関係を一つずつ比較する。

| Lens | 操作 | 観測 | Evidence |
|---|---|---|---|
| Temperament | SまたはNだけを変更 | Perception | PF-EXP-0001 pilot-002：**一部支持** |
| Values & Beliefs | VBだけを変更 | Experience | PF-EXP-0005 pilot-002：**支持** |
| Relationship | Trustだけを変更 | Experience | PF-EXP-0006 pilot-001：**支持** |

### まだ実装しない

- Experience → Response
- VBの自然な形成・更新
- Relationshipの自然な形成・更新
- Episodic Memoryによる形成
- Character同士の会話
- Biography生成

これらは「機能不足」ではなく、研究エビデンスの境界を守る仕様である。

## 3 Lens

### 1. Temperament Lens

同じSituationでTemperamentだけを変え、何がsalientになるかを比較する。

SとNを同時に動かさず、PF-EXP-0001で支持された主効果に合わせて別々に比較する。

- Seeking Reactivity：S High vs S Low（N固定）
- Negative Affectivity：N High vs N Low（S固定）

このLensでは**Perceptionだけ**を生成し、ExperienceやResponseへ先回りしない。

### 2. Values & Beliefs Lens

Situation / Perception / Relationshipを固定し、Values & Beliefsだけを変えてExperienceの意味を比較する。

- Learning / Improvement orientation
- Evaluation / Competence-protection orientation

### 3. Relationship Lens

Situation / Perception / target-neutral Values & Beliefsを固定し、特定相手へのTrust状態だけを変えてExperienceの意味を比較する。

- Trusting Relationship
- Distrustful Relationship

PF-EXP-0006が支持したのは **既存のTrust状態 → Experience** までであり、会話からTrustを更新する規則はまだ実装しない。

## 手触り確認

各比較は最初に条件ラベルを伏せたCharacter Viewで見る。

1. **Difference Strength** — A/Bの違いを感じるか（1〜5）
2. **Character Naturalness** — 文体差ではなく「人の違い」として自然に感じるか（1〜5）
3. **Blind Identification** — 支持された方向をA/Bから識別できるか

Lab Viewでは、操作した状態とPerception / Experienceの内訳を確認できる。Lab Viewを評価前に開いたかもローカル評価データに記録する。

将来のモデル変更では、同じ固定セットを使い、**LLMを替えても同じCharacterだと感じられるか（Character Identity Consistency）**を品質Gateにする。

## コスト最小化

- **1比較 = 最大1 LLM API call**：A/Bを1回で同時生成。
- **固定Situation**：各Lens 3例。研究境界を保ち、無駄な探索callを抑える。
- **ファイルキャッシュ**：同じLens / Situation / modelは再課金しない。
- **1日上限**：`MAX_DAILY_LIVE_CALLS`を超えるとアプリ側で停止。
- **短い構造化出力**：Lensに必要なPerceptionまたはExperienceだけを返す。
- **DBなし**：評価はブラウザ`localStorage`。
- **固定インフラなし**：ローカルPCで動作。
- **依存パッケージなし**：Node.js 22の標準機能のみ。
- **model交換可能**：`OPENAI_MODEL`だけで切り替える。

最小確認なら各Lens 1例ずつで**3 live calls**。全固定セットを一度ずつ確認しても、TemperamentのS/N両比較を含めて**12 live calls**である。

## 起動

Node.js 22+。

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env` に `OPENAI_API_KEY` を設定して保存する。

```powershell
npm start
```

またはnpmを使わず：

```powershell
node server/index.mjs
```

ブラウザで `http://127.0.0.1:8787` を開く。

## 設計原則

1. **Evidence before Feature** — 支持された／限定的に支持された関係だけを体験機構へ入れる。
2. **One mechanism at a time** — MVPでは操作変数を一つずつ変え、手触りの由来を曖昧にしない。
3. **Character state is not the LLM** — Character状態と研究根拠はモデルから独立させる。
4. **Model replaceability** — LLM固有処理をprovider境界へ閉じ込める。
5. **Meaning over wording** — 文言一致ではなくPerception / Experienceの意味方向を品質対象にする。
6. **Minimum Model First** — 必要になるまで概念とインフラを増やさない。

詳細：[Architecture](docs/ARCHITECTURE.md) / [Roadmap](docs/ROADMAP.md) / [Repository](docs/REPOSITORY.md)
