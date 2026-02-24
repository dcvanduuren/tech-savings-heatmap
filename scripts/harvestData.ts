import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { calculateNetSalary } from '../utils/taxEngine';

// Force load the .env.local file so our Supabase client works via raw Node execution
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Re-initialize local client just for the script environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 5 CORE TECH HUBS ---
const TARGET_CITIES = [
    { name: 'London', slug: 'london', lat: 51.5074, lng: -0.1278, sunshine: 1633 },
    { name: 'Berlin', slug: 'berlin', lat: 52.5200, lng: 13.4050, sunshine: 1626 },
    { name: 'Amsterdam', slug: 'amsterdam', lat: 52.3676, lng: 4.9041, sunshine: 1662 },
    { name: 'Madrid', slug: 'madrid', lat: 40.4168, lng: -3.7038, sunshine: 2769 },
    { name: 'Warsaw', slug: 'warsaw', lat: 52.2297, lng: 21.0122, sunshine: 1573 }
];

async function harvestData() {
    console.log('🚀 Starting Data Harvest from Teleport API...');

    for (const city of TARGET_CITIES) {
        console.log(`\n⏳ Fetching data for ${city.name} (${city.slug})...`);

        try {
            // 1. Fetch Salary Data
            const salaryRes = await fetch(`https://api.teleport.org/api/urban_areas/slug:${city.slug}/salaries/`);
            const salaryData = await salaryRes.json();

            const swEngSalaryNode = salaryData.salaries.find((s: any) => s.job.id === 'SOFTWARE-ENGINEER');
            if (!swEngSalaryNode) throw new Error('Salary data for SOFTWARE-ENGINEER not found.');

            const annualGrossUSD = swEngSalaryNode.salary_percentiles.percentile_50;
            const annualGrossEUR = annualGrossUSD * 0.92; // Rough static conversion proxy
            const monthlyGross = annualGrossEUR / 12;

            // 2. Fetch Cost Data
            const costRes = await fetch(`https://api.teleport.org/api/urban_areas/slug:${city.slug}/details/`);
            const costData = await costRes.json();

            const housingCat = costData.categories.find((c: any) => c.id === 'HOUSING');
            const livingCat = costData.categories.find((c: any) => c.id === 'COST-OF-LIVING');

            // Rent: Use 'Apartment (1 bedroom) in City Centre'
            const rentNode = housingCat.data.find((d: any) => d.id === 'RENT-INDEX-CITY-CENTER');
            const monthlyRentUSD = rentNode ? rentNode.currency_dollar_value : 1000;
            const monthlyRent = Math.round(monthlyRentUSD * 0.92);

            // Living: Proxy baseline living off the generalized indices (very simplified proxy for script demo)
            // We'll aggregate a few daily costs to approximate a month or just use a baseline.
            const lunchNode = livingCat.data.find((d: any) => d.id === 'COST-RESTAURANT-MEAL');
            const ticketNode = livingCat.data.find((d: any) => d.id === 'COST-PUBLIC-TRANSPORT');
            const dailyCostProxy = ((lunchNode?.currency_dollar_value || 15) * 2) + (ticketNode?.currency_dollar_value || 3);
            const monthlyLiving = Math.round((dailyCostProxy * 30) * 0.92);

            // 3. Process Tax Engine
            const monthlyNet = calculateNetSalary(monthlyGross, city.name);

            // 4. Calculate Final Composite
            const savings = Math.max(0, monthlyNet - monthlyRent - monthlyLiving);

            // 5. Package for Supabase
            const payload = {
                name: city.name,
                lat: city.lat,
                lng: city.lng,
                salary_gross: Math.round(monthlyGross),
                salary_net: monthlyNet,
                rent: monthlyRent,
                living: monthlyLiving,
                savings: savings,
                sunshine: city.sunshine
            };

            // 6. Upsert to Supabase
            const { error } = await supabase
                .from('cities')
                .upsert(payload, { onConflict: 'name' });

            if (error) throw error;

            console.log(`✅ Upserted ${city.name}: Gross: €${Math.round(monthlyGross)} | Net: €${monthlyNet} | Rent: €${monthlyRent} | Living: €${monthlyLiving} | Savings: €${savings}`);

        } catch (err: any) {
            console.error(`❌ Failed processing ${city.name}:`, err.message);
        }
    }

    console.log('\n🏁 Data harvest complete!');
}

harvestData();
