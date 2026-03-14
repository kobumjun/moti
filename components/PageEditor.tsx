"use client";

import { useState, useEffect, useCallback } from "react";
import type { Page } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { dispatchCharacterEvent } from "./character";

interface PageEditorProps {
  page: Page;
  onSave: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddSubpage: () => void;
  onEditorChange?: (title: string, content: string) => void;
}

export default function PageEditor({
  page,
  onSave,
  onDelete,
  onAddSubpage,
  onEditorChange,
}: PageEditorProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(page.title);
    setContent(page.content);
  }, [page.id, page.title, page.content]);

  useEffect(() => {
    const changed = title !== page.title || content !== page.content;
    setHasChanges(changed);
  }, [title, content, page.title, page.content]);

  const reportChange = useCallback(() => {
    onEditorChange?.(title, content);
  }, [onEditorChange, title, content]);

  useEffect(() => {
    reportChange();
  }, [title, content, reportChange]);

  const handleSave = () => {
    if (!hasChanges) return;
    onSave(page.id, title, content);
    setHasChanges(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="flex-1 text-2xl font-semibold bg-transparent border-none outline-none text-moti-text placeholder:text-moti-textDim"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            onMouseEnter={() => dispatchCharacterEvent("button_hover")}
            disabled={!hasChanges}
            className="px-4 py-2 rounded-lg bg-moti-accent text-white text-sm font-medium hover:bg-moti-accentDim disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("save")}
          </button>
          <button
            onClick={onAddSubpage}
            className="px-4 py-2 rounded-lg border border-moti-border text-moti-textDim hover:text-moti-text text-sm"
          >
            {t("subPage")}
          </button>
          <button
            onClick={() => onDelete(page.id)}
            className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm"
          >
            {t("delete")}
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => dispatchCharacterEvent("typing_started")}
        onBlur={() => dispatchCharacterEvent("typing_stopped")}
        placeholder={t("contentPlaceholder")}
        className="w-full min-h-[400px] p-4 rounded-xl bg-moti-surface border border-moti-border resize-y outline-none focus:ring-2 focus:ring-moti-accent/50 text-moti-text placeholder:text-moti-textDim leading-relaxed"
      />
    </div>
  );
}
