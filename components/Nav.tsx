import Link from "next/link";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "仪表盘" },
  { href: "/goals", label: "学习目标" },
  { href: "/stats", label: "统计" },
];

export function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            学习进度
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
          >
            退出
          </button>
        </form>
      </div>
    </header>
  );
}
