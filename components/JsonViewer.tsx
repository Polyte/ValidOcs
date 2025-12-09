'use client';

import { useMemo } from 'react';
import styles from './JsonViewer.module.css';

interface JsonViewerProps {
  data: any;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const formattedJson = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  const highlightJson = (json: string): JSX.Element[] => {
    const parts: JSX.Element[] = [];
    const lines = json.split('\n');
    let key = 0;

    lines.forEach((line, lineIdx) => {
      const lineParts: JSX.Element[] = [];
      let i = 0;

      while (i < line.length) {
        // Match keys: "key":
        if (line[i] === '"') {
          const keyEnd = line.indexOf('":', i);
          if (keyEnd !== -1) {
            lineParts.push(
              <span key={`key-${key++}`} className={styles.jsonKey}>
                {line.substring(i, keyEnd + 2)}
              </span>
            );
            i = keyEnd + 2;
            continue;
          }
        }

        // Match string values: : "value"
        if (line.substring(i).match(/^:\s*"/)) {
          const colonSpace = line.indexOf('"', i);
          if (colonSpace !== -1) {
            const valueStart = colonSpace;
            let valueEnd = valueStart + 1;
            while (valueEnd < line.length && (line[valueEnd] !== '"' || line[valueEnd - 1] === '\\')) {
              valueEnd++;
            }
            if (valueEnd < line.length) valueEnd++;
            
            lineParts.push(
              <span key={`str-${key++}`} className={styles.jsonString}>
                {line.substring(valueStart, valueEnd)}
              </span>
            );
            i = valueEnd;
            continue;
          }
        }

        // Match numbers: : 123 or : 123.45
        const numberMatch = line.substring(i).match(/^:\s*(\d+\.?\d*)/);
        if (numberMatch) {
          const numStart = i + line.substring(i).indexOf(numberMatch[1]);
          const numEnd = numStart + numberMatch[1].length;
          lineParts.push(
            <span key={`num-${key++}`} className={styles.jsonNumber}>
              {line.substring(i, numStart)}
            </span>
          );
          lineParts.push(
            <span key={`num-val-${key++}`} className={styles.jsonNumber}>
              {line.substring(numStart, numEnd)}
            </span>
          );
          i = numEnd;
          continue;
        }

        // Match booleans and null
        const boolMatch = line.substring(i).match(/^:\s*(true|false|null)/);
        if (boolMatch) {
          const boolStart = i + line.substring(i).indexOf(boolMatch[1]);
          const boolEnd = boolStart + boolMatch[1].length;
          lineParts.push(
            <span key={`bool-${key++}`}>
              {line.substring(i, boolStart)}
            </span>
          );
          lineParts.push(
            <span key={`bool-val-${key++}`} className={styles.jsonBoolean}>
              {line.substring(boolStart, boolEnd)}
            </span>
          );
          i = boolEnd;
          continue;
        }

        // Match brackets
        if (['{', '}', '[', ']', ','].includes(line[i])) {
          lineParts.push(
            <span key={`bracket-${key++}`} className={styles.jsonBracket}>
              {line[i]}
            </span>
          );
          i++;
          continue;
        }

        // Regular text
        lineParts.push(<span key={`text-${key++}`}>{line[i]}</span>);
        i++;
      }

      parts.push(...lineParts);
      if (lineIdx < lines.length - 1) {
        parts.push(<span key={`nl-${key++}`}>{'\n'}</span>);
      }
    });

    return parts.length > 0 ? parts : [<span key={0}>{json}</span>];
  };

  return (
    <div className={styles.jsonContainer}>
      <pre className={styles.jsonPre}>
        <code className={styles.jsonCode}>
          {highlightJson(formattedJson)}
        </code>
      </pre>
    </div>
  );
}
