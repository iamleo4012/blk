"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings } from "lucide-react";

const NAV = [
  { href: "/", label: "Reports", icon: LayoutGrid },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Fixed dark-navy sidebar with brand and two navigation destinations. */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[232px] flex-col bg-navy px-4 py-6 text-white">
      {/* Brand */}
      <div className="flex items-center gap-[12px] px-2">
        <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-accent">
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 3 L21 8 L12 13 L3 8 Z" />
            <path d="M3 12 L12 17 L21 12" />
            <path d="M3 16 L12 21 L21 16" />
          </svg>
        </span>
        <span className="text-[20px] font-bold tracking-[-0.01em]">Field Reports</span>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex flex-col gap-[8px]">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-[14px] rounded-[14px] px-[16px] py-[13px] text-[17px] font-semibold transition ${
                active ? "bg-accent text-white" : "text-white/85 hover:bg-white/10"
              }`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.9} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
