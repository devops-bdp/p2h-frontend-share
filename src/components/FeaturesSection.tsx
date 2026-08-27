import {
  FileSpreadsheet,
  AlertTriangle,
  Activity,
  HardHat,
  Layers,
  Clock,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-amber-400" />,
      title: "100% Digital Checklist",
      desc: "Menghilangkan formulir kertas manual. Formulir checklist otomatis tersimpan rapi dan dapat diakses kapan saja.",
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
      title: "Deteksi Dini & Defect Alert",
      desc: "Temuan kerusakan langsung diteruskan secara real-time ke tim Mekanik & Departemen Plant sebelum unit beroperasi.",
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      title: "Tracking KM & Hour Meter",
      desc: "Pencatatan akurat kilometer dan hour meter harian untuk penjadwalan servis berkala (Periodic Service).",
    },
    {
      icon: <HardHat className="w-6 h-6 text-amber-400" />,
      title: "Kepatuhan K3 & Standar K3LH",
      desc: "Mendukung standar keselamatan pertambangan (Golden Rules K3) dan audit kepatuhan kelaikan operasi unit.",
    },
    {
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      title: "Otorisasi Khusus Plant & Ops",
      desc: "Hak akses terproteksi untuk registrasi dan modifikasi data armada khusus Departemen Plant dan Operations.",
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      title: "Riwayat Inspeksi Terstruktur",
      desc: "Logbook riwayat pemeriksaan harian setiap nomor lambung unit terekam lengkap dan siap diekspor untuk laporan.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Fitur Unggulan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Fitur Lengkap untuk Produktivitas Armada
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Dirancang khusus untuk operator lapangan, mekanik, supervisor site, dan manajemen plant.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
