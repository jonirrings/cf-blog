"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface Session {
  id: string;
  userId: number;
  userName: string;
  userRole: "admin" | "publisher" | "commenter";
  isApproved: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const { session: data } = await res.json();

        if (!data) {
          router.push("/auth/login");
          return;
        }

        if (data.userRole !== "admin") {
          router.push("/next/");
          return;
        }

        setSession(data);
      } catch (err) {
        console.error("Session check failed:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navigation = [
    { name: t("admin.dashboard"), href: "/admin/dashboard", icon: "📊" },
    { name: t("admin.posts"), href: "/admin/posts", icon: "📝" },
    { name: t("admin.comments"), href: "/admin/comments", icon: "💬" },
    { name: t("admin.users"), href: "/admin/users", icon: "👥" },
    { name: t("admin.settings"), href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-lg font-bold text-gray-900">{t("admin.title")}</h1>
            <Link href="/next/" className="text-sm text-gray-500 hover:text-gray-700">
              {t("admin.backToBlog")}
            </Link>
          </div>

          {/* 导航 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}

            {/* Language Switcher */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {session.userName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{session.userName}</p>
                <p className="text-xs text-gray-500 capitalize">{session.userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 min-h-screen">
        <div className="py-6 px-8">{children}</div>
      </main>
    </div>
  );
}
