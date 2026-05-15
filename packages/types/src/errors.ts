/**
 * KairosAPIError — 全 API エンドポイントで使う統一エラー型
 *
 * HTTP ステータスコードの使い方:
 *   400 Bad Request        — バリデーションエラー
 *   401 Unauthorized       — 未認証
 *   403 Forbidden          — 認可エラー
 *   404 Not Found          — リソースなし（OGP PRIVATE → 404、403 禁止）
 *   409 Conflict           — 重複リソース
 *   422 Unprocessable      — ビジネスロジックエラー
 *   429 Too Many Requests  — レートリミット
 *   500 Internal Server    — 予期しないエラー
 */

export type KairosErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'INVALID_STATUS'
  | 'SESSION_ALREADY_EXISTS'
  | 'SESSION_NOT_FOUND'
  | 'EVENT_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'ACTIVITY_NOT_FOUND'
  | 'TEAM_NOT_FOUND'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'LINE_AUTH_FAILED'
  | 'APPLE_AUTH_FAILED'
  | 'GOOGLE_AUTH_FAILED';

/**
 * API レスポンスのエラー形式
 */
export type KairosAPIErrorResponse = {
  code: KairosErrorCode | string;
  message: string;
  details?: unknown;
};

/**
 * サービス層で throw する エラークラス。
 * Fastify の errorHandler が KairosAPIErrorResponse 形式でレスポンスを返す。
 */
export class KairosAPIError extends Error {
  constructor(
    public readonly code: KairosErrorCode | string,
    public override readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'KairosAPIError';
  }

  toResponse(): KairosAPIErrorResponse {
    return {
      code: this.code,
      message: this.message,
      ...(process.env['NODE_ENV'] !== 'production' && this.details !== undefined
        ? { details: this.details }
        : {}),
    };
  }
}
