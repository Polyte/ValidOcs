'use client';

import { useState, useMemo } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaDollarSign,
  FaCalendarAlt,
  FaClock,
  FaHashtag,
  FaFileAlt,
  FaList,
  FaDatabase,
  FaTag,
  FaInfoCircle,
  FaShieldAlt,
  FaPercentage,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaIdCard,
  FaCreditCard,
  FaBuilding,
  FaGlobe,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import ExportButton from './ExportButton';
import SearchBar from './SearchBar';
import styles from './EnhancedDataTable.module.css';

interface EnhancedDataTableProps {
  data: any;
  itemsPerPage?: number;
}

type SortDirection = 'asc' | 'desc' | null;
type SortConfig = { key: string; direction: SortDirection };

export default function EnhancedDataTable({ data, itemsPerPage = 10 }: EnhancedDataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const tableData = useMemo(() => {
    if (!data) return null;

    // If data is an array
    if (Array.isArray(data)) {
      if (data.length === 0) return null;
      
      // If array of objects, use first object's keys as headers
      if (typeof data[0] === 'object' && data[0] !== null) {
        const headers = Object.keys(data[0]);
        return {
          headers,
          rows: data.map((item, index) => ({
            id: index,
            cells: headers.map(header => ({
              key: header,
              value: item[header],
            })),
          })),
        };
      }
      
      // If array of primitives
      return {
        headers: ['Index', 'Value'],
        rows: data.map((item, index) => ({
          id: index,
          cells: [
            { key: 'index', value: index },
            { key: 'value', value: item },
          ],
        })),
      };
    }

    // If data is an object
    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      
      // Check if it's a flat object (simple key-value pairs)
      const isFlat = entries.every(([_, value]) => 
        typeof value !== 'object' || value === null || Array.isArray(value)
      );

      if (isFlat) {
        return {
          headers: ['Property', 'Value'],
          rows: entries.map(([key, value], index) => ({
            id: index,
            cells: [
              { key: 'property', value: key },
              { key: 'value', value },
            ],
          })),
        };
      }

      // Nested object - try to extract arrays
      const nestedEntries = entries.filter(([_, value]) => Array.isArray(value));
      if (nestedEntries.length > 0) {
        const [arrayKey, arrayValue] = nestedEntries[0];
        if (Array.isArray(arrayValue) && arrayValue.length > 0) {
          if (typeof arrayValue[0] === 'object' && arrayValue[0] !== null) {
            const headers = Object.keys(arrayValue[0]);
            return {
              headers: [arrayKey, ...headers],
              rows: arrayValue.map((item, index) => ({
                id: index,
                cells: [
                  { key: 'type', value: arrayKey },
                  ...headers.map(header => ({
                    key: header,
                    value: item[header],
                  })),
                ],
              })),
            };
          }
        }
      }
    }

    // Fallback: single value
    return {
      headers: ['Result'],
      rows: [{
        id: 0,
        cells: [{ key: 'result', value: String(data) }],
      }],
    };
  }, [data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!tableData) return null;

    let filteredRows = [...tableData.rows];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredRows = filteredRows.filter(row =>
        row.cells.some(cell => {
          const value = String(cell.value || '').toLowerCase();
          return value.includes(query);
        })
      );
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      filteredRows.sort((a, b) => {
        const aCell = a.cells.find(c => c.key === sortConfig.key);
        const bCell = b.cells.find(c => c.key === sortConfig.key);
        
        if (!aCell || !bCell) return 0;

        const aValue = aCell.value;
        const bValue = bCell.value;

        // Handle different value types
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return {
      ...tableData,
      rows: filteredRows,
    };
  }, [tableData, searchQuery, sortConfig]);

  // Pagination
  const totalPages = processedData
    ? Math.ceil(processedData.rows.length / itemsPerPage)
    : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = processedData
    ? processedData.rows.slice(startIndex, endIndex)
    : [];

  // Reset to first page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: '', direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (header: string) => {
    if (sortConfig.key !== header) {
      return <FaSort className={styles.sortIcon} />;
    }
    return sortConfig.direction === 'asc' ? (
      <FaSortUp className={styles.sortIcon} />
    ) : (
      <FaSortDown className={styles.sortIcon} />
    );
  };

  // Format value function (same as before, but imported from original)
  const formatValue = (cell: { key: string; value: any }): JSX.Element => {
    const { key, value } = cell;
    
    if (value === null || value === undefined) {
      return (
        <span className={styles.nullValue}>
          <FaExclamationTriangle className={styles.valueIcon} />
          null
        </span>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <span className={value ? styles.trueValue : styles.falseValue}>
          {value ? (
            <>
              <FaCheckCircle className={styles.valueIcon} /> 
              <span className={styles.boolText}>true</span>
            </>
          ) : (
            <>
              <FaTimesCircle className={styles.valueIcon} /> 
              <span className={styles.boolText}>false</span>
            </>
          )}
        </span>
      );
    }

    if (typeof value === 'number') {
      const valueType = getValueType(key, value);
      
      if (valueType === 'currency') {
        return (
          <span className={styles.currencyValue}>
            <FaDollarSign className={styles.valueIcon} />
            {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </span>
        );
      }
      
      if (valueType === 'percentage') {
        return (
          <span className={styles.percentageValue}>
            <FaPercentage className={styles.valueIcon} />
            {value}%
          </span>
        );
      }
      
      return (
        <span className={styles.numberValue}>
          <FaHashtag className={styles.valueIcon} />
          {value.toLocaleString()}
        </span>
      );
    }

    if (typeof value === 'string') {
      const valueType = getValueType(key, value);
      
      if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
        return (
          <span className={styles.dateValue}>
            <FaCalendarAlt className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (/^\d{10,13}$/.test(value)) {
        const date = new Date(parseInt(value));
        return (
          <span className={styles.dateValue}>
            <FaClock className={styles.valueIcon} />
            {date.toLocaleString()}
          </span>
        );
      }
      
      if (valueType === 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return (
          <span className={styles.emailValue}>
            <FaEnvelope className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'phone' || (/^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10)) {
        return (
          <span className={styles.phoneValue}>
            <FaPhone className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'url' || /^https?:\/\//.test(value)) {
        return (
          <span className={styles.urlValue}>
            <FaGlobe className={styles.valueIcon} />
            <a href={value} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
              {value}
            </a>
          </span>
        );
      }
      
      if (valueType === 'id' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return (
          <span className={styles.idValue}>
            <FaIdCard className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'card' || /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value.replace(/\s/g, ''))) {
        return (
          <span className={styles.cardValue}>
            <FaCreditCard className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'location') {
        return (
          <span className={styles.locationValue}>
            <FaMapMarkerAlt className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'company') {
        return (
          <span className={styles.companyValue}>
            <FaBuilding className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'status') {
        const statusLower = value.toLowerCase();
        const isPositive = ['active', 'success', 'approved', 'completed', 'verified', 'valid'].includes(statusLower);
        const isNegative = ['inactive', 'failed', 'rejected', 'cancelled', 'pending', 'invalid'].includes(statusLower);
        
        return (
          <span className={`${styles.statusValue} ${isPositive ? styles.statusPositive : isNegative ? styles.statusNegative : ''}`}>
            <FaTag className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      if (valueType === 'name') {
        return (
          <span className={styles.nameValue}>
            <FaUser className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      return (
        <span className={styles.stringValue}>
          <FaInfoCircle className={styles.valueIcon} />
          {value}
        </span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <span className={styles.arrayValue}>
          <FaList className={styles.valueIcon} />
          Array ({value.length} items)
        </span>
      );
    }

    if (typeof value === 'object') {
      return (
        <span className={styles.objectValue}>
          <FaDatabase className={styles.valueIcon} />
          Object ({Object.keys(value).length} keys)
        </span>
      );
    }

    return (
      <span className={styles.defaultValue}>
        <FaFileAlt className={styles.valueIcon} />
        {String(value)}
      </span>
    );
  };

  const getValueType = (key: string, value: any): string => {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('amount') || keyLower.includes('price') || keyLower.includes('cost') || 
        keyLower.includes('balance') || keyLower.includes('total') || keyLower.includes('fee') ||
        keyLower.includes('value') || keyLower.includes('sum')) {
      return 'currency';
    }
    if (keyLower.includes('date') || keyLower.includes('time') || keyLower.includes('created') ||
        keyLower.includes('updated') || keyLower.includes('timestamp')) {
      return 'date';
    }
    if (keyLower.includes('email') || keyLower.includes('mail')) {
      return 'email';
    }
    if (keyLower.includes('phone') || keyLower.includes('mobile') || keyLower.includes('tel')) {
      return 'phone';
    }
    if (keyLower.includes('address') || keyLower.includes('location') || keyLower.includes('city') ||
        keyLower.includes('country') || keyLower.includes('state')) {
      return 'location';
    }
    if (keyLower.includes('id') || keyLower.includes('uuid') || keyLower.includes('reference')) {
      return 'id';
    }
    if (keyLower.includes('name') || keyLower.includes('user') || keyLower.includes('customer')) {
      return 'name';
    }
    if (keyLower.includes('card') || keyLower.includes('account') || keyLower.includes('number')) {
      return 'card';
    }
    if (keyLower.includes('status') || keyLower.includes('state') || keyLower.includes('type')) {
      return 'status';
    }
    if (keyLower.includes('percentage') || keyLower.includes('rate') || keyLower.includes('percent')) {
      return 'percentage';
    }
    if (keyLower.includes('url') || keyLower.includes('link') || keyLower.includes('website')) {
      return 'url';
    }
    if (keyLower.includes('company') || keyLower.includes('organization') || keyLower.includes('business')) {
      return 'company';
    }
    
    return 'default';
  };

  if (!processedData || !processedData.rows || processedData.rows.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No data available to display</p>
        {searchQuery && (
          <p className={styles.emptyHint}>Try adjusting your search query</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Search data..."
          />
          {searchQuery && (
            <span className={styles.resultCount}>
              {processedData.rows.length} result{processedData.rows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <ExportButton data={processedData} />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {processedData.headers.map((header, index) => (
                <th 
                  key={index} 
                  className={styles.header}
                  onClick={() => handleSort(header)}
                >
                  <div className={styles.headerContent}>
                    <FaShieldAlt className={styles.headerIcon} />
                    <span>{header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' ')}</span>
                    {getSortIcon(header)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => (
              <tr key={row.id} className={styles.row}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styles.cell}>
                    {formatValue(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            <FaChevronLeft />
            Previous
          </button>
          
          <div className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
            <span className={styles.pageDetails}>
              ({startIndex + 1}-{Math.min(endIndex, processedData.rows.length)} of {processedData.rows.length})
            </span>
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

