"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ArrowRight, UserCircle } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo — full logo replaces all text */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="group-hover:opacity-90 transition-opacity duration-200">
              <img
                src="/logo-navbar-transparant1.png"
                alt="Plant Maintenance Muara Pahu Site"
                className="h-14 md:h-16 w-auto object-contain"
                style={{ display: "block" }}
              />
            </div>
            {/* Brand Text */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-extrabold text-base md:text-lg tracking-wide text-slate-200 uppercase">
                Plant Maintenance
              </span>
              <span className="font-bold text-sm md:text-base tracking-widest text-teal-400 uppercase">
                Muara Pahu Site
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#about"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
            >
              Tentang P2H
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
            >
              Fitur &amp; Keunggulan
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
            >
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span>Login Portal</span>
            </Link>
            <Link
              href="/p2h"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mulai P2H</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Link
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
          >
            Tentang P2H
          </Link>
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
          >
            Fitur &amp; Keunggulan
          </Link>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
            >
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span>Login Portal</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mulai P2H Sekarang</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}