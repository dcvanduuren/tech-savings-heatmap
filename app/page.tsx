import { HomeClient } from '../components/home/HomeClient';
import { supabase } from '../utils/supabase';
import { CityData } from '../types/city';
import { getBlendedCityData } from '../utils/dataBlending';

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  let initialCities: CityData[] = [];

  try {
    const { data: cityData } = await supabase.from('cities').select('*');
    const { data: subData } = await supabase.from('user_submissions').select('*');

    if (cityData) {
      initialCities = cityData.map((row: any) => {
        const city: CityData = {
          name: row.name,
          lat: row.lat,
          lng: row.lng,
          salaryGross: row.salaries_gross || {},
          salaryNet: row.salaries_net || {},
          rent: row.rent,
          living: row.living,
          savings: row.savings || {},
          sunshine: row.sunshine
        };

        return (subData && subData.length > 0) ? getBlendedCityData(city, subData) : city;
      });
    }
  } catch (err) {
    // Graceful silent fallback per Clean House mandate
  }

  return <HomeClient initialCities={initialCities} />;
}
