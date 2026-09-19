"use client";

import { useState } from "react";
import { applyPresetAction, saveThemeAction } from "@/lib/actions/theme";
import { THEME_PRESETS, type ThemeConfig } from "@/lib/theme";

export function ThemeSettingsForm({
  theme,
  ok,
  error,
}: {
  theme: ThemeConfig;
  ok?: boolean;
  error?: boolean;
}) {
  const [primary, setPrimary] = useState(theme.primary);
  const [background, setBackground] = useState(theme.background);

  return (
    <div className="space-y-8">
      {ok && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          配色已保存，首页会立即生效。
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
          颜色格式无效，请使用 #RRGGBB。
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-stone-800">快捷主题</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_PRESETS.map((p) => (
            <form key={p.id} action={applyPresetAction}>
              <input type="hidden" name="primary" value={p.primary} />
              <input type="hidden" name="background" value={p.background} />
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-white p-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50/50"
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-lg border border-black/5 shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${p.primary} 50%, ${p.background} 50%)`,
                  }}
                />
                <span className="text-stone-700">{p.label}</span>
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">自定义颜色</h2>
        <form action={saveThemeAction} className="space-y-4">
          <ColorField
            label="主题色（按钮、链接、强调）"
            name="primary"
            value={primary}
            onChange={setPrimary}
          />
          <ColorField
            label="页面背景色"
            name="background"
            value={background}
            onChange={setBackground}
          />
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--theme-border)",
              background: background,
            }}
          >
            <p className="text-sm text-stone-600">预览</p>
            <span
              className="btn-primary mt-2 inline-flex"
              style={{ backgroundColor: primary }}
            >
              示例按钮
            </span>
          </div>
          <button type="submit" className="btn-primary w-full">
            保存配色
          </button>
        </form>
      </section>
    </div>
  );
}

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-stone-200 bg-white p-1"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input font-mono"
          pattern="^#[0-9A-Fa-f]{6}$"
          maxLength={7}
        />
      </div>
    </div>
  );
}
