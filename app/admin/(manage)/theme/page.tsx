import { ThemeSettingsForm } from "@/components/ThemeSettingsForm";
import { getThemeConfig } from "@/lib/services/settings";

export default async function AdminThemePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const theme = getThemeConfig();

  return (
    <div>
      <h1 className="page-title mb-1">页面配色</h1>
      <p className="page-sub mb-6">
        选择预设或自定义颜色，会应用到首页、排行榜和管理界面。
      </p>
      <ThemeSettingsForm
        theme={theme}
        ok={sp.ok === "1"}
        error={sp.error === "1"}
      />
    </div>
  );
}
