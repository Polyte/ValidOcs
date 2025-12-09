'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkHealth, analyzeStatement, AnalyzeStatementResponse } from '@/lib/api';
import { FaUpload, FaFileAlt, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaTable, FaCode } from 'react-icons/fa';
import HealthIndicator from '@/components/HealthIndicator';
import JsonViewer from '@/components/JsonViewer';
import DataTable from '@/components/DataTable';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeStatementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (fileExtension && allowedTypes.includes(fileExtension)) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please upload a PDF, JPG, or PNG file');
        setFile(null);
      }
    }
  };

  // Auto health check on mount and periodically (background check for indicator only)
  const handleHealthCheck = useCallback(async () => {
    setHealthLoading(true);
    try {
      await checkHealth();
      setIsHealthy(true);
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    handleHealthCheck();
    const interval = setInterval(() => {
      handleHealthCheck();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [handleHealthCheck]);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setAnalyzeLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeStatement(file);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <FaShieldAlt className={styles.titleIcon} />
            <h1 className={styles.title}>ELITE Fraud Detection</h1>
          </div>
          <HealthIndicator isHealthy={isHealthy} isLoading={healthLoading} />
        </div>
        
        <p className={styles.description}>
          Upload your bank statement or document (PDF, JPG, PNG) to analyze for fraud detection and get real-time insights
        </p>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FaFileAlt className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Upload Bank Statement or Document</h2>
          </div>
          <div className={styles.uploadArea}>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className={styles.fileInput}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload" className={styles.fileLabel}>
              {file ? (
                <>
                  <FaFileAlt className={styles.fileIcon} />
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </>
              ) : (
                <>
                  <FaUpload className={styles.uploadIcon} />
                  <span>Choose a bank statement or document to upload</span>
                  <span className={styles.fileHint}>Supported formats: PDF, JPG, PNG</span>
                </>
              )}
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzeLoading || !file}
            className={`${styles.button} ${styles.analyzeButton}`}
          >
            {analyzeLoading ? (
              <>
                <FaSpinner className={`${styles.buttonIcon} ${styles.spinning}`} />
                Analyzing...
              </>
            ) : (
              <>
                <FaShieldAlt className={styles.buttonIcon} />
                Analyze Document
              </>
            )}
          </button>

          {error && (
            <div className={styles.error}>
              <FaExclamationTriangle className={styles.errorIcon} />
              <div className={styles.errorContent}>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {result && (
            <div className={styles.resultContainer}>
              <div className={styles.resultHeader}>
                <div className={styles.resultHeaderLeft}>
                  <FaCheckCircle className={styles.successIcon} />
                  <h3 className={styles.resultTitle}>Analysis Results</h3>
                </div>
                <div className={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`${styles.toggleButton} ${viewMode === 'table' ? styles.active : ''}`}
                    title="Table View"
                  >
                    <FaTable className={styles.toggleIcon} />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`${styles.toggleButton} ${viewMode === 'json' ? styles.active : ''}`}
                    title="JSON View"
                  >
                    <FaCode className={styles.toggleIcon} />
                    JSON
                  </button>
                </div>
              </div>
              {viewMode === 'table' ? (
                <DataTable data={result} />
              ) : (
                <JsonViewer data={result} />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

