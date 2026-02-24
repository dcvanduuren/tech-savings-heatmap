import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { seedCities } from '../data/seedCities';
import { calculateNetSalary } from '../utils/taxEngine';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
    console.log('Starting Supabase Seeding Process...');

    for (const city of seedCities) {
        const salaries_net: Record<string, number> = {};
        const savings: Record<string, number> = {};

        let totalGross = 0;
        let count = 0;

        // For every key in our 15x combination matrix, let's run the Progressive Tax Engine
        for (const [roleVariant, grossIncome] of Object.entries(city.salaries_gross)) {
            const netIncome = calculateNetSalary(grossIncome, city.name);

            salaries_net[roleVariant] = netIncome;
            savings[roleVariant] = netIncome - city.rent - city.living;

            totalGross += grossIncome;
            count += 1;
        }

        // Add the average_average combination
        if (count > 0) {
            const averageGross = Math.round(totalGross / count);
            const averageNet = calculateNetSalary(averageGross, city.name);
            (city.salaries_gross as any)['average_average'] = averageGross;
            salaries_net['average_average'] = averageNet;
            savings['average_average'] = averageNet - city.rent - city.living;
        }

        const payload = {
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            rent: city.rent,
            living: city.living,
            sunshine: city.sunshine,
            salaries_gross: city.salaries_gross, // JSONB
            salaries_net: salaries_net,         // JSONB Computed
            savings: savings                    // JSONB Computed
        };

        // Upsert by name so we update existing rows rather than throwing duplicate errors
        const { error } = await supabase.from('cities').upsert(payload, { onConflict: 'name' });

        if (error) {
            console.error(`Error uploading ${city.name}:`, error.message);
        } else {
            console.log(`Successfully processed and uploaded ${city.name}`);
        }
    }

    console.log('Finished. All 15 Hubs populated securely.');
}

seedDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
});
