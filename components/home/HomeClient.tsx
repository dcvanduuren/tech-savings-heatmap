"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { CityData } from '../../types/city';
import { useAuth } from '../../hooks/useAuth';
import { AboutOverlay } from './AboutOverlay';
import { DataMethodologyOverlay } from './DataMethodologyOverlay';

const MapView = dynamic(() => import('../../app/MapView'), { ssr: false });

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

export function HomeClient({ initialCities }: { initialCities: CityData[] }) {
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<MapboxFeature | null>(null);
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { user, signInWithEmail, signUpWithEmail } = useAuth();
    const [isAuthExpanded, setIsAuthExpanded] = useState(false);
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

    // Auto-bypass welcome screen if logged in
    useEffect(() => {
        if (user && !isMapVisible) {
            // Check if they have a saved baseline city in their metadata
            const savedCity = user.user_metadata?.baseline_city;
            if (savedCity) {
                setSearchQuery(savedCity);
            }
            // Add a slight delay for a smooth cinematic transition
            setTimeout(() => setIsMapVisible(true), 400);
        }
    }, [user, isMapVisible]);

    const handleAuth = async (isSignUp: boolean) => {
        setAuthError('');
        setIsSubmittingAuth(true);
        let result;
        if (isSignUp) {
            result = await signUpWithEmail(authEmail, authPassword);
        } else {
            result = await signInWithEmail(authEmail, authPassword);
        }

        if (result.error) {
            setAuthError(result.error.message);
        } else if (isSignUp) {
            setAuthError('Check your email for the confirmation link.');
        }
        setIsSubmittingAuth(false);
    };

    useEffect(() => {
        setIsMounted(true);
        // Allow a slight delay after mount to let the browser paint the solid backdrop, then trigger animations
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const topCity = useMemo(() => {
        if (!initialCities || initialCities.length === 0) return null;
        return initialCities.reduce((best, current) => {
            const bestSavings = best.savings?.['average_average'] || 0;
            const currentSavings = current.savings?.['average_average'] || 0;
            return currentSavings > bestSavings ? current : best;
        }, initialCities[0]);
    }, [initialCities]);

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

    const handleOpenAbout = useCallback(() => setIsAboutOpen(true), []);

    const memoizedInitialCenter = useMemo(() => {
        return isMapVisible && selectedPlace ? { lng: selectedPlace.center[0], lat: selectedPlace.center[1] } : undefined;
    }, [isMapVisible, selectedPlace]);

    return (
        <>
            {/* Floating App Title */}
            <h1 className="fixed top-8 left-1/2 -translate-x-1/2 z-40 text-4xl font-extrabold tracking-tighter text-slate-800 drop-shadow-md pointer-events-none">
                kept.
            </h1>

            {/* Welcome screen - full-screen transparent light with subtle blur, centered */}
            <div
                className={`fixed inset-0 z-30 flex flex-col bg-white/[0.15] pt-12 transition-all duration-[2000ms] ease-in-out ${isMapVisible ? 'pointer-events-none opacity-0' : 'opacity-100'} ${isReady ? 'backdrop-blur-[6px]' : 'backdrop-blur-[100px]'}`}
                aria-hidden={isMapVisible}
            >
                <div className="flex flex-1 flex-col items-center justify-center px-6">
                    <div className={`flex items-center gap-4 mb-10 transition-all duration-1000 ease-out delay-100 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 md:text-5xl drop-shadow-lg max-w-2xl px-4">
                            Your skills are global. Your choices should be too.
                        </h1>
                        <div className="group relative">
                            <div className="flex h-6 w-6 cursor-help items-center justify-center rounded-none border border-slate-400 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-800 hover:text-slate-800 pb-px">
                                ?
                            </div>
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-4 w-72 -translate-x-1/2 rounded-none border border-white/60 bg-white/[0.85] p-5 text-xs font-medium leading-relaxed text-slate-700 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:opacity-100 group-hover:mb-3 z-50">
                                <div className="space-y-4">
                                    <p>A crowdsourced ledger for tech workers to visualize geographic arbitrage, understand local taxes, and take control of their life design.</p>

                                    {topCity && (
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded p-4 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1">Top Arbitrage Hub</p>
                                            <p className="font-mono text-xl font-bold text-slate-900 border-b border-orange-500/20 pb-2 mb-3">{topCity.name}</p>
                                            <div className="flex justify-between items-center text-[11px]">
                                                <span className="text-slate-600 font-bold uppercase tracking-widest font-sans">Avg. Kept:</span>
                                                <span className="font-mono font-bold text-orange-500 text-sm">
                                                    {isMounted ? `+€${topCity.savings['average_average'].toLocaleString()}/mo` : '+€.../mo'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/60 bg-white/[0.85]" />
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className={`flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-stretch transition-all duration-1000 ease-out delay-300 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="relative flex-1" ref={dropdownRef}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
                                placeholder="Enter your current home city..."
                                className="min-h-12 w-full rounded-none border border-white/60 bg-white/50 px-4 py-3 pr-10 text-[10px] font-bold uppercase tracking-widest text-slate-800 shadow-xl backdrop-blur-[6px] placeholder:text-slate-500 focus:border-slate-400/50 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:bg-white/70 transition-all"
                                aria-label="Search city"
                                aria-autocomplete="list"
                                aria-expanded={isDropdownOpen}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-slate-500">
                                    …
                                </div>
                            )}
                            {isDropdownOpen && suggestions.length > 0 && (
                                <ul
                                    className="absolute left-0 right-0 top-full z-20 mt-2 max-h-60 overflow-auto rounded-none border border-white/60 bg-white/70 py-1 shadow-2xl backdrop-blur-[12px] custom-scrollbar"
                                    role="listbox"
                                >
                                    {suggestions.map((place) => (
                                        <li key={place.place_name + place.center.join(',')}>
                                            <button
                                                type="button"
                                                className="w-full px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-800 hover:bg-slate-200/50 focus:bg-slate-200/50 focus:outline-none transition-colors"
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
                            className={`min-h-12 rounded-none px-8 py-3 text-[10px] font-bold uppercase tracking-widest shadow-xl backdrop-blur-[6px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${selectedPlace
                                ? 'bg-orange-500/90 text-white hover:bg-orange-500 hover:shadow-orange-500/25 focus:ring-orange-500 cursor-pointer border border-orange-400/50'
                                : 'cursor-not-allowed bg-slate-300 text-slate-500/80 border border-white/40'
                                }`}
                        >
                            Locate
                        </button>
                    </form>

                    {/* Authentication Module below search */}
                    <div className={`mt-6 w-full max-w-2xl transition-all duration-1000 ease-out delay-500 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {!user && (
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => setIsAuthExpanded(!isAuthExpanded)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    {isAuthExpanded ? "Hide Login" : "Already have an account? Sign in"}
                                </button>

                                <div className={`w-full max-w-sm overflow-hidden transition-all duration-500 ease-in-out ${isAuthExpanded ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col gap-3 bg-white/30 backdrop-blur-md p-4 border border-white/40 shadow-xl rounded-none">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={authEmail}
                                            onChange={(e) => setAuthEmail(e.target.value)}
                                            className="w-full bg-white/40 border border-white/50 rounded-none px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-slate-400 transition-all placeholder:text-slate-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={authPassword}
                                            onChange={(e) => setAuthPassword(e.target.value)}
                                            className="w-full bg-white/40 border border-white/50 rounded-none px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-slate-400 transition-all placeholder:text-slate-500"
                                        />
                                        {authError && (
                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide text-center">{authError}</p>
                                        )}
                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={() => handleAuth(false)}
                                                disabled={isSubmittingAuth}
                                                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 shadow-sm px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                            >
                                                Sign In
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map - full screen behind header */}
            <div
                className={`fixed inset-0 z-0 ${isMapVisible ? '' : 'pointer-events-none'}`}
            >
                <div className="h-full w-full">
                    <MapView
                        initialCities={initialCities}
                        entryCityQuery={!selectedPlace && isMapVisible ? searchQuery : undefined}
                        initialCenter={memoizedInitialCenter}
                        onOpenAbout={handleOpenAbout}
                    />
                </div>
            </div>

            {/* About Overlay - State preserved across interactions */}
            <AboutOverlay
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
                onOpenMethodology={() => {
                    setIsAboutOpen(false);
                    setIsMethodologyOpen(true);
                }}
            />

            {/* Methodology Overlay */}
            <DataMethodologyOverlay
                isOpen={isMethodologyOpen}
                onClose={() => setIsMethodologyOpen(false)}
            />
        </>
    );
}
