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
| GET | `/api/security/ai/status` | `configured`・`label`・`model`・必要に応じて `reason`・`provider`（`lmstudio`/`anthropic`/`openai`）。認証情報・接続先 URL は返さない |
| GET | `/api/security/ai/config` | 保存済みの AI 接続先（`provider`・`model`・`label`・`hasKey`・末尾 4 文字の `keyHint`）。API キーは返さない |
| POST | `/api/security/ai/config` | `{provider: "anthropic"\|"openai", model, apiKey?, label?}`。同じ接続先なら空の `apiKey` で保存済みキーを維持。送信先は公式エンドポイントのみ。キーは backend で暗号化 |
| POST | `/api/security/ai/config/models` | `{provider, apiKey?}` → `{models: [{id, name?}]}`。キー・接続の確認を兼ねる |
| GET | `/api/security/ai/local/models` | LM Studio の状態: `enabled`・`reachable`・`state`（`connected`/`not_running`/`auth_required`/`outdated`/`error`）・`url`・`hasToken`・`canSaveToken`・`inDocker`・ダウンロード済み `models`・`selection`（`loading`/`ready`/`failed`） |
| POST | `/api/security/ai/local/runtime` | `{url?, token?, clearToken?}`: LM Studio の接続先を変更（この Mac への HTTP、または HTTPS）し、API トークンを暗号化して保存または削除。空の項目は現在の値を維持 |
| POST | `/api/security/ai/local/detect` | 現在の接続先と backend 固定の候補（ホストの 1234〜1239 番ポート）を調べ、最初に見つかった LM Studio に切り替え。応答は `ai/local/models` と同じ |
| GET | `/api/security/ai/local/search?q=` | Hugging Face の GGUF チャットモデル（ダウンロード数順） |
| GET | `/api/security/ai/local/files?repo=owner/name` | GGUF の量子化と合計サイズ（分割ファイルはまとめる） |
| GET/POST | `/api/security/ai/local/downloads` | ダウンロードの進捗一覧 / LM Studio 経由で開始 `{repo, quantization}` |
| POST | `/api/security/ai/local/select` | `{model}`: ダウンロード済み LLM を LM Studio に読み込み、AI に使用（202。`ai/local/models` で状態を確認） |
| GET | `/api/security/investigations` | 最新 20 件の `investigations` 概要 |
| POST | `/api/security/investigations` | `question`・任意の `assetId`・`shareData: true`。調査を 202 で返す |
| GET | `/api/security/investigations/{id}` | 実行状態・取得済み根拠・参照手順・レポートまたはエラー |
| POST | `/api/security/investigations/{id}/cancel` | `{}`。実行を中止し、履歴は保持 |

調査は `id`・`question`・`assetId`・`status`（`running`・`completed`・`failed`・`cancelled`）・`provider`・`model`・`createdAt`・`snapshotAt`・`deadline`・任意の `finishedAt`・`steps`・`evidence` と、任意の `report`・`error` を持ちます。レポートは `title`・`summary`・`observations`・`unknowns`・`nextSteps`・`graphAssetIds`、各観測は `title`・`explanation`・`basis`（`observed` / `inferred`）・`evidenceIds`・`recommendation` を持ちます。根拠は不透明な `id`、`kind`・`resourceId`・`assetIds`・`label`・取得時点の `data`・`capturedAt` を持ちます。サービスは参照の整合性を確認しますが、引用先が一致しても文章の事実性を保証しません。

画面は実行中の調査を 2 秒ごとに確認します。AI 接続先の設定状態とデータ送信の確認を表示し、AI の解釈・不明点・根拠を示し、参照した資産をグラフで強調できます。資産を削除しても調査時点の根拠は閲覧でき、グラフの強調は現存する資産に限ります。デモはワークフローを説明するだけで、モデルを呼びません。AI エンドポイントは診断実行・任意 URL 取得・クラウド変更を行いません。接続先・モデル・秘密情報はサーバー側で設定し、互換プロトコルへの対応を必要とします。

## エージェントタスクの契約

すべてのエージェントルートは、同じ管理者セッションと変更リクエストの Origin チェックを必要とします：

| メソッド | ブラウザパス | 結果 |
| --- | --- | --- |
| GET | `/api/security/agent/tasks` | `tasks`: 新しい順のサマリー（`id`・`goal`・`hostname`・`status`・任意の `summary`/`error`・`approvalMode`・`pendingApprovals`・タイムスタンプ・`stats`） |
| POST | `/api/security/agent/tasks` | `goal`（3–2000 バイト）・`targetId`・`authorized: true`、任意で `approvalMode`（`auto`/`strict`）・`workers`（1–3）・`deadlineMinutes`（5–60）。タスクを 202 で返す。設定済み AI モデルとターゲットの新しい DNS 所有確認が必要 |
| GET | `/api/security/agent/tasks/{id}` | タスク全体: 探索グラフ `nodes`/`edges`、共有 `todo`、取得済み `evidence`・`approvals`・ライブ `activity`・`stats` |
| POST | `/api/security/agent/tasks/{id}/cancel` | `{}`。実行をキャンセルし pending の承認を失効させる |
| POST | `/api/security/agent/tasks/{id}/pause` / `resume` | `{}`。モデルターンとツール呼び出しの間に進捗を凍結する |
| GET | `/api/security/agent/tasks/{id}/approvals` | `approvals`（新しい順、50 件） |
| POST | `/api/security/agent/tasks/{id}/approvals/{approvalId}` | `{ "decision": "approve" \| "deny" }`。不明または既に決定済みの場合は 409 |

タスクは `id`・`goal`・`targetId`・`hostname`・`status`（`running`・`paused`・`completed`・`failed`・`cancelled`）・任意の `summary`/`error`・`approvalMode`・`provider`・`model`・`createdAt`・`deadline`・任意の `finishedAt` と、タスク毎の探索グラフを持ちます。`nodes`（kind は `goal`/`intent`/`fact`/`finding`。intent には status `pending`/`running`/`done`/`failed` を持ち、ノードは任意で `assetId` にアンカーされる）、`edges`（`spawns`/`derived_from`/`yields`/`proves`）、共有 `todo`、取得済み `evidence`（不透明な `id`・kind `bash`/`http`・上限付き `data`）、`approvals`（status `pending`/`approved`/`denied`/`expired`・正確な呼び出しの `args`・5 分間有効）、ライブ `activity`、`stats` です。

backend は planner エージェント（intent を生成するのは planner のみで共有 todolist を維持）と、承認ゲートを介した実ツールを実行する worker エージェントを動かします。スコープ内の読み取り専用呼び出しは自動実行され、それ以外は正確なその呼び出しに対するオペレーターの決定を待ちます。ワークスペースでの同時実行は 1 タスクのみ（それ以外は 429）です。worker が報告した finding は `source: "agent"` で資産にアンカーされ snapshot の `findings` に現れ、snapshot はポーリング用に `agentTasks` サマリーを含みます。画面は実行中のタスクを 2 秒ごとに確認し、pending の承認を決定のために表示すべきです。ターゲットを失効するとそのタスクはキャンセルされます。
