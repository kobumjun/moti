"use client";

import { useState, useRef, useEffect } from "react";
import { dispatchCharacterEvent } from "./character";
import { createClient } from "@/lib/supabase/client";
import { HeroEngine } from "./hero";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface AppShellProps {
  user: { id: string; email: string; name: string | null; avatarUrl: string | null };
  children: React.ReactNode;
}

export default function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-moti-bg">
      <header className="h-14 border-b border-moti-border flex items-center justify-between px-4 bg-moti-surface">
        <span className="text-moti-textDim text-sm">MOTI</span>
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-moti-textDim hover:text-moti-text hover:bg-moti-border/30"
            >
              {lang === "en" ? "EN" : "KO"}
              <span className="text-xs">▼</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 rounded-lg bg-moti-surface border border-moti-border shadow-xl min-w-[100px]">
                <button
                  onClick={() => {
                    setLang("en");
                    setDropdownOpen(false);
                    dispatchCharacterEvent("language_changed", { lang: "en" });
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-moti-border/30 ${
                    lang === "en" ? "text-moti-accent" : "text-moti-text"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLang("ko");
                    setDropdownOpen(false);
                    dispatchCharacterEvent("language_changed", { lang: "ko" });
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-moti-border/30 ${
                    lang === "ko" ? "text-moti-accent" : "text-moti-text"
                  }`}
                >
                  Korean
                </button>
              </div>
            )}
          </div>
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
            {t("logout")}
          </button>
        </div>
      </header>

      {children}
      <HeroEngine />
    </div>
  );
}
