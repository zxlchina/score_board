import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions/admin";
import { isAdminLoggedIn } from "@/lib/auth/session";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdminLoggedIn()) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const showError = sp.error === "1";

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white text-4xl shadow-[0_6px_0_#fde68a] ring-2 ring-amber-200">
          <span className="animate-bob">🔐</span>
        </div>
        <h1 className="page-title">管理员登录</h1>
        <p className="page-sub mt-1">请输入管理口令</p>
      </div>
      {showError ? (
        <p className="mb-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
          口令错误，请重试
        </p>
      ) : null}
      <form action={loginAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="password">
            口令
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          登录
        </button>
      </form>
    </div>
  );
}
