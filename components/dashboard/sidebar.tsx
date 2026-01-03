"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  RefreshCw,
  PiggyBank,
  Target,
  TrendingUp,
  Mail,
  Gift,
  Lightbulb,
  MessageSquare,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Income", href: "/income", icon: Wallet },
  { name: "Recurring", href: "/recurring", icon: RefreshCw },
  { name: "Savings", href: "/savings", icon: PiggyBank },
  { name: "Budgets", href: "/budgets", icon: Target },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Inbox", href: "/inbox", icon: Mail, badge: 2 },
  { name: "Promos", href: "/promos", icon: Gift },
  { name: "Insights", href: "/insights", icon: Lightbulb },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 lg:relative lg:translate-x-0 lg:border-r",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="h-2 w-2 rounded-sm bg-primary-500" />
                <div className="h-2 w-2 rounded-sm bg-primary-400" />
                <div className="h-2 w-2 rounded-sm bg-primary-400" />
                <div className="h-2 w-2 rounded-sm bg-primary-500" />
              </div>
              <span className="text-lg font-semibold text-gray-900">MoneyQ</span>
            </div>
            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade Card */}
          <div className="m-4 rounded-lg bg-gradient-to-br from-primary-900 to-primary-700 p-4 text-white">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="8" width="18" height="13" rx="2" />
                  <path d="M12 3v5" />
                  <path d="m9 6 3-3 3 3" />
                </svg>
              </div>
            </div>
            <p className="mb-2 text-sm font-medium">
              Gain full access to your finances with detailed analytics and
              graphs
            </p>
            <button className="w-full rounded-lg bg-primary-300 px-4 py-2 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-200">
              Get Pro
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

