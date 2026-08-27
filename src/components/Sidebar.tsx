"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  X,
  Shield,
  Building2,
  ChevronRight,
  HardHat,
} from "lucide-react";
import { getAuthSession, clearAuthSession } from "@/services/auth.service";
import { showConfirmDialog, showToast } from "@/lib/swal";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    nrp?: number;
    role?: string;
    department?: string;
    posision?: string;
  } | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (session.user) {
      setUser(session.user);
    }
  }, []);

  const handleLogout = async () => {
    const isConfirmed = await showConfirmDialog({
      title: "Keluar dari Sesi?",
      text: "Anda akan keluar dari dashboard sistem dan diarahkan ke halaman login.",
      confirmButtonText: "Ya, Keluar",
      isDanger: true,
    });

    if (isConfirmed) {
      clearAuthSession();
      showToast("Anda telah keluar dari sesi", "info");
      router.push("/login");
    }
  };

  const navItems = [
    {
      title: "Dashboard Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      title: "Kelola Unit Fleet",
      href: "/dashboard/units",
      icon: <Truck className="w-5 h-5" />,
      badge: "Plant & Ops",
    },
    {
      title: "Form & Checklist P2H",
      href: "/dashboard/p2h",
      icon: <ClipboardCheck className="w-5 h-5" />,
    },
    {
      title: "Defect & Breakdown",
      href: "/dashboard/defects",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      title: "Manajemen User",
      href: "/dashboard/users",
      icon: <Users className="w-5 h-5" />,
      badge: "Admin",
    },
    {
      title: "Pengaturan Sistem",
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 max-w-xs md:w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section: Brand & User Profile */}
        <div>
          {/* Brand Header */}
          <div className="h-16 md:h-20 flex items-center justify-between px-4 border-b border-slate-850">
            <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div className="group-hover:opacity-90 transition-opacity duration-200 shrink-0">
                <img
                  src="/logo-navbar-transparant1.png"
                  alt="Plant Maintenance Muara Pahu Site"
                  className="h-10 md:h-12 w-auto object-contain"
                  style={{ display: "block" }}
                />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-extrabold text-xs tracking-wide text-slate-200 uppercase truncate">
                  Plant Maintenance
                </span>
                <span className="font-bold text-[10px] tracking-wider text-teal-400 uppercase truncate">
                  Muara Pahu Site
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 shrink-0"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Profile Card */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xs font-bold text-white truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "User Portal"}
                </h2>
                <div className="text-xs text-slate-400 truncate">
                  NRP: <span className="text-slate-300 font-medium">{user?.nrp || "-"}</span>
                </div>
              </div>
            </div>

            {/* Role & Department Badges */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Shield className="w-3 h-3" />
                <span>{user?.role || "ADMIN"}</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium truncate">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{user?.department || "SITE"}</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-slate-950" : "text-slate-400 group-hover:text-amber-400 transition-colors"}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Site Info & Logout */}
        <div className="p-3 border-t border-slate-850 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span>Shift: Siang</span>
            </div>
            <span className="text-emerald-400 font-semibold">&bull; Online</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
