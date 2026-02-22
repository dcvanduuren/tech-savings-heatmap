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
function getDynamicColors(savings: number, maxSavings: number) {
  const ratio = maxSavings > 0 ? Math.max(0, Math.min(1, savings / maxSavings)) : 0;
  const expenseHue = 0;
  const profitHue = 140;
  const hue = Math.round(expenseHue + (ratio * (profitHue - expenseHue)));
  return {
    core: `hsl(${hue}, 65%, 50%)`,
    glow: `radial-gradient(circle, hsla(${hue}, 65%, 50%, 0.25) 0%, hsla(${hue}, 65%, 50%, 0) 70%)`
  };
}

// --- TYPES ---
export type CityData = {
  name: string;
  lat: number;
  lng: number;
  salaryGross: number;
  salaryNet: number;
  rent: number;
  living: number;
  savings: number; // calculated as: salaryNet - rent - living
};

// --- DATA: Now with Gross & Net Salary ---
const MOCK_CITIES: CityData[] = [
  { name: "London", lat: 51.50, lng: -0.12, salaryGross: 8000, salaryNet: 5200, rent: 2500, living: 1800, savings: 900 },
  { name: "Zurich", lat: 47.37, lng: 8.54, salaryGross: 10500, salaryNet: 8200, rent: 3000, living: 3500, savings: 1700 },
  { name: "Amsterdam", lat: 52.37, lng: 4.89, salaryGross: 6500, salaryNet: 4400, rent: 2200, living: 1500, savings: 700 },
  { name: "Berlin", lat: 52.52, lng: 13.40, salaryGross: 6200, salaryNet: 3800, rent: 1500, living: 1200, savings: 1100 },
  { name: "Munich", lat: 48.13, lng: 11.57, salaryGross: 6800, salaryNet: 4100, rent: 1800, living: 1400, savings: 900 },
  { name: "Stockholm", lat: 59.32, lng: 18.06, salaryGross: 6000, salaryNet: 3900, rent: 1600, living: 1400, savings: 900 },
  { name: "Oslo", lat: 59.91, lng: 10.75, salaryGross: 7200, salaryNet: 4700, rent: 1800, living: 1800, savings: 1100 },
  { name: "Copenhagen", lat: 55.67, lng: 12.56, salaryGross: 6800, salaryNet: 4200, rent: 1900, living: 1900, savings: 400 },
  { name: "Paris", lat: 48.85, lng: 2.35, salaryGross: 5800, salaryNet: 3800, rent: 1700, living: 1300, savings: 800 },
  { name: "Dublin", lat: 53.34, lng: -6.26, salaryGross: 7000, salaryNet: 4600, rent: 2400, living: 1700, savings: 500 },
  { name: "Vienna", lat: 48.20, lng: 16.37, salaryGross: 5500, salaryNet: 3600, rent: 1100, living: 1000, savings: 1500 },
  { name: "Madrid", lat: 40.41, lng: -3.70, salaryGross: 4800, salaryNet: 3500, rent: 1200, living: 1000, savings: 1300 },
  { name: "Barcelona", lat: 41.38, lng: 2.17, salaryGross: 4800, salaryNet: 3500, rent: 1300, living: 1100, savings: 1100 },
  { name: "Milan", lat: 45.46, lng: 9.18, salaryGross: 5200, salaryNet: 3300, rent: 1400, living: 1200, savings: 700 },
  { name: "Tallinn", lat: 59.43, lng: 24.75, salaryGross: 4500, salaryNet: 3600, rent: 900, living: 900, savings: 1800 },
  { name: "Warsaw", lat: 52.22, lng: 21.01, salaryGross: 5200, salaryNet: 4400, rent: 1100, living: 800, savings: 2500 },
  { name: "Kraków", lat: 50.06, lng: 19.94, salaryGross: 4800, salaryNet: 4100, rent: 900, living: 700, savings: 2500 },
  { name: "Prague", lat: 50.07, lng: 14.43, salaryGross: 4800, salaryNet: 3700, rent: 1100, living: 900, savings: 1700 },
  { name: "Budapest", lat: 47.49, lng: 19.04, salaryGross: 4200, salaryNet: 2800, rent: 800, living: 700, savings: 1300 },
  { name: "Bucarest", lat: 44.42, lng: 26.10, salaryGross: 4500, salaryNet: 4000, rent: 700, living: 600, savings: 2700 },
  { name: "Cluj-Napoca", lat: 46.77, lng: 23.59, salaryGross: 4200, salaryNet: 3800, rent: 600, living: 600, savings: 2600 },
  { name: "Sofia", lat: 42.69, lng: 23.32, salaryGross: 4000, salaryNet: 3600, rent: 600, living: 600, savings: 2400 },
  { name: "Belgrade", lat: 44.78, lng: 20.44, salaryGross: 3500, salaryNet: 3100, rent: 700, living: 600, savings: 1800 },
  { name: "Kyiv", lat: 50.45, lng: 30.52, salaryGross: 4000, salaryNet: 4000, rent: 700, living: 600, savings: 2700 },
  { name: "Athens", lat: 37.98, lng: 23.72, salaryGross: 3500, salaryNet: 2500, rent: 700, living: 700, savings: 1100 },
  { name: "Lisbon", lat: 38.72, lng: -9.13, salaryGross: 4000, salaryNet: 2700, rent: 1200, living: 900, savings: 600 },
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

  // --- PERSONALIZATION STATE ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ salaryGross: number; salaryNet: number; rent: number; living: number } | null>(null);

  const [inputSalaryGross, setInputSalaryGross] = useState('');
  const [inputSalaryNet, setInputSalaryNet] = useState(''); const [inputRent, setInputRent] = useState('');
  const [inputLiving, setInputLiving] = useState('');

  useEffect(() => {
    if (entryCenter) {
      setActiveCenter(entryCenter);
    }
  }, [entryCenter]);

  const maxSavings = Math.max(...MOCK_CITIES.map((c) => c.savings), 1);

  // State for our popup Modal
  const [selectedCity, setSelectedCity] = useState<typeof MOCK_CITIES[0] | null>(null);

  const baselineCity = useMemo(() => {
    const center = activeCenter || { lng: DEFAULT_VIEW.longitude, lat: DEFAULT_VIEW.latitude };

    if (userProfile && activeCenter) {
      return {
        name: "My Profile",
        lat: activeCenter.lat,
        lng: activeCenter.lng,
        salaryGross: userProfile.salaryGross,
        salaryNet: userProfile.salaryNet,
        rent: userProfile.rent,
        living: userProfile.living,
        savings: userProfile.salaryNet - userProfile.rent - userProfile.living
      };
    }

    // Find the closest city in our MOCK_CITIES to the current center
    return MOCK_CITIES.reduce((closest, current) => {
      const currentDist = getDistance(center.lat, center.lng, current.lat, current.lng);
      const closestDist = getDistance(center.lat, center.lng, closest.lat, closest.lng);
      return currentDist < closestDist ? current : closest;
    });
  }, [activeCenter, userProfile]);

  const dataPointOpacity = Math.max(0, Math.min(1, (zoom - 3.5) / 0.5));
  const glowScale = zoom >= 5 ? 1 : zoom <= 2 ? 5 : 1 + ((5 - zoom) / 3) * 4;
  const isInteractive = dataPointOpacity > 0.1;

  return (
    <div className="h-full w-full min-h-[400px] relative">
      <Map
        initialViewState={DEFAULT_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapToken}
        onMove={(evt) => setZoom(evt.viewState.zoom)}
      >
        <MapController targetCenter={activeCenter} />

        {MOCK_CITIES.map((city) => {
          const colors = getDynamicColors(city.savings, maxSavings);
          const difference = city.savings - baselineCity.savings;
          const isBaseline = city.name === baselineCity.name;
          const diffColorClass = difference > 0 ? "text-emerald-400" : difference < 0 ? "text-rose-400" : "text-slate-300";

          return (
            <Marker key={city.name} longitude={city.lng} latitude={city.lat} anchor="center">
              <div className="relative flex h-32 w-32 items-center justify-center pointer-events-none">
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
                  className={`group relative z-10 flex h-8 w-8 items-center justify-center transition-all duration-300 ${isInteractive ? 'cursor-pointer hover:scale-125 pointer-events-auto' : ''}`}
                  style={{
                    opacity: dataPointOpacity,
                    pointerEvents: isInteractive ? 'auto' : 'none'
                  }}
                  onClick={(e) => {
                    if (!isInteractive) return;
                    e.stopPropagation();
                    setSelectedCity(city);
                  }}
                >
                  <div
                    className={`h-3 w-3 rounded-full border-2 border-white/90 shadow-md ${isBaseline ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: colors.core }}
                  />

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-50 pointer-events-none">
                    <span className="font-sans font-medium">{city.name}: </span>
                    <span className={`font-mono font-bold ${diffColorClass}`}>
                      {isBaseline ? "Baseline" : `${difference > 0 ? '+' : '-'}€${Math.abs(difference).toLocaleString()}`}
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

      {/* --- MY PROFILE BUTTON --- */}
      <div className="absolute bottom-8 right-8 z-30">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="bg-white/90 backdrop-blur-md shadow-xl rounded-full px-6 py-3 font-sans font-semibold text-slate-800 hover:bg-white transition-colors border border-white/40 cursor-pointer"
        >
          My Profile
        </button>
      </div>

      {/* --- MY PROFILE SLIDE-OUT PANEL --- */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isProfileOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-sans font-bold text-slate-900">My Profile</h2>
            <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Gross Salary (€)</label>
              <input
                type="number"
                value={inputSalaryGross}
                onChange={(e) => setInputSalaryGross(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. 6000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Net Salary (€)</label>
              <input
                type="number"
                value={inputSalaryNet}
                onChange={(e) => setInputSalaryNet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. 4200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current 1BR Rent (€)</label>
              <input
                type="number"
                value={inputRent}
                onChange={(e) => setInputRent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. 1500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Living Costs (€)</label>
              <input
                type="number"
                value={inputLiving}
                onChange={(e) => setInputLiving(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. 1000"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4 mt-auto">
            <button
              onClick={() => {
                const sg = parseFloat(inputSalaryGross);
                const sn = parseFloat(inputSalaryNet);
                const r = parseFloat(inputRent);
                const l = parseFloat(inputLiving);
                if (!isNaN(sg) && !isNaN(sn) && !isNaN(r) && !isNaN(l)) {
                  setUserProfile({ salaryGross: sg, salaryNet: sn, rent: r, living: l });
                  setIsProfileOpen(false);
                }
              }}
              className="flex-1 bg-slate-900 text-white rounded-lg py-3 font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Apply to Map
            </button>
            <button
              onClick={() => {
                setUserProfile(null);
                setInputSalaryGross('');
                setInputSalaryNet('');
                setInputRent('');
                setInputLiving('');
                setIsProfileOpen(false);
              }}
              className="px-4 text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
            >
              Clear
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
              Arbitrage Breakdown
            </h2>

            {/* Comparison Grid (Minimalist 5-Column Layout) */}
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
                  <p className={selectedCity.rent < baselineCity.rent ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                    €{selectedCity.rent.toLocaleString()}
                  </p>
                  <p className={selectedCity.living < baselineCity.living ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                    €{selectedCity.living.toLocaleString()}
                  </p>
                  <p className={selectedCity.savings > baselineCity.savings ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                    €{selectedCity.savings.toLocaleString()}
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Summary Bar */}
            <div className="mt-8 rounded-2xl bg-slate-50 py-4 text-center shadow-inner">
              <p className="font-sans text-sm text-slate-500">Net Monthly Difference</p>
              <p className={`font-mono text-2xl font-bold mt-1 ${selectedCity.savings - baselineCity.savings > 0 ? "text-emerald-500" : "text-rose-500"
                }`}>
                {(selectedCity.savings - baselineCity.savings) > 0 ? '+' : ''}
                €{(selectedCity.savings - baselineCity.savings).toLocaleString()}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}