import { useState, useRef, useEffect } from 'react';

/**
 * LocationAutocomplete
 * Uses OpenStreetMap Nominatim API (free, no key required).
 *
 * Props:
 *   value       – controlled string value
 *   onChange    – called with selected place string
 *   placeholder – input placeholder text
 *   icon        – emoji/icon to display inside input
 *   label       – input label text
 */
const LocationAutocomplete = ({ value, onChange, placeholder, icon = '📍', label }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data.map(item => ({
          id: item.place_id,
          label: item.display_name.split(',').slice(0, 3).join(', '),
        })));
        setOpen(true);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.label);
    onChange(suggestion.label);
    setSelected(true);
    setOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelected(false);
    onChange(''); // clear valid selection until user picks from dropdown
    search(q);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
          {loading ? '⏳' : icon}
        </span>
        <input
          type="text"
          className="input-field pl-12 pr-10"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {selected && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-1 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-strong)',
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              className="px-4 py-3 text-sm cursor-pointer flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="text-base flex-shrink-0">📍</span>
              <span className="truncate">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
