import React, { useEffect, useState } from 'react';
import { CityData } from '../../types/city';
import { getTaxBreakdown } from '../../utils/taxEngine';

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
                    // --- SIDEBAR GRID COMPARISON MODE ---
                    <div className="space-y-6">

                        {/* Headers */}
                        <div className="grid grid-cols-2 gap-4 text-center px-2">
                            <div className="flex justify-center items-center gap-2">
                                <span className="text-orange-500 text-[10px] w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 block"></span>
                                <span className="font-sans text-[11px] font-bold text-slate-800 uppercase tracking-widest truncate" title="Baseline">{baselineCity.name}</span>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                                <span className="text-slate-500 text-[10px] w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50 block"></span>
                                <span className="font-sans text-[11px] font-bold text-slate-800 uppercase tracking-widest truncate" title={displayCity.name}>{displayCity.name}</span>
                            </div>
                        </div>

                        {/* Data Grid Body */}
                        <div className="bg-white/50 border border-white/60 shadow-sm p-4 text-[11px] rounded-none">
                            {/* Gross Salary Row */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 border-b border-white/40 group">
                                <span className="font-mono text-center text-slate-700">€{(baselineCity.salaryGross[roleKey] || 0).toLocaleString()}</span>
                                <span className="font-sans font-bold uppercase tracking-widest text-slate-400 text-[9px] w-14 text-center">Gross</span>
                                <span className="font-mono text-center text-slate-700">€{(displayCity.salaryGross[roleKey] || 0).toLocaleString()}</span>
                            </div>

                            {/* Tax Row with Tooltip */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 border-b border-white/40 relative">

                                <div className="text-center group/tooltip relative cursor-help">
                                    <span className="font-mono text-slate-500 border-b border-dashed border-slate-300 pointer-events-auto">€{((baselineCity.salaryGross[roleKey] || 0) - (baselineCity.salaryNet[roleKey] || 0)).toLocaleString()}</span>
                                    <div className="pointer-events-none absolute left-0 bottom-full mb-3 w-48 rounded-none border border-white bg-white/90 p-4 text-left opacity-0 shadow-2xl backdrop-blur-[12px] transition-all duration-200 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 translate-y-1 z-50">
                                        <p className="font-sans text-[9px] uppercase font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1.5 flex items-center justify-between">Tax Breakdown <span>🏛️</span></p>
                                        {getTaxBreakdown(baselineCity.salaryGross[roleKey] || 0, baselineCity.name).map((t, idx) => (
                                            <div key={idx} className="flex justify-between items-center mb-1.5 text-slate-700 font-mono text-[10px]">
                                                <span className="font-sans text-[10px] font-medium">{t.label}</span>
                                                <span className="font-bold text-slate-800">€{t.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <p className="font-sans text-[8px] text-orange-600 mt-2.5 pt-1.5 border-t border-slate-200 font-medium">Spot an error? Update it via the crowdsource button.</p>
                                    </div>
                                </div>

                                <span className="font-sans font-bold uppercase tracking-widest text-slate-400 text-[9px] w-14 text-center flex items-center justify-center gap-[2px]">
                                    Taxes <span className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] italic font-semibold border-none text-slate-400 opacity-60">i</span>
                                </span>

                                <div className="text-center group/tooltip relative cursor-help">
                                    <span className="font-mono text-slate-500 border-b border-dashed border-slate-300 pointer-events-auto">€{((displayCity.salaryGross[roleKey] || 0) - (displayCity.salaryNet[roleKey] || 0)).toLocaleString()}</span>
                                    <div className="pointer-events-none absolute right-0 bottom-full mb-3 w-48 rounded-none border border-white bg-white/90 p-4 text-left opacity-0 shadow-2xl backdrop-blur-[12px] transition-all duration-200 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 translate-y-1 z-50">
                                        <p className="font-sans text-[9px] uppercase font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1.5 flex items-center justify-between">Tax Breakdown <span>🏛️</span></p>
                                        {getTaxBreakdown(displayCity.salaryGross[roleKey] || 0, displayCity.name).map((t, idx) => (
                                            <div key={idx} className="flex justify-between items-center mb-1.5 text-slate-700 font-mono text-[10px]">
                                                <span className="font-sans text-[10px] font-medium">{t.label}</span>
                                                <span className="font-bold text-slate-800">€{t.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <p className="font-sans text-[8px] text-orange-600 mt-2.5 pt-1.5 border-t border-slate-200 font-medium">Spot an error? Update it via the crowdsource button.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Net Salary Row */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 border-b border-slate-300/60 bg-slate-50/50 mt-1">
                                <span className="font-mono text-center font-bold text-slate-900">€{(baselineCity.salaryNet[roleKey] || 0).toLocaleString()}</span>
                                <span className="font-sans font-bold uppercase tracking-widest text-slate-500 text-[9px] w-14 text-center">Net</span>
                                <span className="font-mono text-center font-bold text-slate-900">€{(displayCity.salaryNet[roleKey] || 0).toLocaleString()}</span>
                            </div>

                            {/* Rent Row */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 border-b border-white/40 mt-1">
                                <span className="font-mono text-center text-slate-500">-€{(baselineCity.rent || 0).toLocaleString()}</span>
                                <span className="font-sans font-bold uppercase tracking-widest text-slate-400 text-[9px] w-14 text-center">Rent</span>
                                <span className={`font-mono text-center ${(displayCity.rent || 0) < (baselineCity.rent || 0) ? "text-orange-500 font-bold" : "text-slate-500"}`}>
                                    -€{(displayCity.rent || 0).toLocaleString()}
                                </span>
                            </div>

                            {/* COL Row */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 border-b border-white/40">
                                <span className="font-mono text-center text-slate-500">-€{(baselineCity.living || 0).toLocaleString()}</span>
                                <span className="font-sans font-bold uppercase tracking-widest text-slate-400 text-[9px] w-14 text-center">CoL</span>
                                <span className={`font-mono text-center ${(displayCity.living || 0) < (baselineCity.living || 0) ? "text-orange-500 font-bold" : "text-slate-500"}`}>
                                    -€{(displayCity.living || 0).toLocaleString()}
                                </span>
                            </div>

                            {/* Kept Row */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3.5 bg-white/20">
                                <span className="font-mono text-center font-bold text-orange-600 text-[13px]">€{(baselineCity.savings[roleKey] || 0).toLocaleString()}</span>
                                <span className="font-sans font-bold uppercase tracking-widest text-orange-500 text-[9px] w-14 text-center drop-shadow-sm">Kept</span>
                                <span className={`font-mono text-center font-bold text-[13px] ${(displayCity.savings[roleKey] || 0) > (baselineCity.savings[roleKey] || 0) ? "text-orange-500" : "text-slate-600"}`}>
                                    €{(displayCity.savings[roleKey] || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Total Summary */}
                        <div className="bg-white/70 border border-white p-4 py-5 shadow-sm flex items-center justify-between px-6 rounded-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-600 z-10">Swap Delta</p>
                            <p className={`font-mono text-2xl font-bold tracking-tight z-10 ${((displayCity.savings[roleKey] || 0) - (baselineCity.savings[roleKey] || 0)) > 0 ? "text-orange-500" : "text-slate-500"}`}>
                                {((displayCity.savings[roleKey] || 0) - (baselineCity.savings[roleKey] || 0)) > 0 ? '+' : ''}
                                {((displayCity.savings[roleKey] || 0) - (baselineCity.savings[roleKey] || 0)) < 0 ? '-' : ''}
                                €{Math.abs((displayCity.savings[roleKey] || 0) - (baselineCity.savings[roleKey] || 0)).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
