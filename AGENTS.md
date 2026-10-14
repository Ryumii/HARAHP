# AGENTS.md

Advocates（advocates.jp）の公式サイトを作るプロジェクトです。運営は MYK合同会社です。このフォルダで作業する AI エージェント（GitHub Copilot、Codex、Cursor など）は、このファイルのルールに従います。

## 現状と前提

- ドメイン advocates.jp は取得済みです。技術スタックと公開先は未定です。決まったらこの節に追記します。
- お問い合わせフォームの送信先は Contact@advocates.jp です。
- GitHub はアカウント Ryumii（miyakeryuta1211@gmail.com）だけを使います。リポジトリは https://github.com/Ryumii/advocates.jp （非公開）です。このリポジトリの git 設定で、コミットの作成者をこのアドレスに、github.com の認証を gh（Ryumii）に固定しています。ほかのアカウントでコミット、プッシュ、リポジトリの作成をしません。
- ユーザー向けの出力（返答、レビュー、レポート）とサイトの本文は日本語で書きます。スキルが英語での出力を指定していても同じです。コード、コマンド、パス、エラーメッセージは原文のまま書きます。
- 作業環境は Windows と PowerShell です。パスに空白と日本語を含むため、コマンドではパスを引用符で囲みます。
- フォルダは OneDrive で同期されます。シンボリックリンクは作りません。npm の依存を入れると `node_modules` も同期の対象になるため、最初に入れるときはユーザーに確認します。

## フォルダ構成

| パス | 内容 |
| --- | --- |
| `.github/copilot-instructions.md` | Copilot 用の入口。ルールの本体はこのファイル |
| `.agents/skills/` | エージェントスキル。`npx skills` で管理し、直接編集しない |
| `skills-lock.json` | スキルの取得元とハッシュ。復元と更新に使う |
| `.taste-skill/` | `design-taste-frontend` の作業ファイル（スクリーンショットなど） |
| `docs/content-plan.md` | サイトに載せる内容の検討資料（他社サイトの調査と、載せる内容の案） |

## 常に守るルール

### 返答は caveman

チャットの返答は `caveman` スキルに従い、短く書きます。結論を先に書き、挨拶、前置き、まとめの繰り返しは書きません。技術的な事実、否定、数値は削りません。

- 日本語のまま文体だけを短くします。助詞は削りません。
- セキュリティの警告、取り消せない操作の確認、順番が大事な手順、ユーザーへの質問は、省略せずに書きます。
- ファイルに残す文章（コード、コメント、ドキュメント、サイトの本文、コミットメッセージ）には使いません。
- `/ultracave` でさらに短く、`/megacave` で漢文調になります。「stop caveman」で元に戻ります。「normal mode」は caveman と ponytail の両方を止めます。

### コードは ponytail（full）

コードを書く、直す、見直すときは `ponytail` スキルに従います。レベルは `/ponytail lite`、`/ponytail ultra` で変えられます。

- 頼まれていない機能、設定、抽象化は作りません。
- 既存のコード、標準ライブラリやブラウザの機能、導入済みの依存の順に使えるものを探し、足りない分だけ書きます。数行で済む処理のために依存を追加しません。
- 入力の検証、データを失わないためのエラー処理、セキュリティ、アクセシビリティは省きません。
- 分岐やループを含むロジックには、小さなテストか assert による確認を1つ付けます。
- 制限を承知で簡略化した箇所には `shortcut: <制限>, <見直す条件>` の形でコメントを残します。
- 返答の最後に、省いたこと、確認していないこと、リスクを1〜2行で書きます。

### 見た目は taste-skill

ページの見た目は taste-skill のスキルで決めます。実装の量と依存の追加は ponytail のルールで判断します。

- 新しいページ: `design-taste-frontend`
- 既存ページの改善: `redesign-existing-projects`
- 方向性が決まっている場合: `minimalist-ui`、`high-end-visual-design`、`industrial-brutalist-ui`
- ユーザーが名前を挙げたときだけ使う: `gpt-taste`、`stitch-design-taste`、`full-output-enforcement`
- 画像生成ツールがあり、ユーザーが名前を挙げたときだけ使う: `image-to-code`、`imagegen-frontend-web`、`imagegen-frontend-mobile`、`brandkit`

### 日本語の文章は yomiyasu

ファイルに残す日本語の文章（サイトの本文、README、手順書など）は、書き終えたあとに `yomiyasu` スキルで推敲します。何を伝えるかは taste-skill の手順で決め、言い回しを yomiyasu で整えます。推敲では意味、条件、数値を変えず、元の文章にない情報を足しません。チャットの返答には使いません。

## その他のスキル

- 変更のレビュー: `ponytail-review`（`caveman-review` は入れていません）
- リポジトリ全体の点検: `ponytail-audit`
- `shortcut:` コメントの一覧: `ponytail-debt`
- コミットメッセージ: `caveman-commit`
- 使い方の確認: `ponytail-help`、`caveman-help`

## 確認

- 変更したら実際に動かして確かめます。ページはブラウザで開き、スマートフォンと PC の幅で表示を確認します。
- `design-taste-frontend` を使ったときは、手順にあるブラウザ検査（`scripts/inspect.mjs`）の FAIL をすべて直します。
- ファイルに残す日本語の文章は `python -B ".agents/skills/yomiyasu/scripts/yomiyasu_lint.py" <ファイル>` でも点検します（`-B` はスキルのフォルダにキャッシュを作らないための指定です）。

## スキルの管理

`.agents/skills/` の中身は更新で上書きされます。スキルの動きを変えたいときは、このファイルにルールを書き足します。

- 追加: `npx skills add <owner/repo> -a github-copilot --copy`
- 更新: `npx skills update -p -y`
- 復元: `npx skills experimental_install`（`skills-lock.json` から `.agents/skills/` を作り直します）

ponytail と caveman のスキルは、取得元に同じ名前のスキルが複数あるため、`update` では更新されずに飛ばされます。この2つは次の `add` を再実行して上書きします。

```powershell
npx skills add DietrichGebert/ponytail -a github-copilot -s "*" -y --copy
npx skills add JuliusBrussee/caveman -a github-copilot -s caveman ultracave megacave caveman-commit caveman-help -y --copy
```
