# OAPYS

[English](README.md) | **日本語**

**Offensive Attack to Protect Your Systems** の公開 frontend。Next.js App Router / TypeScript を使用します。
backend は独立した private リポジトリで管理し、このリポジトリには含めません。

## ローカル開発

Node.js 24 と npm を使用します。`.node-version` / `.nvmrc` に初期環境のバージョンを記録しています。

```sh
cp .env.example .env.local
npm ci
npm run dev
```

http://localhost:3000 を開きます。backend がなくてもグラフ画面を操作できます。backend の接続状態はワークスペース設定から確認できます。
`GET /api/health` は backend 接続時に 200、未接続時に 503 を返します。

```sh
npm run lint
npm run typecheck
npm run build
```

`BACKEND_URL` は Next.js サーバーのみが使用します。秘密情報を `NEXT_PUBLIC_*` に設定しないでください。
ブラウザーから backend へ直接接続しないため、開発用 CORS 許可は不要です。
この段階で backend と連携している機能はヘルスチェックのみで、認証・ドメイン検証・診断機能は未実装です。

## Security graph ワークスペース

日本語 UI に、架空のサンプルデータを使った 2 種類の操作可能なグラフを実装しています。

- **Asset coverage graph**：AWS・GCP の資産構成、診断状況、重要度フィルター、検索、資産詳細。
- **Exploration graph**：外部公開、ワークロード、ストレージ、データベースをつなぐ 2 つの攻撃経路例。
- ノード選択、ドラッグ移動、拡大・縮小・全体表示、絞り込み後のグラフの JSON 出力、関連経路へ移動するリスク一覧。

11 ノードはワークスペース、2 つのクラウド環境、8 リソースで構成し、7 リソースを診断済み（87.5%）として表示します。優先リスク 3 シナリオと各資産の検出件数は別の集計です。名前・関係は架空であり、グラフから診断の実行やクラウド照会は行いません。クラウド接続ボタンは実装状況を案内します。実際の診断を追加する前に、backend で認証・所有確認・実行認可を強制する必要があります。

## Docker（frontend 単体）

```sh
docker build -t oapys-frontend:dev .
docker run --rm -p 127.0.0.1:3000:3000 oapys-frontend:dev
```

backend と併せて起動する開発者向け Compose は、private backend リポジトリ側にあります。
公開 frontend は private リポジトリの取得なしで開発できます。

## 依存関係について

初期環境の外部ネットワーク制限のため、キャッシュで検証可能な Next.js 16.2.6 / React 19.2.4 を固定しています。
最新のセキュリティ更新の適用確認は未完了です。本番公開前に、ネットワーク接続可能な環境で公式アドバイザリを確認し、Next.js / React とランタイムを更新して再検証してください。

```sh
npm install --save-exact next@latest react@latest react-dom@latest
npm install --save-dev --save-exact eslint-config-next@latest
npm audit
npm run lint
npm run typecheck
npm run build
```

参考: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)、[公式セキュリティ情報](https://nextjs.org/blog)。
OSS ライセンスは未選定です。公開配布前に所有者が選定し、LICENSE を追加してください。

## デザイン指針

[DESIGN.ja.md](DESIGN.ja.md) に OAPYS のデザイン指針をまとめています。[DESIGN.md](DESIGN.md) は英語版で、両方に同じ機械可読トークンを収録しています。

控えめなエメラルドのアクセント、細い境界線、読みやすい文字、整理された製品 UI を使います。白い面と暗い製品・コードパネルは参考パターンです。UI の作業でテーマ変更が明示されない限り、既存の暗色テーマを維持します。これらの文書は設計上の指針であり、実装済み機能を示すものではありません。

## ドキュメントの言語

エージェントの作業指示は [AGENTS.ja.md](AGENTS.ja.md)、共有 Codex 設定は [`.codex/`](.codex/README.ja.md)、エージェントリソースは [`.agents/`](.agents/README.ja.md) にあります。

`README.md` は英語、`README.ja.md` は日本語で作成し、両方を同じ変更で更新します。
コードの識別子・コード内コメント・開発ログには英語を使用します。
