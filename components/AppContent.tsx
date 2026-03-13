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
  const [pages, setPages] = useState<PageWithChildren[]>(initialPages);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [rushMessage, setRushMessage] = useState<string | null>(null);
  const [rushState, setRushState] = useState<CharacterState>("idle");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const supabase = createClient();

  const triggerRush = useCallback(
    (action: RushAction, state: CharacterState) => {
      const msg = getRandomResponse(action);
      setRushMessage(msg);
      setRushState(state);
      setTimeout(() => setRushState("idle"), 1500);
      setTimeout(() => setRushMessage(null), 5000);
    },
    []
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
      triggerRush("content_save", "armsCrossed");
      await refreshPages();
    },
    [supabase, refreshPages, triggerRush]
  );

  const handleDeletePage = useCallback(
    async (id: string) => {
      if (!confirm("이 페이지를 삭제할까요?")) return;
      await supabase.from("pages").delete().eq("id", id);
      triggerRush("delete", "walk");
      await refreshPages();
      if (selectedPage?.id === id) setSelectedPage(null);
    },
    [supabase, refreshPages, triggerRush, selectedPage]
  );

  const handleAskAI = useCallback(async () => {
    if (!selectedPage) return;
    setIsLoadingAI(true);
    try {
      const res = await fetch("/api/rush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageTitle: selectedPage.title,
          contentPreview: selectedPage.content,
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
  }, [selectedPage]);

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
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-moti-textDim">
            <p className="mb-4">페이지를 선택하거나 새로 만들어 보세요.</p>
            <button
              onClick={handleCreatePage}
              className="px-4 py-2 rounded-lg bg-moti-accent text-white hover:bg-moti-accentDim"
            >
              새 페이지
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
