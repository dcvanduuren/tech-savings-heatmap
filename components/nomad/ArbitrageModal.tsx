import React, { useEffect, useState } from 'react';
import { CityData } from '../../types/city';

export type ArbitrageModalProps = {
    selectedCity: CityData | null;
    setSelectedCity: (city: CityData | null) => void;
    baselineCity: CityData;
    isNomadMode: boolean;
    arbitrageMode: 'work' | 'home';
    arbitrationCityId: string;
    roleKey: string;
};

export function ArbitrageModal({
    selectedCity,
    setSelectedCity,
    baselineCity,
    isNomadMode,
    arbitrageMode,
    arbitrationCityId,
    roleKey
}: ArbitrageModalProps) {
    // We use a local state to 'hold onto' the city data for exactly enough
    // time to let the CSS slide-out animation play when selectedCity becomes null
    const [displayCity, setDisplayCity] = useState<CityData | null>(selectedCity);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (selectedCity) {
            setDisplayCity(selectedCity);
            // Slight delay to ensure the DOM paints the start state before adding the active classes
            const timer = setTimeout(() => setIsActive(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsActive(false);
            // Slight delay before wiping the data so the panel can slide out gracefully
            const timer = setTimeout(() => setDisplayCity(null), 300);
            return () => clearTimeout(timer);
        }
    }, [selectedCity]);

    if (!displayCity) return null;

    return (
        <div className={`absolute top-8 left-8 bottom-8 w-80 z-30 flex flex-col bg-white/[0.15] backdrop-blur-[6px] border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.12),0_60px_120px_rgba(0,0,0,0.24)] rounded-none pointer-events-auto overflow-y-auto custom-scrollbar transition-all duration-300 origin-left ${isActive ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-12 opacity-0 pointer-events-none scale-95'}`}>

            {/* Header / Utilities Container */}
            <div className="flex-shrink-0 p-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-slate-800">
                        {isNomadMode && arbitrationCityId ? "Nomad Math" : "Compare"}
                    </h2>
                    <button
                        onClick={() => setSelectedCity(null)}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                        Fold
                    </button>
                </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 space-y-8">
                {isNomadMode && arbitrationCityId ? (
                    // --- NOMAD SUMMARY MODE ---
                    <div className="space-y-6">
                        <div className="rounded-none bg-white/40 p-5 border border-white/50 shadow-sm">
                            <div className="flex flex-col gap-1 border-b border-slate-200/50 pb-3 mb-3">
                                <span className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">Income Source</span>
                                <span className="font-mono text-base font-bold text-slate-900">{arbitrageMode === 'work' ? baselineCity.name : displayCity.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-sans text-xs text-slate-600 font-medium">Net Salary</span>
                                <span className="font-mono text-orange-500 font-bold text-sm">+€{(arbitrageMode === 'work' ? baselineCity.salaryNet[roleKey] : displayCity.salaryNet[roleKey]).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="rounded-none bg-white/40 p-5 border border-white/50 shadow-sm">
                            <div className="flex flex-col gap-1 border-b border-slate-200/50 pb-3 mb-3">
                                <span className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">Living Base</span>
                                <span className="font-mono text-base font-bold text-slate-900">{arbitrageMode === 'work' ? displayCity.name : baselineCity.name}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-sans text-xs text-slate-600 font-medium">1BR Rent</span>
                                <span className="font-mono text-slate-500 font-bold text-sm">-€{(arbitrageMode === 'work' ? displayCity.rent : baselineCity.rent).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-sans text-xs text-slate-600 font-medium">Living Cost</span>
                                <span className="font-mono text-slate-500 font-bold text-sm">-€{(arbitrageMode === 'work' ? displayCity.living : baselineCity.living).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-6 rounded-none border border-orange-400/50 bg-white/60 p-5 text-center shadow-md">
                            <p className="font-sans text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-1">Total Monthly Kept</p>
                            <p className="font-mono text-2xl font-bold text-orange-500">
                                €{displayCity.savings[roleKey].toLocaleString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    // --- SIDEBAR VERTICAL COMPARISON MODE ---
                    <div className="space-y-8">
                        {/* Baseline Box */}
                        <div className="rounded-none bg-white/50 border border-white/60 p-5 shadow-sm">
                            <h3 className="font-sans text-sm font-bold text-slate-800 mb-4 border-b border-white pb-2 flex items-center justify-between">
                                Baseline
                                <span className="text-orange-500 text-xs w-2 h-2 rounded-full bg-orange-500 drop-shadow shadow-orange-500"></span>
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Gross</span>
                                    <span className="font-mono text-xs text-slate-700">€{baselineCity.salaryGross[roleKey].toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Net</span>
                                    <span className="font-mono text-xs font-bold text-slate-800">€{baselineCity.salaryNet[roleKey].toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Rent</span>
                                    <span className="font-mono text-xs text-slate-500">€{baselineCity.rent.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Col</span>
                                    <span className="font-mono text-xs text-slate-500">€{baselineCity.living.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-orange-600">Kept</span>
                                    <span className="font-mono text-sm font-bold text-orange-600">€{baselineCity.savings[roleKey].toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Box */}
                        <div className="rounded-none bg-white/50 border border-white/60 p-5 shadow-sm">
                            <h3 className="font-sans text-sm font-bold text-slate-800 mb-4 border-b border-white pb-2 flex items-center justify-between">
                                {displayCity.name}
                                <span className="text-slate-500 text-xs w-2 h-2 rounded-full bg-indigo-400 drop-shadow shadow-indigo-400"></span>
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Gross</span>
                                    <span className="font-mono text-xs text-slate-700">€{displayCity.salaryGross[roleKey].toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Net</span>
                                    <span className="font-mono text-xs font-bold text-slate-800">€{displayCity.salaryNet[roleKey].toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Rent</span>
                                    <span className={`font-mono text-xs ${displayCity.rent < baselineCity.rent ? "text-orange-500 font-bold" : "text-slate-500"}`}>
                                        €{displayCity.rent.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">Col</span>
                                    <span className={`font-mono text-xs ${displayCity.living < baselineCity.living ? "text-orange-500 font-bold" : "text-slate-500"}`}>
                                        €{displayCity.living.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white">
                                    <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-orange-600">Kept</span>
                                    <span className={`font-mono text-sm font-bold ${displayCity.savings[roleKey] > baselineCity.savings[roleKey] ? "text-orange-500" : "text-slate-600"}`}>
                                        €{displayCity.savings[roleKey].toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Total Summary */}
                        <div className="bg-white/70 border border-white p-5 text-center shadow-md">
                            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500">Swap Delta</p>
                            <p className={`font-mono text-2xl font-bold mt-2 ${displayCity.savings[roleKey] > baselineCity.savings[roleKey] ? "text-orange-500" : "text-slate-500"}`}>
                                {displayCity.savings[roleKey] > baselineCity.savings[roleKey] ? '+' : ''}
                                {displayCity.savings[roleKey] < baselineCity.savings[roleKey] ? '-' : ''}
                                €{Math.abs(displayCity.savings[roleKey] - baselineCity.savings[roleKey]).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
