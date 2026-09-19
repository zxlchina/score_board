export type ThemeConfig = {
  primary: string;
  background: string;
};

export type ThemeCssVars = {
  background: string;
  foreground: string;
  brand50: string;
  brand100: string;
  brand500: string;
  brand600: string;
  brand700: string;
  themeBorder: string;
  headerBorder: string;
};

export const DEFAULT_THEME: ThemeConfig = {
  primary: "#ff6b1a",
  background: "#fff6ea",
};

export const THEME_PRESETS: { id: string; label: string; primary: string; background: string }[] =
  [
    { id: "orange", label: "活力橙", primary: "#ff6b1a", background: "#fff6ea" },
    { id: "rose", label: "樱花粉", primary: "#f43f5e", background: "#fff1f2" },
    { id: "violet", label: "梦幻紫", primary: "#8b5cf6", background: "#f5f3ff" },
    { id: "sky", label: "天空蓝", primary: "#0ea5e9", background: "#f0f9ff" },
    { id: "emerald", label: "清新绿", primary: "#10b981", background: "#ecfdf5" },
    { id: "amber", label: "阳光黄", primary: "#f59e0b", background: "#fffbeb" },
    { id: "indigo", label: "深海靛", primary: "#6366f1", background: "#eef2ff" },
    { id: "teal", label: "薄荷青", primary: "#14b8a6", background: "#f0fdfa" },
  ];

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value);
}

function parseHex(hex: string): [number, number, number] {
  const n = hex.slice(1);
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(hex: string, hex2: string, weight: number): string {
  const [r1, g1, b1] = parseHex(hex);
  const [r2, g2, b2] = parseHex(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return toHex(r1 * (1 - w) + r2 * w, g1 * (1 - w) + g2 * w, b1 * (1 - w) + b2 * w);
}

function darken(hex: string, amount: number): string {
  return mix(hex, "#000000", amount);
}

export function normalizeTheme(raw: unknown): ThemeConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_THEME };
  const o = raw as Record<string, unknown>;
  const primary =
    typeof o.primary === "string" && isValidHexColor(o.primary)
      ? o.primary
      : DEFAULT_THEME.primary;
  const background =
    typeof o.background === "string" && isValidHexColor(o.background)
      ? o.background
      : DEFAULT_THEME.background;
  return { primary, background };
}

export function themeToCssVars(theme: ThemeConfig): ThemeCssVars {
  const { primary, background } = theme;
  return {
    background,
    foreground: "#1c1917",
    brand50: mix(primary, "#ffffff", 0.92),
    brand100: mix(primary, "#ffffff", 0.82),
    brand500: primary,
    brand600: darken(primary, 0.12),
    brand700: darken(primary, 0.28),
    themeBorder: mix(primary, "#ffffff", 0.78),
    headerBorder: mix(primary, "#ffffff", 0.85),
  };
}

export function themeCssVarsStyle(vars: ThemeCssVars): Record<string, string> {
  return {
    ["--background" as string]: vars.background,
    ["--foreground" as string]: vars.foreground,
    ["--brand-50" as string]: vars.brand50,
    ["--brand-100" as string]: vars.brand100,
    ["--brand-500" as string]: vars.brand500,
    ["--brand-600" as string]: vars.brand600,
    ["--brand-700" as string]: vars.brand700,
    ["--theme-border" as string]: vars.themeBorder,
    ["--header-border" as string]: vars.headerBorder,
  };
}
