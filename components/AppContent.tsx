"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Page } from "@/lib/types";
import Sidebar from "./Sidebar";
import PageEditor from "./PageEditor";
import { useLanguage } from "@/context/LanguageContext";
import { dispatchCharacterEvent } from "./character";

type PageWithChildren = Page & { children: PageWithChildren[] };

interface AppContentProps {
  initialPages: PageWithChildren[];
}

export default function AppContent({ initialPages }: AppContentProps) {
  const { t } = useLanguage();
  const [pages, setPages] = useState<PageWithChildren[]>(initialPages);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [currentEditorTitle, setCurrentEditorTitle] = useState("");
  const [currentEditorContent, setCurrentEditorContent] = useState("");
  const supabase = createClient();

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
    dispatchCharacterEvent("page_create");
    await refreshPages();
    setSelectedPage(data);
  }, [supabase, refreshPages]);

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
      dispatchCharacterEvent("page_create");
      await refreshPages();
      setSelectedPage(data);
    },
    [supabase, refreshPages]
  );

  const handleSavePage = useCallback(
    async (id: string, title: string, content: string) => {
      await supabase
        .from("pages")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", id);
      dispatchCharacterEvent("save_click");
      await refreshPages();
    },
    [supabase, refreshPages]
  );

  const handleDeletePage = useCallback(
    async (id: string) => {
      if (!confirm(t("deleteConfirm"))) return;
      await supabase.from("pages").delete().eq("id", id);
      dispatchCharacterEvent("page_delete");
      await refreshPages();
      if (selectedPage?.id === id) setSelectedPage(null);
    },
    [supabase, refreshPages, selectedPage, t]
  );

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
    </div>
  );
}
