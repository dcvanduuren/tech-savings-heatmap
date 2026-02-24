"use client";

import Map, { useMap } from '@vis.gl/react-mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchBox } from '@mapbox/search-js-react';

import { getDistance } from '../utils/geometry';
import { useArbitrage } from '../hooks/useArbitrage';
import { useMapScale } from '../hooks/useMapScale';
import { useAuth } from '../hooks/useAuth';

import { CityMarker } from '../components/map/CityMarker';
import { FilterBar } from '../components/ui/FilterBar';
import { NomadPanel } from '../components/nomad/NomadPanel';
import { ArbitrageModal } from '../components/nomad/ArbitrageModal';
import { AuthModule } from '../components/auth/AuthModule';
import { CityData } from '../types/city';

const DEFAULT_VIEW = { longitude: 15.0, latitude: 50.0, zoom: 3.5 };

type MapViewProps = {
  initialCities: CityData[];
  entryCityQuery?: string;
  initialCenter?: { lng: number; lat: number };
  onOpenAbout?: () => void;
};

function MapController({ targetCenter }: { targetCenter?: { lng: number; lat: number } }) {
  const { current: map } = useMap();
  useEffect(() => {
    if (map && targetCenter) {
      setTimeout(() => {
        map.flyTo({ center: [targetCenter.lng, targetCenter.lat], zoom: 4.5, duration: 2500, essential: true });
      }, 300);
    }
  }, [map, targetCenter]);
  return null;
}

