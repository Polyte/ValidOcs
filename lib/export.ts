import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
// @ts-ignore - jsPDF autotable doesn't have proper types
import 'jspdf-autotable';

export type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

/**
 * Convert data to table format for export
 */
function prepareTableData(data: any): { headers: string[]; rows: any[][] } {
  if (!data) {
    return { headers: [], rows: [] };
  }

  // If data is an array
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { headers: [], rows: [] };
    }

    // If array of objects
    if (typeof data[0] === 'object' && data[0] !== null) {
      const headers = Object.keys(data[0]);
      const rows = data.map(item =>
        headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      );
      return { headers, rows };
    }

    // Array of primitives
    return {
      headers: ['Value'],
      rows: data.map(item => [String(item)]),
    };
  }

  // If data is an object
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    return {
      headers: ['Property', 'Value'],
      rows: entries.map(([key, value]) => [
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      ]),
    };
  }

  // Single value
  return {
    headers: ['Result'],
    rows: [[String(data)]],
  };
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any, options: ExportOptions = {}): void {
  const { headers, rows } = prepareTableData(data);
  const filename = options.filename || 'export.csv';

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const cellStr = String(cell);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

/**
 * Export data to Excel format
 */
export function exportToExcel(data: any, options: ExportOptions = {}): void {
  const { headers, rows } = prepareTableData(data);
  const filename = options.filename || 'export.xlsx';
  const sheetName = options.sheetName || 'Sheet1';

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const colWidths = headers.map((_, index) => {
    const maxLength = Math.max(
      headers[index].length,
      ...rows.map(row => String(row[index] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate file and download
  XLSX.writeFile(wb, filename);
}

/**
 * Export data to PDF format
 */
export function exportToPDF(data: any, options: ExportOptions = {}): void {
  const { headers, rows } = prepareTableData(data);
  const filename = options.filename || 'export.pdf';

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Fraud Detection Analysis Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  // Add table using autoTable (extends jsPDF prototype)
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 28,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 28 },
  });

  // Save PDF
  doc.save(filename);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, options: ExportOptions = {}): void {
  const filename = options.filename || 'export.json';
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, filename);
}

/**
 * Main export function
 */
export function exportData(
  data: any,
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `fraud-detection-export-${timestamp}`;

  const exportOptions = {
    filename: options.filename || `${defaultFilename}.${format === 'excel' ? 'xlsx' : format}`,
    ...options,
  };

  switch (format) {
    case 'csv':
      exportToCSV(data, exportOptions);
      break;
    case 'excel':
      exportToExcel(data, exportOptions);
      break;
    case 'pdf':
      exportToPDF(data, exportOptions);
      break;
    case 'json':
      exportToJSON(data, exportOptions);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

