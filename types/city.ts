export type CityData = {
    name: string;
    lat: number;
    lng: number;
    salaryGross: Record<string, number>;
    salaryNet: Record<string, number>;
    rent: number;
    living: number;
    savings: Record<string, number>; // calculated as: salaryNet[role] - rent - living
    sunshine: number; // annual sunshine hours
    isArbitrageBase?: boolean;
};
