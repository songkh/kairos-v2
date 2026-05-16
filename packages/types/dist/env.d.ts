/**
 * 環境変数の型安全な読み込み
 *
 * 必須変数が未設定の場合は起動時に例外をスローする。
 * USE_MOCKS=true の場合は外部サービス変数を省略可能にする。
 */
export declare const env: {
    readonly nodeEnv: "development" | "production" | "test";
    readonly useMocks: boolean;
    readonly databaseUrl: string;
    readonly directUrl: string | undefined;
    readonly jwtSecret: string;
    readonly jwtAccessTtlSec: number;
    readonly jwtRefreshTtlSec: number;
    readonly upstashRedisUrl: string | undefined;
    readonly upstashRedisToken: string | undefined;
    readonly lineChannelId: string | undefined;
    readonly lineChannelSecret: string | undefined;
    readonly lineLoginChannelId: string | undefined;
    readonly lineLoginChannelSecret: string | undefined;
    readonly mapboxAccessToken: string | undefined;
    readonly stripeSecretKey: string | undefined;
    readonly stripeWebhookSecret: string | undefined;
    readonly sentryDsn: string | undefined;
    readonly posthogApiKey: string | undefined;
    readonly apiBaseUrl: string;
    readonly webBaseUrl: string;
};
//# sourceMappingURL=env.d.ts.map