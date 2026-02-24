import { useState, useMemo } from 'react';
import { CityData } from '../types/city';

/**
 * useArbitrage Hook
 * 
 * Handles 'Work' vs 'Home' baselines, Anchor City selection, and 'Composite Savings' math.
 * Transforms the static city data into composite 'Adjusted' profiles based on the Nomad Mode setup.
 */
export function useArbitrage(initialCities: CityData[], roleKey: string) {
    const [isNomadMode, setIsNomadMode] = useState(false);
    const [arbitrageMode, setArbitrageMode] = useState<'work' | 'home'>('work');
    const [arbitrationCityId, setArbitrationCityId] = useState<string>('');

    const adjustedCities = useMemo(() => {
        // If Nomad Mode is off, return standard fetched cities
        if (!isNomadMode || !arbitrationCityId) return initialCities.map(c => ({ ...c, isArbitrageBase: false }));

        const anchorCity = initialCities.find(c => c.name === arbitrationCityId);
        if (!anchorCity) return initialCities.map(c => ({ ...c, isArbitrageBase: false }));

        return initialCities.map(candidate => {
            const isAnchor = candidate.name === anchorCity.name;

            if (arbitrageMode === 'work') {
                // Work Baseline (Geo-Arbitrage): Earning from Anchor, living in Candidate
                const compositeSavings = anchorCity.salaryNet[roleKey] - candidate.rent - candidate.living;

                // Keep the JSONB objects intact, but overwrite the active key for the map's current view
                return {
                    ...candidate,
                    savings: { ...candidate.savings, [roleKey]: compositeSavings },
                    isArbitrageBase: isAnchor
                };
            } else {
                // Home Baseline (Digital Nomad): Earning from Candidate, living in Anchor
                const compositeSavings = candidate.salaryNet[roleKey] - anchorCity.rent - anchorCity.living;
                return {
                    ...candidate,
                    rent: anchorCity.rent,
                    living: anchorCity.living,
                    savings: { ...candidate.savings, [roleKey]: compositeSavings },
                    isArbitrageBase: isAnchor
                };
            }
        });
    }, [initialCities, arbitrationCityId, arbitrageMode, isNomadMode, roleKey]);

    return {
        isNomadMode,
        setIsNomadMode,
        arbitrageMode,
        setArbitrageMode,
        arbitrationCityId,
        setArbitrationCityId,
        adjustedCities
    };
}
