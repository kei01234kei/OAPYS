import { defineMessages } from "@/lib/i18n";

export const apiMessages = defineMessages(
  {
    loginRequired: "Administrator sign-in is required.",
    backendUnavailable:
      "Cannot reach the backend. Check that it is running and configured.",
    tokenNotConfigured:
      "Set the same admin token on both the backend and the frontend. See the production setup section in the README.",
    tooManyAttempts: "Too many sign-in attempts. Try again in 1 minute.",
    tokenMismatch: "The admin token does not match.",
    requestFailed: "The operation failed.",
  },
  {
    loginRequired: "管理者ログインが必要です。",
    backendUnavailable:
      "backend に接続できません。起動状態と設定を確認してください。",
    tokenNotConfigured:
      "backend と frontend に共通の管理トークンを設定してください。README の実環境セットアップを参照してください。",
    tooManyAttempts: "ログイン試行回数を超えました。1 分後に再試行してください。",
    tokenMismatch: "管理トークンが一致しません。",
    requestFailed: "操作に失敗しました。",
  },
);
