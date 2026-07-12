import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import './SearchableSelect.css';

export interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <div 
        className={`select-header ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-value">
          {selectedOption ? (
            <div className="selected-content">
              <span className="selected-label">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="placeholder">{placeholder || 'Select...'}</span>
          )}
        </div>
        <ChevronDown size={16} className="chevron" />
      </div>

      {isOpen && (
        <div className="select-dropdown">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="options-list">
            {filteredOptions.length === 0 ? (
              <div className="no-options">No results found</div>
            ) : (
              filteredOptions.map(option => (
                <div 
                  key={option.value} 
                  className={`option-item ${option.value === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="option-label">{option.label}</div>
                  {option.sublabel && <div className="option-sublabel">{option.sublabel}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {name && <input type="hidden" name={name} value={value} required />}
    </div>
  );
};

export default SearchableSelect;
