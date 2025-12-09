'use client';

import { useState } from 'react';
import { 
  FaDownload, 
  FaFileCsv, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCode,
  FaSpinner 
} from 'react-icons/fa';
import { exportData, ExportFormat } from '@/lib/export';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
  data: any;
  filename?: string;
}

export default function ExportButton({ data, filename }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setShowMenu(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      exportData(data, format, { filename });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { format: 'csv' as ExportFormat, label: 'CSV', icon: FaFileCsv, color: '#10b981' },
    { format: 'excel' as ExportFormat, label: 'Excel', icon: FaFileExcel, color: '#059669' },
    { format: 'pdf' as ExportFormat, label: 'PDF', icon: FaFilePdf, color: '#ef4444' },
    { format: 'json' as ExportFormat, label: 'JSON', icon: FaFileCode, color: '#667eea' },
  ];

  return (
    <div className={styles.exportContainer}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !data}
        className={styles.exportButton}
        title="Export Data"
      >
        {isExporting ? (
          <>
            <FaSpinner className={`${styles.icon} ${styles.spinning}`} />
            Exporting...
          </>
        ) : (
          <>
            <FaDownload className={styles.icon} />
            Export
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <>
          <div 
            className={styles.overlay}
            onClick={() => setShowMenu(false)}
          />
          <div className={styles.menu}>
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className={styles.menuItem}
                  style={{ '--color': option.color } as React.CSSProperties}
                >
                  <Icon className={styles.menuIcon} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

