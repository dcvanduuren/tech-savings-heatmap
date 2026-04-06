import { CityData } from '../types/city';
import { calculateNetSalary } from './taxEngine';

const TRUST_THRESHOLD = 10;
const TOLERANCE_C = 0.5;

export function getBlendedCityData(city: CityData, submissions: any[]): CityData {
    const citySubmissions = submissions.filter(s => s.city_name.toLowerCase() === city.name.toLowerCase());
    const communityCounts: Record<string, number> = {};
    const blendedGross: Record<string, number> = { ...city.salaryGross };

    let blendedRent = city.rent;

    // Rent Blending
    if (citySubmissions.length > 0) {
        let rentSum = 0;
        let rentWeightSum = 0;
        const seedRent = city.rent;

        citySubmissions.forEach(sub => {
            const subRent = Number(sub.rent);
            if (!isNaN(subRent) && subRent > 0) {
                const deviation = Math.abs(subRent - seedRent) / (seedRent || 1);
                const weight = Math.exp(-Math.pow(deviation, 2) / (2 * Math.pow(TOLERANCE_C, 2)));
                rentSum += subRent * weight;
                rentWeightSum += weight;
            }
        });

        if (rentWeightSum > 0) {
            const weightedAvgRent = rentSum / rentWeightSum;
            const volumeWeight = Math.min(citySubmissions.length / TRUST_THRESHOLD, 1.0);
            blendedRent = Math.round((weightedAvgRent * volumeWeight) + (seedRent * (1 - volumeWeight)));
        }
    }

    // Role Blending
    for (const roleKey of Object.keys(city.salaryGross)) {
        if (roleKey === 'average_average') continue;

        const lastUnderscore = roleKey.lastIndexOf('_');
        if (lastUnderscore === -1) continue;

        const role = roleKey.substring(0, lastUnderscore);
        const level = roleKey.substring(lastUnderscore + 1);

        const roleSubmissions = citySubmissions.filter(s => s.role === role && s.experience_level === level);
        communityCounts[roleKey] = roleSubmissions.length;

        if (roleSubmissions.length > 0) {
            let grossSum = 0;
            let weightSum = 0;
            const seedGross = city.salaryGross[roleKey];

            roleSubmissions.forEach(sub => {
                const subGross = Number(sub.gross_salary);
                if (!isNaN(subGross) && subGross > 0) {
                    const deviation = Math.abs(subGross - seedGross) / (seedGross || 1);
                    const weight = Math.exp(-Math.pow(deviation, 2) / (2 * Math.pow(TOLERANCE_C, 2)));
                    grossSum += subGross * weight;
                    weightSum += weight;
                }
            });

            if (weightSum > 0) {
                const weightedAvgGross = grossSum / weightSum;
                const volumeWeight = Math.min(roleSubmissions.length / TRUST_THRESHOLD, 1.0);
                blendedGross[roleKey] = Math.round((weightedAvgGross * volumeWeight) + (seedGross * (1 - volumeWeight)));
            }
        } else {
            communityCounts[roleKey] = 0;
        }
    }

    // Recalculate 'average_average'
    let totalGross = 0;
    let count = 0;
    for (const [key, value] of Object.entries(blendedGross)) {
        if (key !== 'average_average') {
            totalGross += value;
            count += 1;
        }
    }
    if (count > 0) {
        blendedGross['average_average'] = Math.round(totalGross / count);
    }

    communityCounts['average_average'] = citySubmissions.length;

    // Recalculate NET and SAVINGS map natively
    const blendedNet: Record<string, number> = {};
    const blendedSavings: Record<string, number> = {};

    for (const [roleKey, gross] of Object.entries(blendedGross)) {
        const net = calculateNetSalary(gross, city.name);
        blendedNet[roleKey] = net;
        blendedSavings[roleKey] = net - blendedRent - city.living;
    }

    return {
        ...city,
        rent: blendedRent,
        salaryGross: blendedGross,
        salaryNet: blendedNet,
        savings: blendedSavings,
        communityCounts
    };
}
