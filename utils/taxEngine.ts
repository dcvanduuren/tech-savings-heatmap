/**
 * Calculate the estimated net monthly salary from a gross monthly salary 
 * based on localized progressive tax brackets for tech workers.
 *
 * @param monthlyGross - The monthly gross salary (assumed to be in EUR for inputs, unless city is UK where EUR is converted internally).
 * @param cityName - The name of the city to apply the specific proxy rules for.
 * @returns The rounded monthly net take-home pay.
 */
export function calculateNetSalary(monthlyGross: number, cityName: string): number {
    const annualGross = monthlyGross * 12;
    const normalizedCity = cityName.toLowerCase().trim();

    let annualNet = 0;

    switch (normalizedCity) {
        case 'london': {
            // --- LONDON (UK) ---
            // 1 GBP = ~1.17 EUR (Static estimate for modeling)
            const exchangeRate = 1.17;
            const annualGrossGBP = annualGross / exchangeRate;

            let taxGBP = 0;
            const personalAllowance = 12570;

            // Basic Rate (20%)
            if (annualGrossGBP > personalAllowance) {
                const basicTaxable = Math.min(annualGrossGBP, 50270) - personalAllowance;
                taxGBP += basicTaxable * 0.20;
            }

            // Higher Rate (40%)
            if (annualGrossGBP > 50270) {
                const higherTaxable = Math.min(annualGrossGBP, 125140) - 50270;
                taxGBP += higherTaxable * 0.40;
            }

            // Additional Rate (45%)
            if (annualGrossGBP > 125140) {
                const additionalTaxable = annualGrossGBP - 125140;
                taxGBP += additionalTaxable * 0.45;
            }

            // National Insurance Proxy (~8% above allowance for high earners)
            let niGBP = 0;
            if (annualGrossGBP > personalAllowance) {
                niGBP = (annualGrossGBP - personalAllowance) * 0.08;
            }

            const annualNetGBP = annualGrossGBP - taxGBP - niGBP;
            annualNet = annualNetGBP * exchangeRate; // Convert back to EUR
            break;
        }

        case 'berlin':
        case 'munich': {
            // --- GERMANY ---
            // Simplified Tax Class 1 (Single)
            let taxEUR = 0;
            const allowance = 11604;

            // Tax blocks
            if (annualGross > allowance) {
                const middleTaxable = Math.min(annualGross, 66760) - allowance;
                taxEUR += middleTaxable * 0.24; // Progressive proxy avg
            }
            if (annualGross > 66760) {
                const higherTaxable = Math.min(annualGross, 277825) - 66760;
                taxEUR += higherTaxable * 0.42;
            }
            if (annualGross > 277825) {
                // Reichensteuer (wealth tax)
                const topTaxable = annualGross - 277825;
                taxEUR += topTaxable * 0.45;
            }

            // Social Security (Health, Pension, Unemployment) - Capped roughly around 20%
            const socialSecEUR = annualGross * 0.20;

            annualNet = annualGross - taxEUR - socialSecEUR;
            break;
        }

        case 'amsterdam': {
            // --- NETHERLANDS ---
            // 30% Ruling Proxy for expats
            const taxFreePortion = annualGross * 0.30;
            const taxableGross = annualGross * 0.70;

            let taxEUR = 0;

            // Box 1 standard brackets
            const bracket1Limit = 75518;

            if (taxableGross <= bracket1Limit) {
                taxEUR = taxableGross * 0.3697;
            } else {
                taxEUR = (bracket1Limit * 0.3697) + ((taxableGross - bracket1Limit) * 0.4950);
            }

            annualNet = annualGross - taxEUR; // Total gross minus the tax on the 70% portion
            break;
        }

        case 'madrid':
        case 'barcelona': {
            // --- SPAIN ---
            // Beckham Law Proxy (Flat 24% up to 600k)
            const taxEUR = annualGross * 0.24;
            annualNet = annualGross - taxEUR;
            break;
        }

        case 'warsaw': {
            // --- POLAND ---
            // B2B Contract Proxy
            // Flat 12% income tax + ~€500/mo (€6000/yr) flat health/ZUS equivalent
            const taxEUR = annualGross * 0.12;
            const socialEUR = 6000;

            annualNet = annualGross - taxEUR - socialEUR;
            break;
        }

        default: {
            // --- DEFAULT EUROPEAN AVERAGE ---
            // 35% effective drop off
            annualNet = annualGross * 0.65;
            break;
        }
    }

    // Ensure we don't return negative salaries due to fixed deductibles (e.g. Poland flat fee on 0 income)
    const monthlyNet = Math.max(0, annualNet / 12);

    return Math.round(monthlyNet);
}

