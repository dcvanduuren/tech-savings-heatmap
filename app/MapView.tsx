"use client";

import Map, { Marker, useMap } from '@vis.gl/react-mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchBox } from '@mapbox/search-js-react';

// --- MATH: Calculate distance ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- COLOR: FinTech Scale ---
function getDynamicColors(savings: number, minSavings: number, maxSavings: number) {
  const range = maxSavings - minSavings;
  const ratio = range > 0 ? Math.max(0, Math.min(1, (savings - minSavings) / range)) : 0.5;
  const expenseHue = 0;   // Deep Red
  const profitHue = 140;  // Vibrant Green
  const hue = Math.round(expenseHue + (ratio * (profitHue - expenseHue)));
  return {
    core: `hsl(${hue}, 65%, 50%)`,
    glow: `radial-gradient(circle, hsla(${hue}, 65%, 50%, 0.25) 0%, hsla(${hue}, 65%, 50%, 0) 70%)`
  };
}

export type CityData = {
  name: string;
  lat: number;
  lng: number;
  salaryGross: number;
  salaryNet: number;
  rent: number;
  living: number;
  savings: number; // calculated as: salaryNet - rent - living
  sunshine: number; // annual sunshine hours
  isArbitrageBase?: boolean;
};

// --- DATA: Now with Gross & Net Salary ---
const MOCK_CITIES: CityData[] = [
  { name: "London", lat: 51.50, lng: -0.12, salaryGross: 8500, salaryNet: 5600, rent: 2600, living: 1400, savings: 1600, sunshine: 1633 },
  { name: "Zurich", lat: 47.37, lng: 8.54, salaryGross: 11000, salaryNet: 8800, rent: 3200, living: 2500, savings: 3100, sunshine: 1566 },
  { name: "Amsterdam", lat: 52.37, lng: 4.89, salaryGross: 6800, salaryNet: 4400, rent: 2200, living: 1200, savings: 1000, sunshine: 1662 },
  { name: "Berlin", lat: 52.52, lng: 13.40, salaryGross: 6500, salaryNet: 3900, rent: 1600, living: 1100, savings: 1200, sunshine: 1626 },
  { name: "Munich", lat: 48.13, lng: 11.57, salaryGross: 7000, salaryNet: 4200, rent: 1900, living: 1200, savings: 1100, sunshine: 1708 },
  { name: "Stockholm", lat: 59.32, lng: 18.06, salaryGross: 6200, salaryNet: 4100, rent: 1700, living: 1300, savings: 1100, sunshine: 1803 },
  { name: "Oslo", lat: 59.91, lng: 10.75, salaryGross: 7200, salaryNet: 4700, rent: 1800, living: 1800, savings: 1100, sunshine: 1668 },
  { name: "Copenhagen", lat: 55.67, lng: 12.56, salaryGross: 7200, salaryNet: 4300, rent: 2000, living: 1500, savings: 800, sunshine: 1630 },
  { name: "Paris", lat: 48.85, lng: 2.35, salaryGross: 6000, salaryNet: 4000, rent: 1800, living: 1200, savings: 1000, sunshine: 1662 },
  { name: "Dublin", lat: 53.34, lng: -6.26, salaryGross: 7500, salaryNet: 4800, rent: 2500, living: 1300, savings: 1000, sunshine: 1424 },
  { name: "Vienna", lat: 48.20, lng: 16.37, salaryGross: 5800, salaryNet: 3700, rent: 1200, living: 1000, savings: 1500, sunshine: 1930 },
  { name: "Madrid", lat: 40.41, lng: -3.70, salaryGross: 5200, salaryNet: 3700, rent: 1400, living: 1100, savings: 1200, sunshine: 2769 },
  { name: "Barcelona", lat: 41.38, lng: 2.17, salaryGross: 5200, salaryNet: 3700, rent: 1500, living: 1200, savings: 1000, sunshine: 2524 },
  { name: "Milan", lat: 45.46, lng: 9.18, salaryGross: 5200, salaryNet: 3300, rent: 1500, living: 1200, savings: 600, sunshine: 1915 },
  { name: "Tallinn", lat: 59.43, lng: 24.75, salaryGross: 4800, salaryNet: 3800, rent: 900, living: 900, savings: 2000, sunshine: 1826 },
  { name: "Warsaw", lat: 52.22, lng: 21.01, salaryGross: 5500, salaryNet: 4600, rent: 1200, living: 900, savings: 2500, sunshine: 1573 },
  { name: "Kraków", lat: 50.06, lng: 19.94, salaryGross: 5000, salaryNet: 4200, rent: 1000, living: 800, savings: 2400, sunshine: 1550 },
  { name: "Prague", lat: 50.07, lng: 14.43, salaryGross: 5000, salaryNet: 3900, rent: 1300, living: 1000, savings: 1600, sunshine: 1668 },
  { name: "Budapest", lat: 47.49, lng: 19.04, salaryGross: 4200, salaryNet: 2800, rent: 900, living: 800, savings: 1100, sunshine: 1988 },
  { name: "Bucarest", lat: 44.42, lng: 26.10, salaryGross: 4500, salaryNet: 3900, rent: 800, living: 700, savings: 2400, sunshine: 2115 },
  { name: "Lisbon", lat: 38.72, lng: -9.13, salaryGross: 4200, salaryNet: 2800, rent: 1400, living: 900, savings: 500, sunshine: 2799 },
  { name: "Athens", lat: 37.98, lng: 23.72, salaryGross: 3500, salaryNet: 2500, rent: 800, living: 800, savings: 900, sunshine: 2771 },
  { name: "Helsinki", lat: 60.17, lng: 24.94, salaryGross: 6200, salaryNet: 4100, rent: 1400, living: 1200, savings: 1500, sunshine: 1858 },
  { name: "Hamburg", lat: 53.55, lng: 9.99, salaryGross: 6800, salaryNet: 4100, rent: 1500, living: 1200, savings: 1400, sunshine: 1582 },
  { name: "Frankfurt", lat: 50.11, lng: 8.68, salaryGross: 7200, salaryNet: 4300, rent: 1800, living: 1300, savings: 1200, sunshine: 1662 },
  { name: "Rotterdam", lat: 51.92, lng: 4.48, salaryGross: 6500, salaryNet: 4200, rent: 1700, living: 1100, savings: 1400, sunshine: 1600 },
  { name: "Wrocław", lat: 51.10, lng: 17.03, salaryGross: 5200, salaryNet: 4400, rent: 1000, living: 800, savings: 2600, sunshine: 1680 },
  { name: "Lyon", lat: 45.76, lng: 4.83, salaryGross: 5500, salaryNet: 3600, rent: 1200, living: 1000, savings: 1400, sunshine: 2000 },
  { name: "Grenoble", lat: 45.18, lng: 5.72, salaryGross: 5200, salaryNet: 3400, rent: 900, living: 900, savings: 1600, sunshine: 2050 },
  { name: "Porto", lat: 41.15, lng: -8.62, salaryGross: 3800, salaryNet: 2600, rent: 1100, living: 800, savings: 700, sunshine: 2468 },
  { name: "Bratislava", lat: 48.14, lng: 17.10, salaryGross: 4500, salaryNet: 3400, rent: 1000, living: 800, savings: 1600, sunshine: 2050 },
  { name: "Belgrade", lat: 44.78, lng: 20.44, salaryGross: 4200, salaryNet: 3700, rent: 900, living: 700, savings: 2100, sunshine: 2112 },
];

