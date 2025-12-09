'use client';

import { useMemo } from 'react';
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
  FaChartLine,
  FaPercentage,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaIdCard,
  FaCreditCard,
  FaBuilding,
  FaGlobe
} from 'react-icons/fa';
import styles from './DataTable.module.css';

interface DataTableProps {
  data: any;
}

export default function DataTable({ data }: DataTableProps) {
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

      // Nested object - try to extract arrays or create nested view
      const nestedEntries = entries.filter(([_, value]) => Array.isArray(value));
      if (nestedEntries.length > 0) {
        // Use the first array found
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

  const getValueType = (key: string, value: any): string => {
    const keyLower = key.toLowerCase();
    
    // Detect common field types
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
      
      // Check if it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
        return (
          <span className={styles.dateValue}>
            <FaCalendarAlt className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // Check if it looks like a timestamp
      if (/^\d{10,13}$/.test(value)) {
        const date = new Date(parseInt(value));
        return (
          <span className={styles.dateValue}>
            <FaClock className={styles.valueIcon} />
            {date.toLocaleString()}
          </span>
        );
      }
      
      // Email
      if (valueType === 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return (
          <span className={styles.emailValue}>
            <FaEnvelope className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // Phone
      if (valueType === 'phone' || /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10) {
        return (
          <span className={styles.phoneValue}>
            <FaPhone className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // URL
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
      
      // ID/UUID
      if (valueType === 'id' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return (
          <span className={styles.idValue}>
            <FaIdCard className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // Card number
      if (valueType === 'card' || /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value.replace(/\s/g, ''))) {
        return (
          <span className={styles.cardValue}>
            <FaCreditCard className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // Location
      if (valueType === 'location') {
        return (
          <span className={styles.locationValue}>
            <FaMapMarkerAlt className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // Company
      if (valueType === 'company') {
        return (
          <span className={styles.companyValue}>
            <FaBuilding className={styles.valueIcon} />
            {value}
          </span>
        );
      }
      
      // Status
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
      
      // Name/User
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

  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No data available to display in table format</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {tableData.headers.map((header, index) => (
              <th key={index} className={styles.header}>
                <FaShieldAlt className={styles.headerIcon} />
                {header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row) => (
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
  );
}

