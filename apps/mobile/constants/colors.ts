/**
 * Kairos デザイントークン（カラー）
 *
 * コーディング規約（.claude/rules/coding-conventions.md）:
 *   - ハードコードカラー禁止 → このファイルを使う
 *   - ダークモード: Sprint 1 から必須（早朝・夜間ランナー対応）
 *   - OLED 最適化: darkBackground は #000000（純黒）
 */

export const Colors = {
  light: {
    // ブランドカラー
    primary: '#E8642A',    // 朱色
    secondary: '#1A1A2E',  // 深夜
    accent: '#F0C040',     // 金
    surface: '#F7F5F0',    // 和紙

    // テキスト
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',

    // 背景
    background: '#F7F5F0',
    card: '#FFFFFF',
    border: '#E5E7EB',

    // ステータス
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // タブバー
    tabIconDefault: '#6B7280',
    tabIconSelected: '#E8642A',
    tabBarBackground: '#FFFFFF',
  },

  dark: {
    // ブランドカラー（ダークモードでも同じ）
    primary: '#E8642A',
    secondary: '#E8E8F0',
    accent: '#F0C040',
    surface: '#1A1A2E',

    // テキスト
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textInverse: '#1A1A2E',

    // 背景（OLED 最適化 — 純黒）
    background: '#000000',
    card: '#111111',
    border: '#2A2A3E',

    // ステータス
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // タブバー
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#E8642A',
    tabBarBackground: '#111111',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorKey = keyof typeof Colors.light;
