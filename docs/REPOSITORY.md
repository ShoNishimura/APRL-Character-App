# Repository proposal

推奨：`ShoNishimura/APRL-Character-App`

研究repoから分離する。

```text
APRL-Character-App/
├─ public/
│  ├─ index.html
│  ├─ app.js
│  └─ styles.css
├─ server/
│  ├─ index.mjs
│  ├─ openai-provider.mjs
│  ├─ storage.mjs
│  └─ study-design.mjs
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ ROADMAP.md
│  └─ REPOSITORY.md
├─ scripts/
│  └─ create-repository.ps1
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

## Why separate

1. 研究実験のGate / threshold / audit履歴とUI実装の変更頻度を混ぜない。
2. providerやhosting変更が研究正本へ影響しない。
3. アプリの評価データと研究のconfirmatory dataを混在させない。
4. `Character`という境界を名前で明確にし、Creator / Audience等とのスコープ混同を避ける。

## Governance

1. 研究repoでExperimentを実行する。
2. 支持された関係だけをEvidence Registryへ反映する。
3. Character AppへLens / Featureとして追加する。
4. 人間の手触りを評価する。
5. model変更時はCharacter Identity Consistencyを再確認する。

アプリ側の結果は研究実験のPASS/FAILを事後的に書き換えない。

## Remote repository creation

Windows上でGitHub CLIが使える場合：

```powershell
.\scripts\create-repository.ps1
```

public / privateはスクリプト実行時に選択する。既存のGit author設定を勝手に上書きしない。
