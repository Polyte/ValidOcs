'use client';

import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={styles.searchContainer}>
      <FaSearch className={styles.searchIcon} />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {query && (
        <button
          onClick={handleClear}
          className={styles.clearButton}
          title="Clear search"
        >
          <FaTimes className={styles.clearIcon} />
        </button>
      )}
    </div>
  );
}

