# セキュリティワークスペース API 契約

[English](security-api.md) | **日本語**

frontend は独立した backend と連携します。サーバー専用の `BACKEND_URL` と `BACKEND_API_TOKEN`（32 文字以上）を設定してください。認証情報に `NEXT_PUBLIC_` を付けません。backend 側でも同じ管理用 Bearer 認証情報とクラウドへのアクセスを別途設定します。現契約は単一管理者・単一ワークスペース向けです。複数テナントと公開サインアップは未実装です。

ブラウザーは `/api/security/…` を使用します。`POST /api/security/session` に `{ "token": "…" }` を渡してログインします。成功時に HttpOnly・SameSite=Strict・8 時間有効の Cookie を設定し、HTTPS では Secure も設定します。`GET` で設定・認証状態を確認し、`DELETE` でログアウトします。更新操作には一致する Origin が必要です。ログイン試行は Next.js プロセスごとに 1 分間 5 回までです。サーバーはセッションを検証後に backend の Bearer 認証情報を転送します。読み取り・更新応答はキャッシュしません。

backend のエンドポイントは `/api/v1` 配下です。Next.js のプロキシは以下のパス・メソッドだけを許可します。ID は不透明な 48 文字の 16 進文字列です。

| メソッド | パス | リクエスト / 結果 |
| --- | --- | --- |
| GET | `/snapshot` | `assets`・`edges`・`findings`・`connections`・`targets`・`jobs`・`audit` の各配列 |
| POST | `/connections` | `name`・`provider`（`AWS`/`GCP`）・`region`・`roleArn`・`projectId`。AWS ではサーバー発行の `externalId` を含む接続を返す |
| POST | `/connections/{id}/sync` | `{}`。202 を返し、非同期の状態を snapshot で確認 |
| DELETE | `/connections/{id}` | 接続解除と取得済みグラフ情報の除去。クラウド資産は削除しない |
| POST | `/targets` | `hostname`。`target`・`recordName`・`recordValue` を返す。同じホスト名は 409 |
| GET | `/targets/{id}/challenge` | `target`・`recordName`・`recordValue` を再表示する。backend に `OAPYS_DNS_CHALLENGE_KEY` があり、保存済みハッシュと一致する場合のみ。それ以外は 409（取り消して再登録） |
| POST | `/targets/{id}/verify` | `{}`。backend の DNS 所有確認後に `verifiedUntil` を返す |
| DELETE | `/targets/{id}` | 承認取消・実行中止・対象のグラフ情報除去 |
| POST | `/jobs` | `targetId`・`authorized: true`。backend のスコープ・所有再確認後に 202 を返す |

失敗時は非 2xx ステータスと `{ "error": "…" }` を返します。実環境表示中は 4 秒ごとに snapshot を更新します。接続状態は `pending` → `syncing` → `connected` または `error`、ジョブ状態は `running`・`completed`・`failed`・`cancelled` です。

資産は `id`・`name`・`kind`・`provider`・`region` と、必要に応じて `connectionId`・`targetId`・`checkedAt` を持ちます。エッジは `source`・`target`・`relation`、検出結果は `id`・`assetId`・`severity`・`rule`・`title`・`evidence`・`remediation`・`detectedAt` を持ちます。対象情報にはチャレンジ・承認の期限を含めますが、トークンのハッシュを含めません。クラウドの認証情報を snapshot に含めません。

カバレッジの分母は組織・クラウドアカウントを除く全リソースです。取得済みでも実装済みチェックがない公開 IP・ネットワークのノードを含みます。`checkedAt` がある場合のみチェック済みとします。これは実装済みチェックの網羅状況であり、すべての脆弱性からの保護を表しません。実データでは重要度を表示し、CVSS スコアを推測しません。更新失敗時は画面の実環境 snapshot を消去します。クラウド同期の失敗では前回の資産・取得時刻を保持し、接続状態に失敗を表示します。

デモと実環境のデータは分離します。実環境の Exploration graph は選択資産から 2 ホップ以内の観測した構成関係を表示します。推測の攻撃経路を作らず、実効的な到達可能性を証明しません。初期コネクターの範囲は AWS EC2・セキュリティグループと GCP Compute・従来型 VPC ファイアウォールであり、全クラウドサービスではありません。HTTPS 診断は所有確認済みの正確なホスト名について、証明書と一部応答ヘッダーを検査し、応答バナー（`Server` / `X-Powered-By`）で観測したバージョンをローカルの CVE フィードと照合して既知脆弱性を非破壊で列挙します。検出は観測済みのバナーに対する照合であり、対象へ追加の通信は送りません。能動的な CVE スキャナ・エクスプロイト実行・侵入試験は行わず、一致は「悪用可能」の証明ではなく既知の脆弱バージョンの指摘です。直接 API を呼ぶ場合も backend の認可を必須とします。

## AI 調査の契約

AI の各ルートも、同じ管理者セッションと、更新時の Origin 確認を必要とします。

| メソッド | ブラウザー側のパス | 結果 |
| --- | --- | --- |
| GET | `/api/security/ai/status` | `configured`・`label`・`model`・必要に応じて `reason`。認証情報・接続先 URL は返さない |
| GET | `/api/security/investigations` | 最新 20 件の `investigations` 概要 |
| POST | `/api/security/investigations` | `question`・任意の `assetId`・`shareData: true`。調査を 202 で返す |
| GET | `/api/security/investigations/{id}` | 実行状態・取得済み根拠・参照手順・レポートまたはエラー |
| POST | `/api/security/investigations/{id}/cancel` | `{}`。実行を中止し、履歴は保持 |

調査は `id`・`question`・`assetId`・`status`（`running`・`completed`・`failed`・`cancelled`）・`provider`・`model`・`createdAt`・`snapshotAt`・`deadline`・任意の `finishedAt`・`steps`・`evidence` と、任意の `report`・`error` を持ちます。レポートは `title`・`summary`・`observations`・`unknowns`・`nextSteps`・`graphAssetIds`、各観測は `title`・`explanation`・`basis`（`observed` / `inferred`）・`evidenceIds`・`recommendation` を持ちます。根拠は不透明な `id`、`kind`・`resourceId`・`assetIds`・`label`・取得時点の `data`・`capturedAt` を持ちます。サービスは参照の整合性を確認しますが、引用先が一致しても文章の事実性を保証しません。

画面は実行中の調査を 2 秒ごとに確認します。AI 接続先の設定状態とデータ送信の確認を表示し、AI の解釈・不明点・根拠を示し、参照した資産をグラフで強調できます。資産を削除しても調査時点の根拠は閲覧でき、グラフの強調は現存する資産に限ります。デモはワークフローを説明するだけで、モデルを呼びません。AI エンドポイントは診断実行・任意 URL 取得・クラウド変更を行いません。接続先・モデル・秘密情報はサーバー側で設定し、互換プロトコルへの対応を必要とします。
