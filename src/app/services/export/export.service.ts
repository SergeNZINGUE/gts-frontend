import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportPdf(title: string, filename: string, headers: string[], rows: (string | number)[][], foot?: (string | number)[][]): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(13);
    doc.text(title, 14, 14);
    autoTable(doc, {
      head: [headers],
      body: rows,
      foot: foot,
      startY: 22,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [230, 240, 250], textColor: 0, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      showFoot: 'lastPage',
    });
    doc.save(`${filename}.pdf`);
  }

  exportExcel(filename: string, headers: string[], rows: (string | number)[][]): void {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}