import { useState, useMemo } from 'react';
import { CityData } from '../types/city';

export type FilterState = {
    minNet: string;
    maxNet: string;
    minRent: string;
    maxRent: string;
    minLiving: string;
    maxLiving: string;
    minKept: string;
    maxKept: string;
    minSunshine: string;
};

/**
 * useMapScale Hook
 * 
 * Takes adjustedCities and active filters to calculate the resulting visible subset.
 * Dynamically computes minSavings and maxSavings bounds specifically for the visible elements,
 * enabling seamless Relative Color Scaling visually on the heatmap.
 */
export function useMapScale(adjustedCities: CityData[], isNomadMode: boolean, arbitrageMode: 'work' | 'home', roleKey: string) {
    const [filters, setFilters] = useState<FilterState>({
        minNet: '', maxNet: '',
        minRent: '', maxRent: '',
        minLiving: '', maxLiving: '',
        minKept: '', maxKept: '',
        minSunshine: ''
    });

    const { minSavings, maxSavings, visibleCities } = useMemo(() => {
        const isSunshineFilterActive = isNomadMode && arbitrageMode === 'work' && filters.minSunshine !== '';

        const filteredCities = adjustedCities.filter(city => {
            return (
                (filters.minNet === '' || city.salaryNet[roleKey] >= Number(filters.minNet)) &&
                (filters.maxNet === '' || city.salaryNet[roleKey] <= Number(filters.maxNet)) &&
                (filters.minRent === '' || city.rent >= Number(filters.minRent)) &&
                (filters.maxRent === '' || city.rent <= Number(filters.maxRent)) &&
                (filters.minLiving === '' || city.living >= Number(filters.minLiving)) &&
                (filters.maxLiving === '' || city.living <= Number(filters.maxLiving)) &&
                (filters.minKept === '' || city.savings[roleKey] >= Number(filters.minKept)) &&
                (filters.maxKept === '' || city.savings[roleKey] <= Number(filters.maxKept)) &&
                (!isSunshineFilterActive || city.sunshine >= Number(filters.minSunshine))
            );
        });

        let min = Infinity;
        let max = -Infinity;

        for (const city of filteredCities) {
            if (city.savings[roleKey] < min) min = city.savings[roleKey];
            if (city.savings[roleKey] > max) max = city.savings[roleKey];
        }

        return {
            minSavings: min === Infinity ? 0 : min,
            maxSavings: max === -Infinity ? 0 : max,
            visibleCities: filteredCities
        };
    }, [adjustedCities, filters, isNomadMode, arbitrageMode, roleKey]);

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minNet: '', maxNet: '',
            minRent: '', maxRent: '',
            minLiving: '', maxLiving: '',
            minKept: '', maxKept: '',
            minSunshine: ''
        });
    };

    return {
        filters,
        updateFilter,
        clearFilters,
        minSavings,
        maxSavings,
        visibleCities
    };
}
