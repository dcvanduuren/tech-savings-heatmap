import React, { useState } from 'react';
import { FilterState } from '../../hooks/useMapScale';

export type FilterBarProps = {
    filters: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    clearFilters: () => void;
    isNomadMode: boolean;
    arbitrageMode: 'work' | 'home';
};

export function FilterBar({
    filters,
    updateFilter,
    clearFilters,
    isNomadMode,
    arbitrageMode
}: FilterBarProps) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    return (
        <div className="w-full flex-shrink-0">
            <div
                className="flex justify-between items-center mb-4 cursor-pointer group"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Advanced Filters</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                {isFiltersOpen && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            clearFilters();
                        }}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className={`space-y-4 transition-all duration-500 overflow-hidden ${isFiltersOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Net Salary */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Net Salary (€)</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.minNet} onChange={(e) => updateFilter('minNet', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                        <input type="number" placeholder="Max" value={filters.maxNet} onChange={(e) => updateFilter('maxNet', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                    </div>
                </div>

                {/* 1BR Rent */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1BR Rent (€)</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.minRent} onChange={(e) => updateFilter('minRent', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                        <input type="number" placeholder="Max" value={filters.maxRent} onChange={(e) => updateFilter('maxRent', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                    </div>
                </div>

                {/* Living Costs */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Living Costs (€)</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.minLiving} onChange={(e) => updateFilter('minLiving', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                        <input type="number" placeholder="Max" value={filters.maxLiving} onChange={(e) => updateFilter('maxLiving', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                    </div>
                </div>

                {/* Monthly Kept */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Kept (€)</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.minKept} onChange={(e) => updateFilter('minKept', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                        <input type="number" placeholder="Max" value={filters.maxKept} onChange={(e) => updateFilter('maxKept', e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all" />
                    </div>
                </div>

                {/* Sunshine Filter */}
                {isNomadMode && arbitrageMode === 'work' && (
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Sunshine</label>
                            <span className="text-xs font-mono font-bold text-slate-900 bg-black/5 px-2 py-0.5 rounded">
                                Min {filters.minSunshine || '0'}h
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="3000"
                            step="100"
                            value={filters.minSunshine || '0'}
                            onChange={(e) => updateFilter('minSunshine', e.target.value)}
                            className="w-full h-2 bg-slate-400/30 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                            <span>Low</span>
                            <span>1500h</span>
                            <span>High</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
