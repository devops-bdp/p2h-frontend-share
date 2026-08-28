import ExcelJS from "exceljs";
import { P2HInspection } from "@/services/p2h.service";
import { Unit } from "@/services/unit.service";

/**
 * Mengambil logo dari public folder sebagai base64 string
 */
async function getLogoBase64(): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null;
    const response = await fetch("/logo-navbar-transparant1.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1];
        resolve(base64Content);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Export Riwayat P2H ke Excel (.xlsx) dengan tata letak resmi dan format styling korporat PT Batara Dharma Persada
 */
export async function exportP2HToExcel(
  inspections: P2HInspection[],
  filters?: {
    category?: string;
    shift?: string;
    section?: string;
    unitStatus?: string;
    search?: string;
  }
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PT Batara Dharma Persada - P2H System";
  workbook.lastModifiedBy = "P2H Portal";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Riwayat P2H Armada", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 8, showGridLines: true }],
    properties: { tabColor: { argb: "F59E0B" } },
  });

  // Embed Logo in Header
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    const logoId = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });
    worksheet.addImage(logoId, {
      tl: { col: 0.2, row: 0.15 },
      ext: { width: 50, height: 50 },
      editAs: "oneCell",
    });
  }

  // Calculate statistics
  const totalAll = inspections.length;
  const readyCount = inspections.filter(
    (i) => i.unitStatus === "LAYAK" || i.unitStatus === "SIAP"
  ).length;
  const notReadyCount = inspections.filter(
    (i) => i.unitStatus === "TIDAK_LAYAK" || i.unitStatus === "TIDAK_SIAP"
  ).length;
  const validatedCount = inspections.filter((i) => i.driverValidation).length;

  const nowStr = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 1. Title Banner (Rows 1 - 3)
  worksheet.mergeCells("A1:Q1");
  const title1 = worksheet.getCell("A1");
  title1.value = "PT BATARA DHARMA PERSADA (SITE MUARA PAHU)";
  title1.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "F59E0B" } };
  title1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F172A" } };
  title1.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells("A2:Q2");
  const title2 = worksheet.getCell("A2");
  title2.value = "REKAPITULASI & LAPORAN PEMERIKSAAN HARIAN ARMADA (P2H)";
  title2.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFF" } };
  title2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
  title2.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 24;

  const filterSummary = [
    filters?.category ? `Kategori: ${filters.category.replace(/_/g, " ")}` : "Semua Kategori",
    filters?.shift ? `Shift: ${filters.shift}` : "Semua Shift",
    filters?.section ? `Section: ${filters.section}` : "Semua Section",
    filters?.unitStatus ? `Status: ${filters.unitStatus}` : "Semua Status",
    `Diekspor Pada: ${nowStr}`,
  ].join("  |  ");

  worksheet.mergeCells("A3:Q3");
  const title3 = worksheet.getCell("A3");
  title3.value = filterSummary;
  title3.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "475569" } };
  title3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
  title3.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(3).height = 20;

  // Row 4 Empty Space
  worksheet.getRow(4).height = 10;

  // 2. Summary KPI Cards (Rows 5-6)
  // Card 1: Total Data (A5:C6)
  worksheet.mergeCells("A5:C5");
  worksheet.getCell("A5").value = "TOTAL PEMERIKSAAN P2H";
  worksheet.getCell("A5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "94A3B8" } };
  worksheet.getCell("A5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
  worksheet.getCell("A5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A6:C6");
  worksheet.getCell("A6").value = `${totalAll} Laporan`;
  worksheet.getCell("A6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "F59E0B" } };
  worksheet.getCell("A6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F172A" } };
  worksheet.getCell("A6").alignment = { vertical: "middle", horizontal: "center" };

  // Card 2: Armada Layak (E5:G6)
  worksheet.mergeCells("E5:G5");
  worksheet.getCell("E5").value = "ARMADA LAYAK / SIAP";
  worksheet.getCell("E5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "047857" } };
  worksheet.getCell("E5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DCFCE7" } };
  worksheet.getCell("E5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("E6:G6");
  worksheet.getCell("E6").value = `${readyCount} Unit (${totalAll > 0 ? Math.round((readyCount / totalAll) * 100) : 0}%)`;
  worksheet.getCell("E6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "15803D" } };
  worksheet.getCell("E6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "BBF7D0" } };
  worksheet.getCell("E6").alignment = { vertical: "middle", horizontal: "center" };

  // Card 3: Tidak Layak (I5:K6)
  worksheet.mergeCells("I5:K5");
  worksheet.getCell("I5").value = "TIDAK LAYAK / DEFECT";
  worksheet.getCell("I5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "B91C1C" } };
  worksheet.getCell("I5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEE2E2" } };
  worksheet.getCell("I5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("I6:K6");
  worksheet.getCell("I6").value = `${notReadyCount} Unit (${totalAll > 0 ? Math.round((notReadyCount / totalAll) * 100) : 0}%)`;
  worksheet.getCell("I6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "DC2626" } };
  worksheet.getCell("I6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FECACA" } };
  worksheet.getCell("I6").alignment = { vertical: "middle", horizontal: "center" };

  // Card 4: Terverifikasi (M5:O6)
  worksheet.mergeCells("M5:O5");
  worksheet.getCell("M5").value = "TERVALIDASI OPERATOR";
  worksheet.getCell("M5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "0369A1" } };
  worksheet.getCell("M5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E0F2FE" } };
  worksheet.getCell("M5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("M6:O6");
  worksheet.getCell("M6").value = `${validatedCount} Terverifikasi`;
  worksheet.getCell("M6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "0284C7" } };
  worksheet.getCell("M6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "BAE6FD" } };
  worksheet.getCell("M6").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.getRow(5).height = 18;
  worksheet.getRow(6).height = 24;

  // Row 7 Empty
  worksheet.getRow(7).height = 12;

  // 3. Table Header (Row 8)
  const headers = [
    "No",
    "No. P2H",
    "Tanggal",
    "Shift",
    "No. Lambung",
    "Kategori Unit",
    "Merk & Tipe",
    "No. Polisi",
    "Nama Operator / Driver",
    "NRP Driver",
    "Section / Dept",
    "Kilometer (KM)",
    "Hour Meter (HM)",
    "Kondisi Unit",
    "Status Driver",
    "Validasi Driver",
    "Catatan Pengawas / Temuan",
  ];

  const headerRow = worksheet.getRow(8);
  headerRow.values = headers;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "0F172A" } },
      bottom: { style: "medium", color: { argb: "F59E0B" } },
      left: { style: "thin", color: { argb: "334155" } },
      right: { style: "thin", color: { argb: "334155" } },
    };
  });

  // 4. Data Rows (Row 9+)
  inspections.forEach((item, index) => {
    const rowNumber = 9 + index;
    const row = worksheet.getRow(rowNumber);

    const isEven = index % 2 === 0;
    const baseBg = isEven ? "FFFFFF" : "F8FAFC";

    const isUnitReady = item.unitStatus === "LAYAK" || item.unitStatus === "SIAP";
    const isDriverReady = item.driverStatus === "LAYAK" || item.driverStatus === "SIAP";

    const formattedDate = item.date
      ? new Date(item.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

    row.values = [
      index + 1,
      item.p2hNo || "-",
      formattedDate,
      item.shift || "-",
      item.unit?.unitNo || "-",
      (item.unit?.category || "-").replace(/_/g, " "),
      `${item.unit?.brand || "-"} ${item.unit?.description ? `(${item.unit.description})` : ""}`.trim(),
      item.nopol || "-",
      item.driverName || "-",
      item.driverNrp || item.user?.nrp || "-",
      item.section || "-",
      item.km ?? 0,
      item.hourMeter !== null && item.hourMeter !== undefined ? item.hourMeter : "-",
      item.unitStatus ? item.unitStatus.replace(/_/g, " ") : "-",
      item.driverStatus ? item.driverStatus.replace(/_/g, " ") : "-",
      item.driverValidation ? "TERVALIDASI" : "BELUM",
      item.supervisorNotes || "-",
    ];

    row.height = 22;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Segoe UI", size: 9, color: { argb: "1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: baseBg } };
      cell.border = {
        top: { style: "thin", color: { argb: "E2E8F0" } },
        bottom: { style: "thin", color: { argb: "E2E8F0" } },
        left: { style: "thin", color: { argb: "E2E8F0" } },
        right: { style: "thin", color: { argb: "E2E8F0" } },
      };
      cell.alignment = { vertical: "middle" };

      // Specific column alignments & styling
      if (colNumber === 1) {
        // No
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "64748B" } };
      } else if (colNumber === 2) {
        // No P2H
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Consolas", size: 9, bold: true, color: { argb: "B45309" } };
      } else if (colNumber === 3 || colNumber === 4) {
        // Tanggal & Shift
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (colNumber === 5) {
        // No Lambung
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Consolas", size: 9.5, bold: true, color: { argb: "0F172A" } };
      } else if (colNumber === 8 || colNumber === 10) {
        // Nopol, NRP
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (colNumber === 12) {
        // KM
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.numFmt = "#,##0";
      } else if (colNumber === 13) {
        // HM
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (typeof cell.value === "number") cell.numFmt = "#,##0.0";
      } else if (colNumber === 14) {
        // Status Unit
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: isUnitReady ? "15803D" : "B91C1C" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isUnitReady ? "DCFCE7" : "FEE2E2" } };
      } else if (colNumber === 15) {
        // Status Driver
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: isDriverReady ? "15803D" : "B91C1C" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isDriverReady ? "DCFCE7" : "FEE2E2" } };
      } else if (colNumber === 16) {
        // Validasi
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: item.driverValidation ? "047857" : "64748B" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: item.driverValidation ? "ECFDF5" : baseBg } };
      }
    });
  });

  // Auto-fit Column Widths
  const colWidths = [6, 23, 13, 10, 16, 22, 26, 15, 24, 15, 18, 16, 16, 16, 16, 16, 35];
  colWidths.forEach((w, idx) => {
    worksheet.getColumn(idx + 1).width = w;
  });

  // Enable AutoFilter on header
  worksheet.autoFilter = `A8:Q${8 + inspections.length}`;

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const catLabel = filters?.category ? `_${filters.category}` : "_Semua_Kategori";
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `Laporan_P2H_Armada_Batara${catLabel}_${dateStr}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Daftar Unit Armada ke Excel (.xlsx) dengan styling premium
 */
export async function exportUnitsToExcel(
  units: Unit[],
  filters?: {
    category?: string;
    status?: string;
  }
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PT Batara Dharma Persada - P2H System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Master Data Unit", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 8, showGridLines: true }],
    properties: { tabColor: { argb: "F59E0B" } },
  });

  // Embed Logo in Header
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    const logoId = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });
    worksheet.addImage(logoId, {
      tl: { col: 0.2, row: 0.15 },
      ext: { width: 50, height: 50 },
      editAs: "oneCell",
    });
  }

  const totalAll = units.length;
  const activeCount = units.filter((u) => u.status === "ACTIVE").length;
  const inactiveCount = units.filter((u) => u.status === "INACTIVE").length;

  const nowStr = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Title Banner
  worksheet.mergeCells("A1:J1");
  const title1 = worksheet.getCell("A1");
  title1.value = "PT BATARA DHARMA PERSADA (SITE MUARA PAHU)";
  title1.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "F59E0B" } };
  title1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F172A" } };
  title1.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells("A2:J2");
  const title2 = worksheet.getCell("A2");
  title2.value = "MASTER DATA ARMADA & KENDARAAN OPERASIONAL";
  title2.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFF" } };
  title2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
  title2.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 24;

  worksheet.mergeCells("A3:J3");
  const title3 = worksheet.getCell("A3");
  title3.value = `Kategori: ${filters?.category ? filters.category.replace(/_/g, " ") : "Semua Kategori"}  |  Status: ${filters?.status || "Semua"}  |  Diekspor Pada: ${nowStr}`;
  title3.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "475569" } };
  title3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
  title3.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(3).height = 20;

  worksheet.getRow(4).height = 10;

  // KPI Summary
  worksheet.mergeCells("A5:C5");
  worksheet.getCell("A5").value = "TOTAL UNIT ARMADA";
  worksheet.getCell("A5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "94A3B8" } };
  worksheet.getCell("A5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
  worksheet.getCell("A5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A6:C6");
  worksheet.getCell("A6").value = `${totalAll} Unit`;
  worksheet.getCell("A6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "F59E0B" } };
  worksheet.getCell("A6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F172A" } };
  worksheet.getCell("A6").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("E5:G5");
  worksheet.getCell("E5").value = "ARMADA AKTIF";
  worksheet.getCell("E5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "047857" } };
  worksheet.getCell("E5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DCFCE7" } };
  worksheet.getCell("E5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("E6:G6");
  worksheet.getCell("E6").value = `${activeCount} Aktif`;
  worksheet.getCell("E6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "15803D" } };
  worksheet.getCell("E6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "BBF7D0" } };
  worksheet.getCell("E6").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("H5:J5");
  worksheet.getCell("H5").value = "ARMADA NON-AKTIF";
  worksheet.getCell("H5").font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "B91C1C" } };
  worksheet.getCell("H5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEE2E2" } };
  worksheet.getCell("H5").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("H6:J6");
  worksheet.getCell("H6").value = `${inactiveCount} Unit`;
  worksheet.getCell("H6").font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "DC2626" } };
  worksheet.getCell("H6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FECACA" } };
  worksheet.getCell("H6").alignment = { vertical: "middle", horizontal: "center" };

  worksheet.getRow(5).height = 18;
  worksheet.getRow(6).height = 24;
  worksheet.getRow(7).height = 12;

  // Header Row (Row 8)
  const headers = [
    "No",
    "No. Lambung",
    "Kategori Unit",
    "Merk / Brand",
    "Tipe / Deskripsi",
    "Kepemilikan / Kontraktor",
    "Kilometer (KM)",
    "Hour Meter (HM)",
    "Status Unit",
    "Tanggal Registrasi",
  ];

  const headerRow = worksheet.getRow(8);
  headerRow.values = headers;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "medium", color: { argb: "0F172A" } },
      bottom: { style: "medium", color: { argb: "F59E0B" } },
      left: { style: "thin", color: { argb: "334155" } },
      right: { style: "thin", color: { argb: "334155" } },
    };
  });

  // Data Rows
  units.forEach((u, idx) => {
    const row = worksheet.getRow(9 + idx);
    const isEven = idx % 2 === 0;
    const baseBg = isEven ? "FFFFFF" : "F8FAFC";
    const isActive = u.status === "ACTIVE";

    row.values = [
      idx + 1,
      u.unitNo || "-",
      (u.category || "-").replace(/_/g, " "),
      u.brand || "-",
      u.description || "-",
      u.ownerName || "-",
      u.km ?? 0,
      u.hourMeter ?? "-",
      u.status || "-",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-",
    ];

    row.height = 22;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Segoe UI", size: 9, color: { argb: "1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: baseBg } };
      cell.border = {
        top: { style: "thin", color: { argb: "E2E8F0" } },
        bottom: { style: "thin", color: { argb: "E2E8F0" } },
        left: { style: "thin", color: { argb: "E2E8F0" } },
        right: { style: "thin", color: { argb: "E2E8F0" } },
      };
      cell.alignment = { vertical: "middle" };

      if (colNumber === 1) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "64748B" } };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Consolas", size: 9.5, bold: true, color: { argb: "B45309" } };
      } else if (colNumber === 7) {
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.numFmt = "#,##0";
      } else if (colNumber === 8) {
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (typeof cell.value === "number") cell.numFmt = "#,##0.0";
      } else if (colNumber === 9) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: isActive ? "15803D" : "B91C1C" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isActive ? "DCFCE7" : "FEE2E2" } };
      } else if (colNumber === 10) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
    });
  });

  const colWidths = [6, 16, 22, 18, 26, 22, 16, 16, 16, 16];
  colWidths.forEach((w, idx) => {
    worksheet.getColumn(idx + 1).width = w;
  });

  worksheet.autoFilter = `A8:J${8 + units.length}`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const catLabel = filters?.category ? `_${filters.category}` : "_Semua_Kategori";
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `Master_Data_Armada_Batara${catLabel}_${dateStr}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
