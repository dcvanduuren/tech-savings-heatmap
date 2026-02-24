import { HomeClient } from '../components/home/HomeClient';
import { supabase } from '../utils/supabase';
import { CityData } from '../types/city';

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  let initialCities: CityData[] = [];

  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*');

    if (error) {
      console.error('Error fetching cities from Supabase:', error);
    } else if (data) {
      // Map back to camelCase and handle JSONB records
      initialCities = data.map((row: any) => ({
        name: row.name,
        lat: row.lat,
        lng: row.lng,
        salaryGross: row.salaries_gross || {},
        salaryNet: row.salaries_net || {},
        rent: row.rent,
        living: row.living,
        savings: row.savings || {},
        sunshine: row.sunshine
      }));
    }
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err);
  }

  return <HomeClient initialCities={initialCities} />;
}
