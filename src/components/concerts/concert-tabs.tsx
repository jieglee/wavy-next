interface Tab {
  id: string;
  label: string;
  onClick: () => void;
}

export default function ConcertTabs({ tabs, activeTab }: { tabs: Tab[]; activeTab: string }) {
  return (
    <div className="mb-8 flex items-center gap-6 overflow-x-auto border-b border-[#EDEBF2]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={tab.onClick}
          className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
            activeTab === tab.id ? "border-[#FF5470] text-[#1B1A3A]" : "border-transparent text-[#8B889C] hover:text-[#1B1A3A]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}