import React, { memo } from 'react';
import { Marker } from '@vis.gl/react-mapbox';
import { CityData } from '../../types/city';
import { getDynamicColors } from '../../utils/colorScales';

export type CityMarkerProps = {
    city: CityData;
    baselineCity: CityData;
    minSavings: number;
    maxSavings: number;
    visibleCount: number;
    passesFilter: boolean;
    dataPointOpacity: number;
    glowScale: number;
    isInteractive: boolean;
    isHovered: boolean;
    isNomadMode: boolean;
    arbitrationCityId: string;
    roleKey: string;
};

export const CityMarker = memo(function CityMarker({
    city,
    baselineCity,
    minSavings,
    maxSavings,
    visibleCount,
    passesFilter,
    dataPointOpacity,
    glowScale,
    isInteractive,
    isHovered,
    isNomadMode,
    arbitrationCityId,
    roleKey
}: CityMarkerProps) {
    const savingsVal = city.savings[roleKey] || 0;
    const baselineSavingsVal = baselineCity.savings[roleKey] || 0;

    const isBaseline = city.name === baselineCity.name;
    const difference = savingsVal - baselineSavingsVal;
    const diffColorClass = difference > 0 ? "text-orange-500" : difference < 0 ? "text-slate-400" : "text-slate-300";

    const isLivingBeyondMeans = savingsVal < 0;

    const baseColors = getDynamicColors(
        savingsVal,
        minSavings,
        maxSavings,
        visibleCount
    );

    const isAnchor = city.isArbitrageBase;
    const colors = {
        core: isAnchor ? '#334155' : baseColors.core,
        glow: isAnchor ? 'radial-gradient(circle, rgba(51, 65, 85, 0.45) 0%, rgba(51, 65, 85, 0) 70%)' : baseColors.glow,
        glowMultiplier: isAnchor ? 1 : (baseColors.glowMultiplier ?? 1)
    };

    return (
        <Marker longitude={city.lng} latitude={city.lat} anchor="center">
            <div
                className="relative flex h-32 w-32 items-center justify-center transition-opacity duration-300"
                style={{
                    opacity: passesFilter ? 1 : 0,
                    pointerEvents: 'none'
                }}
            >
                <div
                    className="animate-glow-pulse absolute inset-0 h-32 w-32 rounded-full transition-transform duration-500 ease-out"
                    style={{
                        background: colors.glow,
                        transform: `scale(${glowScale * colors.glowMultiplier})`,
                        mixBlendMode: 'multiply',
                        transition: 'background 0.5s ease, transform 0.5s ease-out'
                    }}
                    aria-hidden
                />

                <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center transition-all duration-300 ${isHovered ? 'scale-125' : ''}`}
                    style={{
                        opacity: passesFilter ? dataPointOpacity : 0,
                        pointerEvents: isInteractive ? 'auto' : 'none'
                    }}
                >
                    <div
                        className={`flex h-3 w-3 items-center justify-center rounded-full border-2 border-white/90 shadow-md ${isBaseline ? 'animate-pulse' : ''}`}
                        style={{
                            backgroundColor: colors.core,
                            transition: 'background-color 0.5s ease'
                        }}
                    >
                        {city.isArbitrageBase && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-1.5 w-1.5 text-white shadow-sm">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>

                    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl transition-opacity whitespace-nowrap text-sm z-50 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="font-sans font-medium">{city.name}: </span>
                        <span className={`font-mono font-bold ${diffColorClass}`}>
                            {isNomadMode && arbitrationCityId ? (
                                city.isArbitrageBase ? "Anchor City" : `Total Monthly Kept: €${savingsVal.toLocaleString()}`
                            ) : (
                                isBaseline ? "Baseline" : difference === 0 ? "€0" : `${difference > 0 ? '+' : '-'}€${Math.abs(difference).toLocaleString()}`
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </Marker>
    );
});
