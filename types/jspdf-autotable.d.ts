declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    styles?: {
      fontSize?: number;
      cellPadding?: number;
      [key: string]: any;
    };
    headStyles?: {
      fillColor?: number[] | string;
      textColor?: number | number[];
      fontStyle?: string;
      [key: string]: any;
    };
    alternateRowStyles?: {
      fillColor?: number[] | string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}

