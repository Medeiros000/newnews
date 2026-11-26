import { useState, useEffect, useRef } from 'react';
import { IconX, IconTag, IconSearch } from '@tabler/icons-react';
import { tagService } from '@/services';

/**
 * Componente de entrada de tags com suporte a autocomplete,
 * adição por Enter/vírgula e remoção individual.
 *
 * @param {Object} props
 * @param {string[]} props.value - Array de nomes de tags
 * @param {Function} props.onChange - Callback executado com o novo array de tags
 * @param {string} [props.placeholder='Adicione tags...'] - Placeholder do input
 */
export function TagInput({ value = [], onChange, placeholder = 'Adicione tags...' }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        const res = await tagService.getTags({ q: trimmed, limit: 6 });
        if (isCurrent && res.success) {
          const list = res.data || [];
          setSuggestions(
            list.filter((tag) => !value.includes(tag.name)),
          );
        }
      } catch {
        if (isCurrent) setSuggestions([]);
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [inputValue, value]);

  // Fecha autocomplete ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName) => {
    const clean = tagName.trim().replace(/^#/, '');
    if (!clean) return;
    if (!value.includes(clean)) {
      onChange?.([...value, clean]);
    }
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const removeTag = (indexToRemove) => {
    onChange?.(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="position-relative" ref={containerRef}>
      <div className="d-flex flex-wrap align-items-center gap-1 p-2 border rounded-3 bg-body focus-ring">
        <IconTag size={18} className="text-muted ms-1" />

        {value.map((tag, idx) => (
          <span
            key={idx}
            className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill py-1 px-2 d-inline-flex align-items-center gap-1"
          >
            #{tag}
            <button
              type="button"
              className="btn btn-link p-0 text-reset d-inline-flex align-items-center"
              onClick={() => removeTag(idx)}
              aria-label={`Remover tag ${tag}`}
            >
              <IconX size={14} />
            </button>
          </span>
        ))}

        <input
          type="text"
          className="form-control form-control-sm border-0 shadow-none flex-grow-1 p-1"
          style={{ minWidth: '120px' }}
          placeholder={value.length === 0 ? placeholder : ''}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="dropdown-menu show w-100 mt-1 shadow-sm position-absolute z-3">
          {suggestions.map((sug) => (
            <li key={sug.id || sug.slug}>
              <button
                type="button"
                className="dropdown-item d-flex justify-content-between align-items-center py-2"
                onClick={() => addTag(sug.name)}
              >
                <span>#{sug.name}</span>
                {typeof sug.newsCount === 'number' && (
                  <small className="text-muted">{sug.newsCount} notícias</small>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
