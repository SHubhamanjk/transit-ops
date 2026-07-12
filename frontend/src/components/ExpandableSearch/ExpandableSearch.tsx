import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './ExpandableSearch.css';

interface ExpandableSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ value, onChange, placeholder = 'Search...' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleToggle = () => {
    if (isExpanded && !value) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsExpanded(false);
  };

  return (
    <div className={`expandable-search ${isExpanded ? 'expanded' : ''} ${value ? 'has-value' : ''}`}>
      <button 
        className="search-icon-btn" 
        onClick={handleToggle}
        title="Search"
        type="button"
      >
        <Search size={20} />
      </button>
      
      <input 
        ref={inputRef}
        type="text" 
        className="search-input-field" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (!value) setIsExpanded(false);
        }}
      />
      
      {(isExpanded || value) && (
        <button className="clear-btn" onClick={handleClear} onMouseDown={(e) => e.preventDefault()} type="button">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ExpandableSearch;
