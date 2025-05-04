import axios from 'axios';

export interface Country {
  code: string;
  name: string;
}

let countriesCache: Country[] | null = null;

export const fetchCountries = async (): Promise<Country[]> => {
  if (countriesCache) {
    return countriesCache;
  }

  try {
    console.log('Fetching countries from API...');
    const response = await axios.get('https://restcountries.com/v3.1/all');
    console.log('API Response:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid API response format');
    }

    const countries = response.data
      .map((country: any) => {
        if (!country.cca2 || !country.name?.common) {
          console.warn('Invalid country data:', country);
          return null;
        }
        return {
          code: country.cca2,
          name: country.name.common
        };
      })
      .filter((country: Country | null): country is Country => country !== null)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    
    console.log('Formatted countries:', countries);
    countriesCache = countries;
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return a basic list of countries as fallback
    return [
      { code: 'SA', name: 'Saudi Arabia' },
      { code: 'AE', name: 'United Arab Emirates' },
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'IN', name: 'India' },
      { code: 'CN', name: 'China' },
      { code: 'JP', name: 'Japan' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'IT', name: 'Italy' }
    ];
  }
};

export const formatCountryOptions = (countries: Country[]) => {
  const options = countries.map(country => ({
    label: country.name,
    value: country.code
  }));
  console.log('Formatted country options:', options);
  return options;
}; 