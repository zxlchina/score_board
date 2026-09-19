import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/auth/session";

const links = [
  { href: "/admin", label: "概览", icon: "🏠" },
  { href: "/admin/records", label: "录入积分", icon: "✨" },
  { href: "/admin/children", label: "小朋友", icon: "🧒" },
  { href: "/admin/categories", label: "分类", icon: "🏷️" },
  { href: "/admin/theme", label: "配色", icon: "🎨" },
];

export default async function AdminManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="sticker-tab bg-white text-stone-700 ring-2 ring-stone-200 hover:bg-brand-100 hover:text-brand-800"
          >
            <span className="mr-1">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