export type TaxBreakdownItem = {
    label: string;
    amount: number;
};

export function getTaxBreakdown(monthlyGross: number, cityName: string): TaxBreakdownItem[] {
    const annualGross = monthlyGross * 12;
    const normalizedCity = cityName.toLowerCase().trim();
    const breakdown: TaxBreakdownItem[] = [];

    switch (normalizedCity) {
        case 'london': {
            const exchangeRate = 1.17;
            const annualGrossGBP = annualGross / exchangeRate;
            let taxGBP = 0;
            const personalAllowance = 12570;

            if (annualGrossGBP > personalAllowance) {
                taxGBP += (Math.min(annualGrossGBP, 50270) - personalAllowance) * 0.20;
            }
            if (annualGrossGBP > 50270) {
                taxGBP += (Math.min(annualGrossGBP, 125140) - 50270) * 0.40;
            }
            if (annualGrossGBP > 125140) {
                taxGBP += (annualGrossGBP - 125140) * 0.45;
            }

            let niGBP = 0;
            if (annualGrossGBP > personalAllowance) {
                niGBP = (annualGrossGBP - personalAllowance) * 0.08;
            }

            if (taxGBP > 0) breakdown.push({ label: 'UK Income Tax', amount: Math.round((taxGBP * exchangeRate) / 12) });
            if (niGBP > 0) breakdown.push({ label: 'National Insurance', amount: Math.round((niGBP * exchangeRate) / 12) });
            break;
        }
        case 'berlin':
        case 'munich': {
            let taxEUR = 0;
            const allowance = 11604;
            if (annualGross > allowance) {
                taxEUR += (Math.min(annualGross, 66760) - allowance) * 0.24;
            }
            if (annualGross > 66760) {
                taxEUR += (Math.min(annualGross, 277825) - 66760) * 0.42;
            }
            if (annualGross > 277825) {
                taxEUR += (annualGross - 277825) * 0.45;
            }

            const socialSecEUR = annualGross * 0.20;

            if (taxEUR > 0) breakdown.push({ label: 'German Income Tax', amount: Math.round(taxEUR / 12) });
            if (socialSecEUR > 0) breakdown.push({ label: 'Social Security', amount: Math.round(socialSecEUR / 12) });
            break;
        }
        case 'amsterdam': {
            const taxableGross = annualGross * 0.70;
            let taxEUR = 0;
            const bracket1Limit = 75518;

            if (taxableGross <= bracket1Limit) {
                taxEUR = taxableGross * 0.3697;
            } else {
                taxEUR = (bracket1Limit * 0.3697) + ((taxableGross - bracket1Limit) * 0.4950);
            }

            breakdown.push({ label: '30% Ruling Benefit', amount: 0 }); // Informational
            if (taxEUR > 0) breakdown.push({ label: 'Dutch Income Tax', amount: Math.round(taxEUR / 12) });
            break;
        }
        case 'madrid':
        case 'barcelona': {
            const taxEUR = annualGross * 0.24;
            if (taxEUR > 0) breakdown.push({ label: 'Beckham Law Tax (Flat 24%)', amount: Math.round(taxEUR / 12) });
            break;
        }
        case 'warsaw': {
            const taxEUR = annualGross * 0.12;
            const socialEUR = 6000;
            if (taxEUR > 0) breakdown.push({ label: 'B2B Flat Income Tax', amount: Math.round(taxEUR / 12) });
            if (socialEUR > 0) breakdown.push({ label: 'ZUS & Health Contrib.', amount: Math.round(socialEUR / 12) });
            break;
        }
        default: {
            const taxEUR = annualGross * 0.35;
            if (taxEUR > 0) breakdown.push({ label: 'Estimated Euro Tax', amount: Math.round(taxEUR / 12) });
            break;
        }
    }

    return breakdown;
}
