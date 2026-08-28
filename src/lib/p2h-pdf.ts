import { P2HInspection } from "@/services/p2h.service";

/**
 * Membuka formulir P2H terformat standar cetak A4 dan memicu dialog Print / Save to PDF di browser
 */
export function generateAndPrintP2HPdf(inspection: P2HInspection) {
  if (!inspection || typeof window === "undefined") return;

  const inspectionDate = inspection.date
    ? new Date(inspection.date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  const isUnitReady =
    inspection.unitStatus === "LAYAK" || inspection.unitStatus === "SIAP";
  const isDriverReady =
    inspection.driverStatus === "LAYAK" || inspection.driverStatus === "SIAP";

  // Format kategori armada
  const categoryLabel = (inspection.unit?.category || "FLEET").replace(/_/g, " ");

  // 1. Checklist Items Grouping
  let checklistHtml = "";
  const checks = (inspection.damageChecks as any[]) || [];

  if (checks.length > 0) {
    const grouped: { [cat: string]: any[] } = {};
    checks.forEach((chk) => {
      const cat = chk.category || "Pemeriksaan Item Checklist";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(chk);
    });

    Object.keys(grouped).forEach((catName) => {
      const items = grouped[catName];
      checklistHtml += `
        <div style="margin-top: 8px; margin-bottom: 4px; font-weight: bold; font-size: 10px; color: #1e293b; background: #f1f5f9; padding: 4px 8px; border-left: 3px solid #d97706;">
          ${catName}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; text-align: left;">
              <th style="padding: 3px 6px; width: 25px; text-align: center;">No</th>
              <th style="padding: 3px 6px;">Item Pemeriksaan</th>
              <th style="padding: 3px 6px; width: 85px; text-align: center;">Kondisi</th>
              <th style="padding: 3px 6px; width: 170px;">Catatan / Temuan</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((chk, idx) => {
                const isGood =
                  chk.condition === "BAIK" ||
                  chk.condition === "NORMAL" ||
                  chk.condition === "ADA";
                return `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 3px 6px; text-align: center;">${chk.id || idx + 1}</td>
                    <td style="padding: 3px 6px;">${chk.item}</td>
                    <td style="padding: 3px 6px; text-align: center; font-weight: bold; color: ${isGood ? "#059669" : "#dc2626"};">
                      ${chk.condition || "-"}
                    </td>
                    <td style="padding: 3px 6px; color: #64748b;">${chk.note || "-"}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      `;
    });
  }

  // 2. Safety Tools
  let safetyToolsHtml = "";
  if (inspection.safetyTools && inspection.safetyTools.length > 0) {
    safetyToolsHtml = `
      <div style="margin-top: 8px; margin-bottom: 4px; font-weight: bold; font-size: 10px; color: #1e293b; background: #f1f5f9; padding: 4px 8px; border-left: 3px solid #0284c7;">
        PERLENGKAPAN KESELAMATAN & K3
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; text-align: left;">
            <th style="padding: 3px 6px; width: 25px; text-align: center;">No</th>
            <th style="padding: 3px 6px;">Item Perlengkapan</th>
            <th style="padding: 3px 6px; width: 85px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${inspection.safetyTools
            .map(
              (st, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 3px 6px; text-align: center;">${idx + 1}</td>
                <td style="padding: 3px 6px;">${st.item}</td>
                <td style="padding: 3px 6px; text-align: center; font-weight: bold; color: ${st.status === "ADA" ? "#059669" : "#dc2626"};">
                  ${st.status}
                </td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // 3. Fit To Work
  let fitToWorkHtml = "";
  if (inspection.fitToWork && inspection.fitToWork.length > 0) {
    fitToWorkHtml = `
      <div style="margin-top: 8px; margin-bottom: 4px; font-weight: bold; font-size: 10px; color: #1e293b; background: #f1f5f9; padding: 4px 8px; border-left: 3px solid #7c3aed;">
        KELAYAKAN OPERATOR (FIT TO WORK)
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; text-align: left;">
            <th style="padding: 3px 6px; width: 25px; text-align: center;">No</th>
            <th style="padding: 3px 6px;">Pertanyaan Kesiapan & Kesehatan</th>
            <th style="padding: 3px 6px; width: 85px; text-align: center;">Jawaban</th>
          </tr>
        </thead>
        <tbody>
          ${inspection.fitToWork
            .map(
              (ftw, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 3px 6px; text-align: center;">${idx + 1}</td>
                <td style="padding: 3px 6px;">${ftw.question}</td>
                <td style="padding: 3px 6px; text-align: center; font-weight: bold; color: ${ftw.answer === "YA" ? "#059669" : "#d97706"};">
                  ${ftw.answer}
                </td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up terblokir. Izinkan pop-up browser untuk mencetak / mengunduh PDF.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Formulir_P2H_${inspection.p2hNo}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-size: 10.5px;
            line-height: 1.35;
          }
          .header-box {
            border: 2px solid #0f172a;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            background: #fff;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
            margin-bottom: 8px;
          }
          .info-table td {
            padding: 3.5px 6px;
            border: 1px solid #cbd5e1;
          }
          .info-label {
            background-color: #f8fafc;
            font-weight: 600;
            width: 18%;
            color: #475569;
          }
          .info-value {
            width: 32%;
            font-weight: 700;
            color: #0f172a;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-weight: 800;
            font-size: 9.5px;
          }
          .status-ready {
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
          }
          .status-not-ready {
            background: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
          }
          .signature-box {
            width: 100%;
            margin-top: 14px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-cell {
            width: 46%;
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: center;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header Dokumen -->
        <div class="header-box">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo-navbar-transparant1.png" style="height: 42px; width: 42px; object-fit: contain;" alt="Logo Batara" />
            <div>
              <div style="font-size: 13px; font-weight: 900; letter-spacing: 0.5px; color: #b45309;">PT BATARA DHARMA PERSADA (SITE MUARA PAHU)</div>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase;">FORMULIR PEMERIKSAAN HARIAN ARMADA (P2H)</div>
              <div style="font-size: 9px; color: #64748b;">Kategori Armada: ${categoryLabel}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #b45309;">${inspection.p2hNo}</div>
            <div style="font-size: 9px; color: #64748b;">Tgl: ${inspectionDate} &bull; SIFT ${inspection.shift}</div>
          </div>
        </div>

        <!-- Identitas Unit & Operator -->
        <table class="info-table">
          <tr>
            <td class="info-label">No. Lambung Unit</td>
            <td class="info-value" style="color: #b45309; font-family: monospace; font-size: 10.5px;">${inspection.unit?.unitNo || "-"}</td>
            <td class="info-label">Nama Driver / Operator</td>
            <td class="info-value">${inspection.driverName || "-"}</td>
          </tr>
          <tr>
            <td class="info-label">Merk & Tipe Unit</td>
            <td class="info-value">${inspection.unit?.brand || "-"} ${inspection.unit?.description ? `(${inspection.unit.description})` : ""}</td>
            <td class="info-label">NRP Operator</td>
            <td class="info-value">${inspection.driverNrp || inspection.user?.nrp || "-"}</td>
          </tr>
          <tr>
            <td class="info-label">Nomor Polisi (Nopol)</td>
            <td class="info-value">${inspection.nopol || "-"}</td>
            <td class="info-label">Section / Departemen</td>
            <td class="info-value">${inspection.section || "-"}</td>
          </tr>
          <tr>
            <td class="info-label">Kilometer (KM)</td>
            <td class="info-value">${inspection.km.toLocaleString()} KM</td>
            <td class="info-label">Hour Meter (HM)</td>
            <td class="info-value">${inspection.hourMeter !== null && inspection.hourMeter !== undefined ? `${inspection.hourMeter} HM` : "-"}</td>
          </tr>
          <tr>
            <td class="info-label">Status Kelayakan Unit</td>
            <td class="info-value">
              <span class="status-badge ${isUnitReady ? "status-ready" : "status-not-ready"}">
                ${inspection.unitStatus.replace(/_/g, " ")}
              </span>
            </td>
            <td class="info-label">Status Operator</td>
            <td class="info-value">
              <span class="status-badge ${isDriverReady ? "status-ready" : "status-not-ready"}">
                ${inspection.driverStatus.replace(/_/g, " ")}
              </span>
            </td>
          </tr>
        </table>

        <!-- Checklist Item -->
        ${checklistHtml}
        ${safetyToolsHtml}
        ${fitToWorkHtml}

        <!-- Catatan Pengawas -->
        ${
          inspection.supervisorNotes
            ? `
          <div style="margin-top: 6px; padding: 6px 10px; border: 1px solid #cbd5e1; background: #fafafa; border-radius: 4px;">
            <strong style="font-size: 9.5px; color: #475569;">Temuan & Catatan Pengawas / Supervisor:</strong>
            <div style="font-size: 9.5px; margin-top: 2px; color: #1e293b;">${inspection.supervisorNotes}</div>
          </div>
        `
            : ""
        }

        <!-- Tanda Tangan Otorisasi -->
        <div class="signature-box">
          <div class="sig-cell" style="background: #f8fafc; position: relative;">
            <div style="font-size: 9.5px; color: #64748b;">Dibuat / Diperiksa Oleh:</div>
            <div style="font-size: 9.5px; font-weight: bold; margin-top: 1px; color: #0f172a;">Operator / Driver</div>
            
            <!-- Stempel Digital Approved -->
            <div style="margin: 6px auto; display: inline-block; padding: 4px 10px; border: 2px solid #059669; border-radius: 6px; background: #ecfdf5; text-align: center;">
              <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.8px; color: #059669; line-height: 1.1;">
                ✔ APPROVED
              </div>
              <div style="font-size: 7.5px; font-weight: 700; color: #047857; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                TERVERIFIKASI DIGITAL SISTEM P2H
              </div>
              <div style="font-size: 7px; color: #64748b; margin-top: 1px;">
                Tgl: ${inspectionDate} &bull; SIFT ${inspection.shift}
              </div>
            </div>

            <div style="font-weight: bold; border-top: 1px dashed #94a3b8; padding-top: 2px; color: #0f172a;">
              ${inspection.driverName || "Operator"}
            </div>
            <div style="font-size: 8.5px; color: #64748b;">NRP: ${inspection.driverNrp || "-"}</div>
          </div>

          <div class="sig-cell">
            <div style="font-size: 9.5px; color: #64748b;">Diketahui & Divalidasi Oleh:</div>
            <div style="font-size: 9.5px; font-weight: bold; margin-top: 1px; color: #0f172a;">Pengawas / Supervisor Site</div>
            <div style="height: 48px;"></div>
            <div style="font-weight: bold; border-top: 1px dashed #94a3b8; padding-top: 2px; color: #0f172a;">
              (...................................................)
            </div>
            <div style="font-size: 8.5px; color: #64748b;">Section: ${inspection.section || "PLANT / OPERATIONS"}</div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
