import React from 'react';
import { MOCK_CITIES } from '../../data/mockCities';

export type NomadPanelProps = {
    isNomadMode: boolean;
    setIsNomadMode: (mode: boolean) => void;
    arbitrageMode: 'work' | 'home';
    setArbitrageMode: (mode: 'work' | 'home') => void;
    arbitrationCityId: string;
    setArbitrationCityId: (id: string) => void;
};

export function NomadPanel({
    isNomadMode,
    setIsNomadMode,
    arbitrageMode,
    setArbitrageMode,
    arbitrationCityId,
    setArbitrationCityId
}: NomadPanelProps) {
    return (
        <div className="w-full flex-shrink-0 space-y-6">
            <h2 className="text-xl font-sans font-bold text-slate-800 border-b border-black/10 pb-2">Arbitrage Config</h2>

            <div className="space-y-6">
                {/* Go Nomad Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Go Nomad</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Unlock geographic arbitrage.</p>
                    </div>
                    <button
                        onClick={() => setIsNomadMode(!isNomadMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isNomadMode ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-slate-300/50'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNomadMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {isNomadMode && (
                    <div className="space-y-4 pt-2">
                        {/* Segmented Control */}
                        <div className="flex rounded-xl bg-white/40 border border-white/50 p-1">
                            <button
                                onClick={() => setArbitrageMode('work')}
                                className={`flex-1 rounded-lg py-2 text-[11px] uppercase tracking-wider font-bold transition-all ${arbitrageMode === 'work' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Work Base
                            </button>
                            <button
                                onClick={() => setArbitrageMode('home')}
                                className={`flex-1 rounded-lg py-2 text-[11px] uppercase tracking-wider font-bold transition-all ${arbitrageMode === 'home' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Home Base
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
                                    className="w-full appearance-none bg-white/40 border border-white/50 rounded-lg px-4 py-3 font-sans font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all cursor-pointer pr-10"
                                >
                                    <option value="">None (Default Baseline)</option>
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
                            <div className="bg-orange-500/5 rounded-xl p-4 border border-orange-500/20">
                                <p className="text-xs font-medium text-orange-800 leading-relaxed">
                                    {arbitrageMode === 'work'
                                        ? `Showing how much you keep if you earn ${arbitrationCityId}'s actual salary (€${MOCK_CITIES.find(c => c.name === arbitrationCityId)?.salaryNet.toLocaleString()} net) but pay local expenses.`
                                        : `Showing how much you keep if you pay ${arbitrationCityId}'s actual expenses (€${((MOCK_CITIES.find(c => c.name === arbitrationCityId)?.rent ?? 0) + (MOCK_CITIES.find(c => c.name === arbitrationCityId)?.living ?? 0)).toLocaleString()} total) but earn local salaries.`}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
