"use client";

import { useState } from "react";

interface TabNavigationProps {
  activeSection?: string;
}

const TABS = [
  { id: "todo", label: "To-do list", scrollTo: "todo" },
  { id: "kanban", label: "Kanban", scrollTo: "kanban" },
  { id: "tableau", label: "Tableau", scrollTo: "tableau" },
  { id: "chronologie", label: "Chronologie", scrollTo: "chronologie" },
  { id: "calendrier", label: "Calendrier", scrollTo: "calendrier" },
] as const;

function scrollToSection(sectionId: string): void {
  const element = document.getElementById(`section-${sectionId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function TabNavigation({ activeSection }: TabNavigationProps) {
  const [active, setActive] = useState(activeSection ?? TABS[0].id);

  function handleTabClick(tab: (typeof TABS)[number]): void {
    setActive(tab.id);
    scrollToSection(tab.scrollTo);
  }

  return (
    <div className="scrollbar-hover sticky top-0 z-10 flex items-center justify-center gap-3 overflow-x-auto py-3">
      <nav className="flex shrink-0 items-center rounded-full border border-orange-200 bg-orange-50/80 p-1 backdrop-blur-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={
              active === tab.id
                ? "rounded-full bg-orange-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
                : "rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-100 hover:text-gray-900"
            }
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
