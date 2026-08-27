import Link from "next/link";
import { Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
              <Truck className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">BATARA MP P2H PORTAL</span>
              <p className="text-xs text-slate-500">PT Batara Mining &amp; Heavy Equipment</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="#about" className="hover:text-amber-400 transition-colors">Tentang P2H</Link>
            <Link href="#features" className="hover:text-amber-400 transition-colors">Fitur &amp; Keunggulan</Link>
            <Link href="/login" className="hover:text-amber-400 transition-colors">Login Portal</Link>
          </div>

          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PT Batara Mining. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
