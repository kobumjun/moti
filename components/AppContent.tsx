"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Page } from "@/lib/types";
import Sidebar from "./Sidebar";
import PageEditor from "./PageEditor";
import RushCharacter from "./RushCharacter";
import {
  getRandomResponse,
  type RushAction,
} from "@/lib/rush-responses";
import { useLanguage } from "@/context/LanguageContext";

type PageWithChildren = Page & { children: PageWithChildren[] };

interface AppContentProps {
  initialPages: PageWithChildren[];
}

type CharacterState =
  | "idle"
  | "walk"
  | "jump"
  | "armsCrossed"
  | "excited"
  | "talk";

export default function AppContent({ initialPages }: AppContentProps) {
  const { t, lang } = useLanguage();
  const [pages, setPages] = useState<PageWithChildren[]>(initialPages);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [rushMessage, setRushMessage] = useState<string | null>(null);
  const [rushState, setRushState] = useState<CharacterState>("idle");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [currentEditorTitle, setCurrentEditorTitle] = useState("");
  const [currentEditorContent, setCurrentEditorContent] = useState("");
  const supabase = createClient();

  const triggerRush = useCallback(
    (action: RushAction, state: CharacterState, message?: string) => {
      setRushMessage(message ?? getRandomResponse(action, lang));
      setRushState(state);
      setTimeout(() => setRushState("idle"), 1500);
      setTimeout(() => setRushMessage(null), 6000);
    },
    [lang]
  );

  const triggerRushWithAI = useCallback(
    async (title: string, content: string, state: CharacterState) => {
      setRushState(state);
      setIsLoadingAI(true);
      try {
        const res = await fetch("/api/rush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageTitle: title,
            content,
            lang,
          }),
        });
        const json = await res.json();
        if (json.comment) {
          setRushMessage(json.comment);
          setTimeout(() => setRushState("idle"), 1500);
          setTimeout(() => setRushMessage(null), 6000);
        } else {
          triggerRush("content_save", state);
        }
      } catch {
        triggerRush("content_save", state);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [triggerRush, lang]
  );

  const refreshPages = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!data) return;
    const root = data.filter((p) => !p.parent_id);
    const childMap = data.reduce<Record<string, typeof data>>((acc, p) => {
      const pid = p.parent_id ?? "root";
      if (!acc[pid]) acc[pid] = [];
      acc[pid]!.push(p);
      return acc;
    }, {});
    const build = (list: typeof data): PageWithChildren[] =>
      list.map((p) => ({
        ...p,
        children: build(childMap[p.id] ?? []),
      }));
    setPages(build(root));
  }, [supabase]);

  const handleEditorChange = useCallback((title: string, content: string) => {
    setCurrentEditorTitle(title);
    setCurrentEditorContent(content);
  }, []);

  useEffect(() => {
    if (selectedPage) {
      setCurrentEditorTitle(selectedPage.title);
      setCurrentEditorContent(selectedPage.content);
    }
  }, [selectedPage?.id, selectedPage?.title, selectedPage?.content]);

  const handleCreatePage = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("pages")
      .insert({
        user_id: user.id,
        parent_id: null,
        title: "Untitled",
        content: "",
      })
      .select()
      .single();
    if (error) return;
    triggerRush("page_create", "jump");
    await refreshPages();
    setSelectedPage(data);
  }, [supabase, refreshPages, triggerRush]);

  const handleCreateSubpage = useCallback(
    async (parentId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("pages")
        .insert({
          user_id: user.id,
          parent_id: parentId,
          title: "Untitled",
          content: "",
        })
        .select()
        .single();
      if (error) return;
      triggerRush("subpage_create", "excited");
      await refreshPages();
      setSelectedPage(data);
    },
    [supabase, refreshPages, triggerRush]
  );

  const handleSavePage = useCallback(
    async (id: string, title: string, content: string) => {
      await supabase
        .from("pages")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", id);
      const hasContent = (title + content).trim().length > 0;
      if (hasContent) {
        await triggerRushWithAI(title, content, "armsCrossed");
      } else {
        triggerRush("content_save", "armsCrossed");
      }
      await refreshPages();
    },
    [supabase, refreshPages, triggerRush, triggerRushWithAI]
  );

  const handleDeletePage = useCallback(
    async (id: string) => {
      if (!confirm(t("deleteConfirm"))) return;
      await supabase.from("pages").delete().eq("id", id);
      triggerRush("delete", "walk");
      await refreshPages();
      if (selectedPage?.id === id) setSelectedPage(null);
    },
    [supabase, refreshPages, triggerRush, selectedPage, t]
  );

  const handleAskAI = useCallback(async () => {
    if (!selectedPage) return;
    const title = currentEditorTitle || selectedPage.title;
    const content = currentEditorContent ?? selectedPage.content;
    setIsLoadingAI(true);
    try {
      const res = await fetch("/api/rush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageTitle: title,
          content,
          requestAnother: true,
          lang,
        }),
      });
      const json = await res.json();
      if (json.comment) {
        setRushMessage(json.comment);
        setRushState("talk");
        setTimeout(() => setRushState("idle"), 1000);
      }
    } finally {
      setIsLoadingAI(false);
    }
  }, [selectedPage, currentEditorTitle, currentEditorContent, lang]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        pages={pages}
        selectedId={selectedPage?.id ?? null}
        onSelect={setSelectedPage}
        onCreatePage={handleCreatePage}
        onCreateSubpage={handleCreateSubpage}
      />
      <main className="flex-1 overflow-auto p-6">
        {selectedPage ? (
          <PageEditor
            page={selectedPage}
            onSave={handleSavePage}
            onDelete={handleDeletePage}
            onAddSubpage={() => handleCreateSubpage(selectedPage.id)}
            onEditorChange={handleEditorChange}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-moti-textDim">
            <p className="mb-4">{t("emptyStateMessage")}</p>
            <button
              onClick={handleCreatePage}
              className="px-4 py-2 rounded-lg bg-moti-accent text-white hover:bg-moti-accentDim"
            >
              {t("newPage")}
            </button>
          </div>
        )}
      </main>

      <RushCharacter
        message={rushMessage}
        state={rushState}
        onAskAI={selectedPage ? handleAskAI : undefined}
        isLoadingAI={isLoadingAI}
      />
    </div>
  );
}
