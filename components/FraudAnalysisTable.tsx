'use client';

import { useState } from 'react';
import {
  FaShieldAlt,
  FaBuilding,
  FaUser,
  FaIdCard,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaCalendarAlt,
  FaHashtag,
  FaList
} from 'react-icons/fa';
import ExportButton from './ExportButton';
import styles from './FraudAnalysisTable.module.css';

interface ImportantTransaction {
  description: string;
  amount: number;
  direction: 'in' | 'out';
}

interface FraudAnalysisData {
  summary?: string;
  bank?: string;
  account_holder?: string | null;
  account_number?: string;
  opening_balance?: number;
  closing_balance?: number;
  total_in?: number;
  total_out?: number;
  important_transactions?: ImportantTransaction[];
  calculated_closing?: number;
  balance_difference?: number;
  file_hash?: string;
  technical?: {
    creation_date_raw?: string;
    mod_date_raw?: string;
  };
  score?: number;
  status?: string;
}

interface FraudAnalysisTableProps {
  data: FraudAnalysisData | any;
}

export default function FraudAnalysisTable({ data }: FraudAnalysisTableProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  // Extract score and status from summary if not directly available
  const getScoreAndStatus = () => {
    if (data.score && data.status) {
      return { score: data.score, status: data.status };
    }
    if (data.summary) {
      const scoreMatch = data.summary.match(/Score:\s*(\d+)/);
      const statusMatch = data.summary.match(/Status:\s*(\w+)/);
      return {
        score: scoreMatch ? parseInt(scoreMatch[1]) : null,
        status: statusMatch ? statusMatch[1] : null,
      };
    }
    return { score: null, status: null };
  };

  const { score, status } = getScoreAndStatus();
  const isFraudulent = status?.toLowerCase() === 'fraudulent';
  const isSuspicious = score !== null && score > 50;

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    // Handle PDF date format: D:20250804151356+02'00'
    if (dateString.startsWith('D:')) {
      const datePart = dateString.substring(2, 10); // YYYYMMDD
      const year = datePart.substring(0, 4);
      const month = datePart.substring(4, 6);
      const day = datePart.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  return (
    <div className={styles.container}>
      {/* Summary Card */}
      {data.summary && (
        <div className={`${styles.summaryCard} ${isFraudulent ? styles.fraudulent : isSuspicious ? styles.suspicious : styles.safe}`}>
          <div className={styles.summaryHeader}>
            <FaShieldAlt className={styles.summaryIcon} />
            <h3 className={styles.summaryTitle}>Analysis Summary</h3>
            {isFraudulent && (
              <span className={styles.fraudBadge}>
                <FaExclamationTriangle /> Fraudulent
              </span>
            )}
            {isSuspicious && !isFraudulent && (
              <span className={styles.suspiciousBadge}>
                <FaExclamationTriangle /> Suspicious
              </span>
            )}
            {!isFraudulent && !isSuspicious && (
              <span className={styles.safeBadge}>
                <FaCheckCircle /> Safe
              </span>
            )}
          </div>
          <p className={styles.summaryText}>{data.summary}</p>
          {score !== null && (
            <div className={styles.scoreContainer}>
              <span className={styles.scoreLabel}>Risk Score:</span>
              <span className={`${styles.scoreValue} ${score > 70 ? styles.highRisk : score > 40 ? styles.mediumRisk : styles.lowRisk}`}>
                {score}/100
              </span>
            </div>
          )}
        </div>
      )}

      {/* Account Information Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FaBuilding className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>Account Information</h3>
        </div>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td className={styles.labelCell}>
                <FaBuilding className={styles.cellIcon} />
                Bank
              </td>
              <td className={styles.valueCell}>{data.bank || 'N/A'}</td>
            </tr>
            <tr>
              <td className={styles.labelCell}>
                <FaUser className={styles.cellIcon} />
                Account Holder
              </td>
              <td className={styles.valueCell}>
                {data.account_holder || <span className={styles.na}>Not Available</span>}
              </td>
            </tr>
            <tr>
              <td className={styles.labelCell}>
                <FaIdCard className={styles.cellIcon} />
                Account Number
              </td>
              <td className={styles.valueCell}>{data.account_number || 'N/A'}</td>
            </tr>
            <tr>
              <td className={styles.labelCell}>
                <FaDollarSign className={styles.cellIcon} />
                Opening Balance
              </td>
              <td className={`${styles.valueCell} ${styles.currency}`}>
                {formatCurrency(data.opening_balance)}
              </td>
            </tr>
            <tr>
              <td className={styles.labelCell}>
                <FaDollarSign className={styles.cellIcon} />
                Closing Balance
              </td>
              <td className={`${styles.valueCell} ${styles.currency}`}>
                {formatCurrency(data.closing_balance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FaDollarSign className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>Financial Summary</h3>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headerCell}>Type</th>
              <th className={styles.headerCell}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.positiveRow}>
              <td className={styles.labelCell}>
                <FaArrowUp className={styles.cellIcon} />
                Total In
              </td>
              <td className={`${styles.valueCell} ${styles.positive}`}>
                {formatCurrency(data.total_in)}
              </td>
            </tr>
            <tr className={styles.negativeRow}>
              <td className={styles.labelCell}>
                <FaArrowDown className={styles.cellIcon} />
                Total Out
              </td>
              <td className={`${styles.valueCell} ${styles.negative}`}>
                {formatCurrency(data.total_out)}
              </td>
            </tr>
            <tr>
              <td className={styles.labelCell}>
                <FaDollarSign className={styles.cellIcon} />
                Calculated Closing
              </td>
              <td className={`${styles.valueCell} ${styles.currency}`}>
                {formatCurrency(data.calculated_closing)}
              </td>
            </tr>
            <tr className={data.balance_difference && Math.abs(data.balance_difference) > 1000 ? styles.warningRow : ''}>
              <td className={styles.labelCell}>
                <FaExclamationTriangle className={styles.cellIcon} />
                Balance Difference
              </td>
              <td className={`${styles.valueCell} ${data.balance_difference && Math.abs(data.balance_difference) > 1000 ? styles.warning : styles.currency}`}>
                {formatCurrency(data.balance_difference)}
                {data.balance_difference && Math.abs(data.balance_difference) > 1000 && (
                  <span className={styles.warningBadge}>Significant Discrepancy</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Important Transactions Table */}
      {data.important_transactions && data.important_transactions.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FaList className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>
              Important Transactions ({data.important_transactions.length})
            </h3>
            <ExportButton data={data.important_transactions} filename="important-transactions" />
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.transactionsTable}>
              <thead>
                <tr>
                  <th className={styles.headerCell}>Description</th>
                  <th className={styles.headerCell}>Direction</th>
                  <th className={styles.headerCell}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.important_transactions.map((transaction: ImportantTransaction, index: number) => (
                  <tr key={index} className={transaction.direction === 'in' ? styles.positiveRow : styles.negativeRow}>
                    <td className={styles.descriptionCell}>{transaction.description}</td>
                    <td className={styles.directionCell}>
                      <span className={`${styles.directionBadge} ${transaction.direction === 'in' ? styles.in : styles.out}`}>
                        {transaction.direction === 'in' ? (
                          <>
                            <FaArrowUp /> In
                          </>
                        ) : (
                          <>
                            <FaArrowDown /> Out
                          </>
                        )}
                      </span>
                    </td>
                    <td className={`${styles.valueCell} ${transaction.direction === 'in' ? styles.positive : styles.negative}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technical Details */}
      {(data.file_hash || data.technical) && (
        <div className={styles.section}>
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className={styles.technicalToggle}
          >
            <FaFileAlt className={styles.sectionIcon} />
            <span>Technical Details</span>
            {showTechnical ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showTechnical && (
            <table className={styles.table}>
              <tbody>
                {data.file_hash && (
                  <tr>
                    <td className={styles.labelCell}>
                      <FaHashtag className={styles.cellIcon} />
                      File Hash
                    </td>
                    <td className={`${styles.valueCell} ${styles.hashValue}`}>
                      {data.file_hash}
                    </td>
                  </tr>
                )}
                {data.technical?.creation_date_raw && (
                  <tr>
                    <td className={styles.labelCell}>
                      <FaCalendarAlt className={styles.cellIcon} />
                      Creation Date
                    </td>
                    <td className={styles.valueCell}>
                      {formatDate(data.technical.creation_date_raw)}
                    </td>
                  </tr>
                )}
                {data.technical?.mod_date_raw && (
                  <tr>
                    <td className={styles.labelCell}>
                      <FaCalendarAlt className={styles.cellIcon} />
                      Modification Date
                    </td>
                    <td className={styles.valueCell}>
                      {formatDate(data.technical.mod_date_raw)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Export Full Data */}
      <div className={styles.exportSection}>
        <ExportButton data={data} filename="fraud-analysis-report" />
      </div>
    </div>
  );
}

