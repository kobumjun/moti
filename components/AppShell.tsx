"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppShellProps {
  user: { id: string; email: string; name: string | null; avatarUrl: string | null };
  children: React.ReactNode;
}

export default function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-moti-bg">
      {/* 상단 바 */}
      <header className="h-14 border-b border-moti-border flex items-center justify-between px-4 bg-moti-surface">
        <span className="text-moti-textDim text-sm">MOTI</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-moti-text truncate max-w-[150px]">
            {user.name ?? user.email}
          </span>
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-moti-textDim hover:text-moti-text"
          >
            로그아웃
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
