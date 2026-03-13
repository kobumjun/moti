"use client";

import type { Page } from "@/lib/types";

type PageWithChildren = Page & { children: PageWithChildren[] };

interface SidebarProps {
  pages: PageWithChildren[];
  selectedId: string | null;
  onSelect: (page: Page) => void;
  onCreatePage: () => void;
  onCreateSubpage: (parentId: string) => void;
}

export default function Sidebar({
  pages,
  selectedId,
  onSelect,
  onCreatePage,
  onCreateSubpage,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-moti-border bg-moti-surface flex flex-col overflow-hidden">
      <div className="p-4 border-b border-moti-border">
        <button
          onClick={onCreatePage}
          className="w-full py-2 px-3 rounded-lg bg-moti-accent text-white text-sm font-medium hover:bg-moti-accentDim transition-colors"
        >
          + 새 페이지
        </button>
      </div>
      <nav className="flex-1 overflow-auto p-2">
        <PageTree
          pages={pages}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateSubpage={onCreateSubpage}
          level={0}
        />
      </nav>
    </aside>
  );
}

function PageTree({
  pages,
  selectedId,
  onSelect,
  onCreateSubpage,
  level,
}: {
  pages: PageWithChildren[];
  selectedId: string | null;
  onSelect: (page: Page) => void;
  onCreateSubpage: (parentId: string) => void;
  level: number;
}) {
  return (
    <ul className="space-y-0.5">
      {pages.map((page) => (
        <li key={page.id} className="group">
          <div
            className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-moti-border/30 ${
              selectedId === page.id ? "bg-moti-border/50 text-moti-accent" : ""
            }`}
            style={{ paddingLeft: `${12 + level * 12}px` }}
          >
            <button
              className="flex-1 text-left text-sm truncate"
              onClick={() => onSelect(page)}
            >
              {page.title || "Untitled"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubpage(page.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-moti-textDim hover:text-moti-accent text-xs"
              title="하위 페이지 추가"
            >
              +
            </button>
          </div>
          {page.children.length > 0 && (
            <PageTree
              pages={page.children}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSubpage={onCreateSubpage}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
