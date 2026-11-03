# プロジェクトの Codex 設定

[English](README.md) | **日本語**

`config.toml` は共有するプロジェクト設定です。現在のユーザー指定値は `approval_policy = "never"` と `sandbox_mode = "danger-full-access"` です。ホストや管理者の制限の範囲内で、承認の確認なし・Codex のファイルシステムサンドボックスなしで実行する設定です。モデル・認証の設定は環境から引き継ぎます。

作業指示は [AGENTS.ja.md](../AGENTS.ja.md) に記載しています。日本語版はメンテナー向けの翻訳で、Codex が読む実際の指示ファイルは `AGENTS.md` です。
プロジェクト設定は信頼されたプロジェクトでのみ読み込まれます。リポジトリの公開範囲や OS・管理者の制限を変更するものではありません。

認証情報・ローカル状態・マシン固有パスを含めないでください。

参考: [OpenAI 設定リファレンス](https://learn.chatgpt.com/docs/config-file/config-reference)、[AGENTS.md の作業指示](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。