export default function MapView({ initialCities, entryCityQuery, initialCenter: entryCenter, onOpenAbout }: MapViewProps) {
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  const [activeCenter, setActiveCenter] = useState(entryCenter);
  const [zoom, setZoom] = useState(DEFAULT_VIEW.zoom);

  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { user, isLoading } = useAuth();
  const isAuthLocked = !user && !isLoading;

  // --- GLOBAL ROLE STATE ---
  const [selectedRole, setSelectedRole] = useState('average');
  const [selectedLevel, setSelectedLevel] = useState('average');
  const roleKey = `${selectedRole}_${selectedLevel}`;

  // Enforce guest state lock
  useEffect(() => {
    if (isAuthLocked && (selectedRole !== 'average' || selectedLevel !== 'average')) {
      setSelectedRole('average');
      setSelectedLevel('average');
    }
  }, [isAuthLocked, selectedRole, selectedLevel]);

  useEffect(() => {
    if (entryCenter) {
      setActiveCenter(entryCenter);
    }
  }, [entryCenter]);

  // --- CUSTOM HOOKS: Core Logic Extraction ---
  const {
    isNomadMode,
    setIsNomadMode,
    arbitrageMode,
    setArbitrageMode,
    arbitrationCityId,
    setArbitrationCityId,
    adjustedCities
  } = useArbitrage(initialCities, roleKey);

  const {
    filters,
    updateFilter,
    clearFilters,
    minSavings,
    maxSavings,
    visibleCities
  } = useMapScale(adjustedCities, isNomadMode, arbitrageMode, roleKey);

  // --- BASELINE / ANCHOR CALCULATION ---
  const baselineCity = useMemo(() => {
    if (isNomadMode && arbitrationCityId) {
      const anchor = adjustedCities.find(c => c.name === arbitrationCityId);
      if (anchor) return anchor;
    }

    const center = activeCenter || { lng: DEFAULT_VIEW.longitude, lat: DEFAULT_VIEW.latitude };

    return adjustedCities.reduce((closest, current) => {
      const currentDist = getDistance(center.lat, center.lng, current.lat, current.lng);
      const closestDist = getDistance(center.lat, center.lng, closest.lat, closest.lng);
      return currentDist < closestDist ? current : closest;
    }, adjustedCities[0]);
  }, [activeCenter, adjustedCities, isNomadMode, arbitrationCityId]);

  // --- MAP INTERACTION LOGIC ---
  const dataPointOpacity = Math.max(0, Math.min(1, (zoom - 3.5) / 0.5));
  const glowScale = zoom >= 5 ? 1 : zoom <= 2 ? 5 : 1 + ((5 - zoom) / 3) * 4;
  const isInteractive = dataPointOpacity > 0.1;

  const handleMapMouseMove = useCallback((evt: any) => {
    if (!isInteractive || visibleCities.length === 0) {
      if (hoveredCity) setHoveredCity(null);
      return;
    }

    const maxDistKm = 300 * Math.pow(2, 3.5 - zoom);
    let closest: CityData | null = null;
    let minDist = Infinity;

    for (const city of visibleCities) {
      const d = getDistance(evt.lngLat.lat, evt.lngLat.lng, city.lat, city.lng);
      if (d < minDist) {
        minDist = d;
        closest = city;
      }
    }

    const nextHovered = minDist <= maxDistKm ? closest : null;
    if (hoveredCity?.name !== nextHovered?.name) {
      setHoveredCity(nextHovered);
    }
  }, [isInteractive, visibleCities, zoom, hoveredCity]);

  const handleMapClick = useCallback((evt: any) => {
    if (hoveredCity && isInteractive) {
      setSelectedCity(hoveredCity);
    } else {
      setSelectedCity(null);
    }
  }, [hoveredCity, isInteractive]);

  return (
    <div className={`h-full w-full min-h-[400px] relative transition-opacity duration-[2000ms] ease-in-out ${isMapLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Map
        initialViewState={DEFAULT_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapToken}
        onMove={(evt) => setZoom(evt.viewState.zoom)}
        onMouseMove={handleMapMouseMove}
        onClick={handleMapClick}
        onLoad={() => setIsMapLoaded(true)}
        interactiveLayerIds={[]}
        cursor={hoveredCity ? 'pointer' : 'grab'}
      >
        <MapController targetCenter={activeCenter} />

        {/* --- MAP MARKER RENDER LOOP --- */}
        {adjustedCities.map((city) => {
          const passesFilter = visibleCities.some(vc => vc.name === city.name);

          return (
            <CityMarker
              key={city.name}
              city={city}
              baselineCity={baselineCity}
              minSavings={minSavings}
              maxSavings={maxSavings}
              visibleCount={visibleCities.length}
              passesFilter={passesFilter}
              dataPointOpacity={dataPointOpacity}
              glowScale={glowScale}
              isInteractive={passesFilter && isInteractive}
              isHovered={hoveredCity?.name === city.name}
              isNomadMode={isNomadMode}
              arbitrationCityId={arbitrationCityId}
              roleKey={roleKey}
            />
          );
        })}
      </Map>

      {/* --- FLOATING TOGGLE BUTTON (Icon Only) --- */}
      <div className={`absolute top-8 right-8 z-40 transition-all duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-3 bg-white/[0.15] backdrop-blur-[6px] border border-white/60 shadow-[0_32px_64px_rgba(0,0,0,0.1)] rounded-none text-slate-800 hover:bg-white/30 transition-all cursor-pointer group"
          title="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* --- MASTER COMMAND CENTER --- */}
      <div className={`absolute top-8 right-8 bottom-8 w-72 z-30 flex flex-col gap-8 bg-white/[0.15] backdrop-blur-[6px] border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.12),0_60px_120px_rgba(0,0,0,0.24)] rounded-none pointer-events-auto overflow-y-auto custom-scrollbar p-8 transition-all duration-300 origin-right ${isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 pointer-events-none scale-95'}`}>

        {/* --- HEADER WITH CLOSE WORD --- */}
        <div className="flex justify-end mb-[-1rem] relative z-10">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Fold
          </button>
        </div>

        {/* --- CHANGE BASELINE SEARCH --- */}
        <div className="relative group flex-shrink-0">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Change Baseline Map City</label>
          <SearchBox
            accessToken={mapToken}
            placeholder="Search any city..."
            onRetrieve={(res) => {
              if (res.features && res.features[0]) {
                const [lng, lat] = res.features[0].geometry.coordinates;
                setActiveCenter({ lng, lat });
              }
            }}
            theme={{
              variables: {
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                unit: '12px',
                borderRadius: '8px',
                colorBackground: 'rgba(255, 255, 255, 0.4)',
                colorText: '#1e293b',
              },
              cssText: `
                .mapboxgl-ctrl-geocoder { 
                  min-width: 100%;
                  box-shadow: none;
                  border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .mapbox-search-list {
                  z-index: 1000 !important;
                  background: rgba(255, 255, 255, 0.4) !important;
                  backdrop-filter: blur(6px);
                  box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
                  border-radius: 8px !important;
                  margin-top: 4px;
                  border: 1px solid rgba(255, 255, 255, 0.5);
                }
              `
            }}
          />
        </div>

        {/* --- AUTH GATE MODULE --- */}
        <AuthModule />

        {/* --- ADVANCED FEATURES (GATED) --- */}
        <div className={`relative space-y-8 transition-all duration-500 ${isAuthLocked ? 'opacity-40 pointer-events-none grayscale' : ''}`}>

          {/* Lock Overlay */}
          {isAuthLocked && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 p-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-800 drop-shadow-md">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* --- ROLE PROFILE --- */}
          <div className="flex-shrink-0 space-y-4">
            <div className="pt-2 border-t border-white/20">
              <h3 className="font-sans font-bold text-slate-800 text-sm mb-3">Role Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="average">Average Tech Role</option>
                    <option value="software_engineer">Software Engineer</option>
                    <option value="data_professional">Data Professional</option>
                    <option value="product_manager">Product Manager</option>
                    <option value="designer">Designer</option>
                    <option value="devops">DevOps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Experience</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="average">Average Experience</option>
                    <option value="junior">Junior (0-2y)</option>
                    <option value="mid">Mid-Level (3-5y)</option>
                    <option value="senior">Senior (6+y)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* --- NOMAD PANEL --- */}
          <NomadPanel
            isNomadMode={isNomadMode}
            setIsNomadMode={setIsNomadMode}
            arbitrageMode={arbitrageMode}
            setArbitrageMode={setArbitrageMode}
            arbitrationCityId={arbitrationCityId}
            setArbitrationCityId={setArbitrationCityId}
          />

          {/* --- ADVANCED FILTERS --- */}
          <FilterBar
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            isNomadMode={isNomadMode}
            arbitrageMode={arbitrageMode}
          />
        </div>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="mt-auto pt-6 flex justify-between items-center border-t border-slate-200/50">
          <button onClick={onOpenAbout} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors cursor-pointer">
            About Kept.
          </button>
        </div>
      </div>

      <ArbitrageModal
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        baselineCity={baselineCity}
        isNomadMode={isNomadMode}
        arbitrageMode={arbitrageMode}
        arbitrationCityId={arbitrationCityId}
        roleKey={roleKey}
      />
    </div>
  );
}