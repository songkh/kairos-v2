"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KairosAPIError = void 0;
/**
 * サービス層で throw する エラークラス。
 * Fastify の errorHandler が KairosAPIErrorResponse 形式でレスポンスを返す。
 */
class KairosAPIError extends Error {
    code;
    message;
    statusCode;
    details;
    constructor(code, message, statusCode = 400, details) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'KairosAPIError';
    }
    toResponse() {
        return {
            code: this.code,
            message: this.message,
            ...(process.env['NODE_ENV'] !== 'production' && this.details !== undefined
                ? { details: this.details }
                : {}),
        };
    }
}
exports.KairosAPIError = KairosAPIError;
//# sourceMappingURL=errors.js.map