const DEFAULT_VIEW = { longitude: 15.0, latitude: 50.0, zoom: 3.5 };

type MapViewProps = {
  entryCityQuery?: string;
  initialCenter?: { lng: number; lat: number };
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

export default function MapView({ entryCityQuery, initialCenter: entryCenter }: MapViewProps) {
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  const [activeCenter, setActiveCenter] = useState(entryCenter);
  const [zoom, setZoom] = useState(DEFAULT_VIEW.zoom);

  // --- FILTER STATE ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filterMinNet, setFilterMinNet] = useState('');
  const [filterMaxNet, setFilterMaxNet] = useState('');
  const [filterMinRent, setFilterMinRent] = useState('');
  const [filterMaxRent, setFilterMaxRent] = useState('');
  const [filterMinLiving, setFilterMinLiving] = useState('');
  const [filterMaxLiving, setFilterMaxLiving] = useState('');
  const [filterMinKept, setFilterMinKept] = useState('');
  const [filterMaxKept, setFilterMaxKept] = useState('');
  const [filterMinSunshine, setFilterMinSunshine] = useState('');

  // --- ARBITRAGE MODE STATE ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNomadMode, setIsNomadMode] = useState(false);
  const [arbitrageMode, setArbitrageMode] = useState<'work' | 'home'>('work');
  const [arbitrationCityId, setArbitrationCityId] = useState<string>('');

  useEffect(() => {
    if (entryCenter) {
      setActiveCenter(entryCenter);
    }
  }, [entryCenter]);

  const adjustedCities = useMemo(() => {
    if (!isNomadMode || !arbitrationCityId) return MOCK_CITIES.map(c => ({ ...c, isArbitrageBase: false }));

    const anchorCity = MOCK_CITIES.find(c => c.name === arbitrationCityId);
    if (!anchorCity) return MOCK_CITIES.map(c => ({ ...c, isArbitrageBase: false }));

    return MOCK_CITIES.map(candidate => {
      const isAnchor = candidate.name === anchorCity.name;

      if (arbitrageMode === 'work') {
        const compositeSavings = anchorCity.salaryNet - candidate.rent - candidate.living;
        return {
          ...candidate,
          salaryGross: anchorCity.salaryGross,
          salaryNet: anchorCity.salaryNet,
          savings: compositeSavings,
          isArbitrageBase: isAnchor
        };
      } else {
        const compositeSavings = candidate.salaryNet - anchorCity.rent - anchorCity.living;
        return {
          ...candidate,
          rent: anchorCity.rent,
          living: anchorCity.living,
          savings: compositeSavings,
          isArbitrageBase: isAnchor
        };
      }
    });
  }, [arbitrationCityId, arbitrageMode, isNomadMode]);

  const { minSavings, maxSavings, visibleCities } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    const visible: (typeof MOCK_CITIES[0] & { isArbitrageBase?: boolean })[] = [];

    const isSunshineFilterActive = isNomadMode && arbitrageMode === 'work' && filterMinSunshine !== '';

    for (const city of adjustedCities) {
      const passesFilter =
        (filterMinNet === '' || city.salaryNet >= Number(filterMinNet)) &&
        (filterMaxNet === '' || city.salaryNet <= Number(filterMaxNet)) &&
        (filterMinRent === '' || city.rent >= Number(filterMinRent)) &&
        (filterMaxRent === '' || city.rent <= Number(filterMaxRent)) &&
        (filterMinLiving === '' || city.living >= Number(filterMinLiving)) &&
        (filterMaxLiving === '' || city.living <= Number(filterMaxLiving)) &&
        (filterMinKept === '' || city.savings >= Number(filterMinKept)) &&
        (filterMaxKept === '' || city.savings <= Number(filterMaxKept)) &&
        (!isSunshineFilterActive || city.sunshine >= Number(filterMinSunshine));

      if (passesFilter) {
        visible.push(city);
        if (city.savings < min) min = city.savings;
        if (city.savings > max) max = city.savings;
      }
    }

    return {
      minSavings: min === Infinity ? 0 : min,
      maxSavings: max === -Infinity ? 0 : max,
      visibleCities: visible
    };
  }, [adjustedCities, filterMinNet, filterMaxNet, filterMinRent, filterMaxRent, filterMinLiving, filterMaxLiving, filterMinKept, filterMaxKept, filterMinSunshine, isNomadMode, arbitrageMode]);

  // State for our popup Modal
  const [selectedCity, setSelectedCity] = useState<typeof MOCK_CITIES[0] | null>(null);
  const [hoveredCity, setHoveredCity] = useState<typeof MOCK_CITIES[0] | null>(null);

  const baselineCity = useMemo(() => {
    if (isNomadMode && arbitrationCityId) {
      const anchor = adjustedCities.find(c => c.name === arbitrationCityId);
      if (anchor) return anchor;
    }

    const center = activeCenter || { lng: DEFAULT_VIEW.longitude, lat: DEFAULT_VIEW.latitude };

    // Find the closest city in our adjustedCities map to the current center
    return adjustedCities.reduce((closest, current) => {
      const currentDist = getDistance(center.lat, center.lng, current.lat, current.lng);
      const closestDist = getDistance(center.lat, center.lng, closest.lat, closest.lng);
      return currentDist < closestDist ? current : closest;
    });
  }, [activeCenter, adjustedCities, isNomadMode, arbitrationCityId]);

  const dataPointOpacity = Math.max(0, Math.min(1, (zoom - 3.5) / 0.5));
  const glowScale = zoom >= 5 ? 1 : zoom <= 2 ? 5 : 1 + ((5 - zoom) / 3) * 4;
  const isInteractive = dataPointOpacity > 0.1;

  const handleMapMouseMove = useCallback((evt: any) => {
    if (!isInteractive || visibleCities.length === 0) {
      if (hoveredCity) setHoveredCity(null);
      return;
    }

    // Dynamic max distance based on zoom.
    // At zoom 3.5 (Europe view), 300km is a good interaction radius.
    // As zoom increases (closer in), this radius strictly scales down.
    const maxDistKm = 300 * Math.pow(2, 3.5 - zoom);

    let closest: typeof MOCK_CITIES[0] | null = null;
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
    }
  }, [hoveredCity, isInteractive]);

  return (
    <div className="h-full w-full min-h-[400px] relative">
      <Map
        initialViewState={DEFAULT_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapToken}
        onMove={(evt) => setZoom(evt.viewState.zoom)}
        onMouseMove={handleMapMouseMove}
        onClick={handleMapClick}
        interactiveLayerIds={[]}
        cursor={hoveredCity ? 'pointer' : 'grab'}
      >
        <MapController targetCenter={activeCenter} />

        {adjustedCities.map((city) => {
          const baseColors = getDynamicColors(city.savings, minSavings, maxSavings);
          const isAnchor = city.isArbitrageBase;
          const colors = {
            core: isAnchor ? '#eab308' : baseColors.core,
            glow: isAnchor ? 'radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, rgba(250, 204, 21, 0) 70%)' : baseColors.glow
          };

          const difference = city.savings - baselineCity.savings;
          const isBaseline = city.name === baselineCity.name;
          const diffColorClass = difference > 0 ? "text-emerald-400" : difference < 0 ? "text-rose-400" : "text-slate-300";

          // --- FILTER MAGIC LOGIC ---
          const passesFilter =
            (filterMinNet === '' || city.salaryNet >= Number(filterMinNet)) &&
            (filterMaxNet === '' || city.salaryNet <= Number(filterMaxNet)) &&
            (filterMinRent === '' || city.rent >= Number(filterMinRent)) &&
            (filterMaxRent === '' || city.rent <= Number(filterMaxRent)) &&
            (filterMinLiving === '' || city.living >= Number(filterMinLiving)) &&
            (filterMaxLiving === '' || city.living <= Number(filterMaxLiving)) &&
            (filterMinKept === '' || city.savings >= Number(filterMinKept)) &&
            (filterMaxKept === '' || city.savings <= Number(filterMaxKept));

          const finalWrapperOpacity = passesFilter ? dataPointOpacity > 0 ? 1 : Math.max(0, Math.min(1, (zoom - 2.5) / 1.5)) : 0; // maintain zoom glow logic if zoomed out
          const finalPointerEvents = passesFilter && isInteractive ? 'auto' : 'none';

          return (
            <Marker key={city.name} longitude={city.lng} latitude={city.lat} anchor="center">
              <div
                className="relative flex h-32 w-32 items-center justify-center transition-opacity duration-300"
                style={{
                  opacity: passesFilter ? 1 : 0,
                  pointerEvents: 'none'
                }}
              >
                {/* Expanding Glow */}
                <div
                  className="animate-glow-pulse absolute inset-0 h-32 w-32 rounded-full transition-transform duration-500 ease-out"
                  style={{
                    background: colors.glow,
                    transform: `scale(${glowScale})`,
                    mixBlendMode: 'multiply'
                  }}
                  aria-hidden
                />

                {/* Interactive Dot & Text */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center transition-all duration-300 ${hoveredCity?.name === city.name ? 'scale-125' : ''}`}
                  style={{
                    opacity: dataPointOpacity,
                    pointerEvents: 'none'
                  }}
                >
                  <div
                    className={`flex h-3 w-3 items-center justify-center rounded-full border-2 border-white/90 shadow-md ${isBaseline ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: colors.core }}
                  >
                    {city.isArbitrageBase && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-1.5 w-1.5 text-white shadow-sm">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl transition-opacity whitespace-nowrap text-sm z-50 pointer-events-none ${hoveredCity?.name === city.name ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="font-sans font-medium">{city.name}: </span>
                    <span className={`font-mono font-bold ${diffColorClass}`}>
                      {isNomadMode && arbitrationCityId ? (
                        city.isArbitrageBase ? "Anchor City" : `Total Monthly Kept: €${city.savings.toLocaleString()}`
                      ) : (
                        isBaseline ? "Baseline" : difference === 0 ? "€0" : `${difference > 0 ? '+' : '-'}€${Math.abs(difference).toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* --- FLOATING SEARCH BAR --- */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-6">
        <div className="relative group shadow-2xl rounded-xl">
          <SearchBox
            accessToken={mapToken}
            placeholder="change baseline city"
            onRetrieve={(res) => {
              if (res.features && res.features[0]) {
                const [lng, lat] = res.features[0].geometry.coordinates;
                setActiveCenter({ lng, lat });
              }
            }}
            theme={{
              variables: {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                unit: '12px',
                borderRadius: '12px',
                colorBackground: 'rgba(255, 255, 255, 0.95)',
                colorText: '#1e293b',
              },
              cssText: `
                .mapboxgl-ctrl-geocoder { 
                  min-width: 100%;
                  box-shadow: none;
                }
                .mapbox-search-list {
                  z-index: 1000 !important;
                  background: rgba(255, 255, 255, 0.95) !important;
                  backdrop-filter: blur(8px);
                }
              `
            }}
          />
        </div>
      </div>

      {/* --- FILTER COMMAND CENTER --- */}
      <div className="absolute bottom-8 left-8 z-30">
        {isFilterOpen ? (
          <div className="w-80 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-white/40 p-5 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-bold text-slate-900">Advanced Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pointer-events-auto">
              {/* Net Salary */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Net Salary (€)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filterMinNet} onChange={(e) => setFilterMinNet(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  <input type="number" placeholder="Max" value={filterMaxNet} onChange={(e) => setFilterMaxNet(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>

              {/* 1BR Rent */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1BR Rent (€)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filterMinRent} onChange={(e) => setFilterMinRent(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  <input type="number" placeholder="Max" value={filterMaxRent} onChange={(e) => setFilterMaxRent(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>

              {/* Living Costs */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Living Costs (€)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filterMinLiving} onChange={(e) => setFilterMinLiving(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  <input type="number" placeholder="Max" value={filterMaxLiving} onChange={(e) => setFilterMaxLiving(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>

              {/* Monthly Kept */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Kept (€)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filterMinKept} onChange={(e) => setFilterMinKept(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  <input type="number" placeholder="Max" value={filterMaxKept} onChange={(e) => setFilterMaxKept(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>

              {/* Sunshine Filter */}
              {isNomadMode && arbitrageMode === 'work' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Sunshine</label>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      Min {filterMinSunshine || '0'}h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="100"
                    value={filterMinSunshine || '0'}
                    onChange={(e) => setFilterMinSunshine(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>Low</span>
                    <span>1500h</span>
                    <span>High</span>
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilterMinNet(''); setFilterMaxNet('');
                setFilterMinRent(''); setFilterMaxRent('');
                setFilterMinLiving(''); setFilterMaxLiving('');
                setFilterMinKept(''); setFilterMaxKept('');
                setFilterMinSunshine('');
              }}
              className="mt-4 w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider pointer-events-auto cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-lg border border-white/40 text-slate-800 font-semibold px-5 py-3 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 pointer-events-auto cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        )}
      </div>

      {/* --- PROFILE BUTTON --- */}
      <div className="absolute bottom-8 right-8 z-30">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="bg-white/90 backdrop-blur-md shadow-xl rounded-full px-6 py-3 font-sans font-semibold text-slate-800 hover:bg-white transition-colors border border-white/40 cursor-pointer"
        >
          My Profile
        </button>
      </div>

      {/* --- PROFILE SLIDE-OUT PANEL --- */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isProfileOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-sans font-bold text-slate-900">My Profile</h2>
            <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8 flex-1">

            {/* Go Nomad Toggle */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Go Nomad</h3>
                <p className="text-xs text-slate-500 mt-1">Unlock geographic arbitrage modeling.</p>
              </div>
              <button
                onClick={() => setIsNomadMode(!isNomadMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isNomadMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNomadMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {isNomadMode && (
              <>
                {/* Segmented Control */}
                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    onClick={() => setArbitrageMode('work')}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${arbitrageMode === 'work' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Work Baseline
                  </button>
                  <button
                    onClick={() => setArbitrageMode('home')}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${arbitrageMode === 'home' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Home Baseline
                  </button>
                </div>

                {/* City Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {arbitrageMode === 'work' ? 'Income Source City' : 'Living Base City'}
                  </label>
                  <div className="relative">
                    <select
                      value={arbitrationCityId}
                      onChange={(e) => setArbitrationCityId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-sans font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer pr-10"
                    >
                      <option value="">None (Default Map)</option>
                      {MOCK_CITIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Explanation Typography */}
                {arbitrationCityId && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                      {arbitrageMode === 'work'
                        ? `Showing how much you keep if you earn ${arbitrationCityId}'s actual salary (€${MOCK_CITIES.find(c => c.name === arbitrationCityId)?.salaryNet.toLocaleString()} net) but pay local expenses.`
                        : `Showing how much you keep if you pay ${arbitrationCityId}'s actual expenses (€${((MOCK_CITIES.find(c => c.name === arbitrationCityId)?.rent ?? 0) + (MOCK_CITIES.find(c => c.name === arbitrationCityId)?.living ?? 0)).toLocaleString()} total) but earn local salaries.`}
                    </p>
                  </div>
                )}
              </>
            )}

          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={() => {
                setArbitrationCityId('');
                setIsNomadMode(false);
                setIsProfileOpen(false);
              }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Close & Reset
            </button>
          </div>
        </div>
      </div>

      {/* --- CEO UI: THE CENTER VIEW MODAL --- */}
      {selectedCity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedCity(null)} // Clicking outside closes it
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the white box
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCity(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <h2 className="text-center font-sans text-xl font-semibold text-slate-800 mb-8">
              {isNomadMode && arbitrationCityId ? "Nomad Math" : "Relocation Breakdown"}
            </h2>

            {isNomadMode && arbitrationCityId ? (
              // --- NOMAD SUMMARY MODE ---
              <div className="space-y-6">
                <div className="rounded-2xl bg-slate-50 p-6 shadow-inner border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                    <span className="font-sans text-sm font-bold text-slate-500 uppercase tracking-widest">Income Source</span>
                    <span className="font-mono text-lg font-bold text-slate-900">{arbitrageMode === 'work' ? baselineCity.name : selectedCity.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans text-sm text-slate-600">Net Salary</span>
                    <span className="font-mono text-emerald-600 font-bold">+€{(arbitrageMode === 'work' ? baselineCity.salaryNet : selectedCity.salaryNet).toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 shadow-inner border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                    <span className="font-sans text-sm font-bold text-slate-500 uppercase tracking-widest">Living Base</span>
                    <span className="font-mono text-lg font-bold text-slate-900">{arbitrageMode === 'work' ? selectedCity.name : baselineCity.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans text-sm text-slate-600">1BR Rent</span>
                    <span className="font-mono text-rose-500 font-bold">-€{(arbitrageMode === 'work' ? selectedCity.rent : baselineCity.rent).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-slate-600">Living Cost</span>
                    <span className="font-mono text-rose-500 font-bold">-€{(arbitrageMode === 'work' ? selectedCity.living : baselineCity.living).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-slate-900 py-6 text-center shadow-xl">
                  <p className="font-sans text-sm text-slate-400 font-medium uppercase tracking-widest">Total Monthly Kept</p>
                  <p className="font-mono text-3xl font-bold mt-2 text-emerald-400">
                    €{selectedCity.savings.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              // --- COMPARISON GRID MODE ---
              <>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">

                  {/* Left Column: Baseline City */}
                  <div className="text-center">
                    <h3 className="font-sans text-lg font-bold text-slate-900 mb-4">{baselineCity.name}</h3>
                    <div className="space-y-4 font-mono text-slate-600">
                      <p>€{baselineCity.salaryGross.toLocaleString()}</p>
                      <p>€{baselineCity.salaryNet.toLocaleString()}</p>
                      <p>€{baselineCity.rent.toLocaleString()}</p>
                      <p>€{baselineCity.living.toLocaleString()}</p>
                      <p>€{baselineCity.savings.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Center Column: The Stats Labels */}
                  <div className="flex flex-col space-y-4 text-center font-sans text-xs font-bold uppercase tracking-widest text-slate-400 mt-11">
                    <p>Gross Salary</p>
                    <p>Net Salary</p>
                    <p>1BR Rent</p>
                    <p>Living Cost</p>
                    <p>Monthly Kept</p>
                  </div>

                  {/* Right Column: Clicked City */}
                  <div className="text-center">
                    <h3 className="font-sans text-lg font-bold text-slate-900 mb-4">{selectedCity.name}</h3>
                    <div className="space-y-4 font-mono text-slate-900">
                      <p>€{selectedCity.salaryGross.toLocaleString()}</p>
                      <p>€{selectedCity.salaryNet.toLocaleString()}</p>

                      {/* Highlight the rent/living costs to show where the savings are */}
                      <p className={selectedCity.rent < baselineCity.rent ? "text-emerald-500 font-bold" : selectedCity.rent > baselineCity.rent ? "text-rose-500 font-bold" : "text-slate-500 font-bold"}>
                        €{selectedCity.rent.toLocaleString()}
                      </p>
                      <p className={selectedCity.living < baselineCity.living ? "text-emerald-500 font-bold" : selectedCity.living > baselineCity.living ? "text-rose-500 font-bold" : "text-slate-500 font-bold"}>
                        €{selectedCity.living.toLocaleString()}
                      </p>
                      <p className={selectedCity.savings > baselineCity.savings ? "text-emerald-500 font-bold" : selectedCity.savings < baselineCity.savings ? "text-rose-500 font-bold" : "text-slate-500 font-bold"}>
                        €{selectedCity.savings.toLocaleString()}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Bottom Summary Bar */}
                <div className="mt-8 rounded-2xl bg-slate-50 py-4 text-center shadow-inner">
                  <p className="font-sans text-sm text-slate-500">Net Monthly Difference</p>
                  <p className={`font-mono text-2xl font-bold mt-1 ${selectedCity.savings > baselineCity.savings ? "text-emerald-500" :
                    selectedCity.savings < baselineCity.savings ? "text-rose-500" :
                      "text-slate-500"
                    }`}>
                    {selectedCity.savings > baselineCity.savings ? '+' : ''}
                    {selectedCity.savings < baselineCity.savings ? '-' : ''}
                    €{Math.abs(selectedCity.savings - baselineCity.savings).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}