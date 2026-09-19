import Link from "next/link";
import { SoundToggle } from "@/components/SoundToggle";
import { isAdminLoggedIn } from "@/lib/auth/session";

export async function SiteHeader() {
  const admin = await isAdminLoggedIn();

  return (
    <header className="sticky top-0 z-20 border-b-2 border-[color:var(--header-border)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-brand-700">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-xl shadow-[0_3px_0_#fbbf24]">
            <span className="animate-twinkle">⭐</span>
          </span>
          <span className="text-lg leading-tight">
            积分小星球
            <span className="block text-[11px] font-bold text-stone-400">小朋友计分板</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <SoundToggle />
          {admin ? (
            <>
              <Link
                href="/admin"
                className="rounded-full bg-brand-100 px-3 py-1.5 text-brand-800 hover:bg-brand-500 hover:text-white"
              >
                管理
              </Link>
              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-stone-500 hover:bg-stone-100"
                >
                  退出
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-full bg-white px-3 py-1.5 text-stone-500 ring-2 ring-stone-200 hover:text-brand-700"
            >
              管理员
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
