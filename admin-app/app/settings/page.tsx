import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#F4F5FB]">
      <Sidebar />
      <div className="ml-[232px] p-[18px_22px]">
        <h1 className="text-[30px] font-bold tracking-[-0.01em] text-charcoal">
          Settings
        </h1>
        <div className="mt-4 rounded-[20px] border border-[#E7E9F1] bg-white p-[24px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
          <p className="text-[17px] font-semibold text-charcoal">
            Settings module
          </p>
          <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-charcoal/60">
            Future admin configuration (API endpoints, user access, report
            retention) will live here. Reports remain available from the
            Reports tab.
          </p>
        </div>
      </div>
    </div>
  );
}
