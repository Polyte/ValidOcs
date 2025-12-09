'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import styles from './HealthIndicator.module.css';

interface HealthIndicatorProps {
  isHealthy: boolean | null;
  isLoading: boolean;
}

export default function HealthIndicator({ isHealthy, isLoading }: HealthIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isHealthy !== null && !isLoading) {
      const interval = setInterval(() => {
        setIsVisible((prev) => !prev);
      }, 1000); // Flash every second

      return () => clearInterval(interval);
    }
  }, [isHealthy, isLoading]);

  if (isLoading) {
    return (
      <div className={styles.healthIndicator}>
        <FaSpinner className={`${styles.icon} ${styles.spinning}`} />
        <span className={styles.label}>Checking...</span>
      </div>
    );
  }

  if (isHealthy === null) {
    return (
      <div className={styles.healthIndicator}>
        <div className={`${styles.statusDot} ${styles.unknown}`} />
        <span className={styles.label}>Unknown</span>
      </div>
    );
  }

  return (
    <div className={styles.healthIndicator}>
      {isHealthy ? (
        <>
          <FaCheckCircle
            className={`${styles.icon} ${styles.healthy} ${isVisible ? styles.visible : styles.hidden}`}
          />
          <span className={`${styles.label} ${styles.healthyText}`}>Healthy</span>
        </>
      ) : (
        <>
          <FaTimesCircle
            className={`${styles.icon} ${styles.unhealthy} ${isVisible ? styles.visible : styles.hidden}`}
          />
          <span className={`${styles.label} ${styles.unhealthyText}`}>Unhealthy</span>
        </>
      )}
    </div>
  );
}

