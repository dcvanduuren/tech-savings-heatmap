"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

type MapboxFeature = {
  place_name: string;
  center: [number, number];
  text: string;
  context?: Array<{ id: string; text: string }>;
};

function formatCityCountry(f: MapboxFeature): string {
  const country = f.context?.find((c) => c.id.startsWith('country'))?.text;
  const city = f.text;
  if (country) return `[${city}, ${country}]`;
  return `[${f.place_name}]`;
}

const GEOCODE_DEBOUNCE_MS = 300;

export default function Home() {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<MapboxFeature | null>(null);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim() || selectedPlace) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    const t = setTimeout(() => {
      setIsSearching(true);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&types=place,locality&limit=6`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions((data.features ?? []) as MapboxFeature[]);
          setIsDropdownOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsSearching(false));
    }, GEOCODE_DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [searchQuery, selectedPlace]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = useCallback((place: MapboxFeature) => {
    setSelectedPlace(place);
    setSearchQuery(formatCityCountry(place));
    setIsDropdownOpen(false);
    setSuggestions([]);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchQuery(v);
    if (selectedPlace) setSelectedPlace(null);
  }, [selectedPlace]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPlace) return;
      setIsMapVisible(true);
    },
    [selectedPlace]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault();
  }, []);

  return (
    <>
      {/* Compact glass header - 90% see-through, map shows through */}
      <header className="fixed top-0 left-0 right-0 z-10 flex w-full items-center justify-between border-b border-white/20 bg-white/10 p-3 shadow-sm backdrop-blur-md">
        <div className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-slate-700"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-slate-900">TechSavings Europe</h1>
          <p className="text-sm text-slate-500">Phase 1: Discovery Heatmap</p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-white/30 transition-colors"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </header>

      {/* Welcome screen - full-screen white, centered */}
      <div
        className={`fixed inset-0 z-30 flex flex-col bg-white pt-12 transition-opacity duration-500 ${isMapVisible ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        aria-hidden={isMapVisible}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Find your tech arbitrage
            </h1>
            <div className="group relative">
              <div className="flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-600">
                ?
              </div>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2 rounded-xl border border-white/20 bg-white/80 p-4 text-sm leading-relaxed text-slate-600 opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 z-50">
                Stop overpaying for your baseline. Compare tech salaries, rent, and living costs to discover where your income goes furthest in Europe.
                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/20 bg-white/80" />
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="relative flex-1" ref={dropdownRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
                placeholder="Search any city in Europe..."
                className="font-mono min-h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 pr-10 text-slate-800 shadow-sm backdrop-blur-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                aria-label="Search city"
                aria-autocomplete="list"
                aria-expanded={isDropdownOpen}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                  …
                </div>
              )}
              {isDropdownOpen && suggestions.length > 0 && (
                <ul
                  className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200/80 bg-white/95 py-1 shadow-lg backdrop-blur-md"
                  role="listbox"
                >
                  {suggestions.map((place) => (
                    <li key={place.place_name + place.center.join(',')}>
                      <button
                        type="button"
                        className="font-mono w-full px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                        onClick={() => handleSelectPlace(place)}
                        role="option"
                      >
                        {place.place_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={!selectedPlace}
              className={`font-mono min-h-12 rounded-xl px-6 py-3 font-medium shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedPlace
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 cursor-pointer'
                  : 'cursor-not-allowed bg-slate-300 text-slate-500 focus:ring-slate-400'
                }`}
            >
              Locate
            </button>
          </form>
        </div>
      </div>

      {/* Map - full screen behind header, fades in after welcome */}
      <div
        className={`fixed inset-0 z-0 transition-opacity duration-500 ${isMapVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      >
        <div className="h-full w-full">
          <MapView
            entryCityQuery={!selectedPlace && isMapVisible ? searchQuery : undefined}
            initialCenter={selectedPlace ? { lng: selectedPlace.center[0], lat: selectedPlace.center[1] } : undefined}
          />
        </div>
      </div>
    </>
  );
}
