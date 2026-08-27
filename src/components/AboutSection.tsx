import { ShieldCheck, Wrench, Award } from "lucide-react";

export default function AboutSection() {
  const points = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: "Nol Kecelakaan (Zero Harm)",
      desc: "Memastikan fungsi rem, kemudi, alarm mundur, dan lampu rotary bekerja sempurna untuk mencegah insiden di area kerja.",
    },
    {
      icon: <Wrench className="w-6 h-6 text-emerald-400" />,
      title: "Cegah Kerusakan Parah",
      desc: "Mendeteksi penurunan volume oli, temperatur mesin tinggi, atau getaran abnormal sebelum unit mengalami breakdown total.",
    },
    {
      icon: <Award className="w-6 h-6 text-indigo-400" />,
      title: "Akuntabilitas & Audit Trail",
      desc: "Semua input terikat dengan NRP operator, tanggal, jam inspeksi, dan disupervisi langsung oleh Site Supervisor.",
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 border-b border-slate-850 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Pentingnya Pemeriksaan Harian
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mengapa P2H Menjadi Kunci Utama Operasional Tambang?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            P2H (Pelaksanaan Pemeriksaan Harian) adalah prosedur standar operasional wajib sebelum alat berat dan sarana pendukung dihidupkan. Melalui aplikasi ini, proses checklist yang tadinya memakan waktu kini dapat diselesaikan dalam hitungan menit secara digital dengan dokumentasi yang terverifikasi.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
