type Tab = { id: string; label: string; onClick: () => void };

export default function ConcertTabs({ tabs, activeTab }: { tabs: Tab[]; activeTab: string }) {
  return (
    <nav className="scrollbar-hide -mx-4 flex items-center gap-0 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={tab.onClick}
            className={`relative whitespace-nowrap px-5 py-4 text-[14px] font-semibold transition-colors ${
              active ? "text-[#0F56FF]" : "text-[#9AA0A6] hover:text-[#4B5563]"
            }`}
          >
            {tab.label}
            <span className={`absolute bottom-0 left-3 right-3 h-[3px] rounded-full ${active ? "bg-[#0F56FF]" : "bg-transparent"}`} />
          </button>
        );
      })}
    </nav>
  );
}
