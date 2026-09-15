export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
  };
  month: {
    number: number;
    en: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

export interface TimingsResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      timestamp: string;
      gregorian: GregorianDate;
      hijri: HijriDate;
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: Record<string, number>;
        location: {
          latitude: number;
          longitude: number;
        };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: Record<string, number>;
    };
  };
}

const BASE_URL = 'https://api.aladhan.com/v1';

export async function getTimings(
  date: Date,
  coords: Coordinates,
  method: number = 2, // ISNA by default, user can change in settings
  school: number = 0 // Shafi by default, user can change to 1 for Hanafi
): Promise<TimingsResponse['data'] | null> {
  try {
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const url = new URL(`${BASE_URL}/timings/${formattedDate}`);
    url.searchParams.append('latitude', coords.latitude.toString());
    url.searchParams.append('longitude', coords.longitude.toString());
    url.searchParams.append('method', method.toString());
    url.searchParams.append('school', school.toString());

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.statusText}`);
    }

    const json = (await response.json()) as TimingsResponse;
    return json.data;
  } catch (error) {
    console.error('Error fetching prayer timings:', error);
    return null;
  }
}

export async function getQibla(coords: Coordinates): Promise<{ direction: number } | null> {
  try {
    const url = new URL(`${BASE_URL}/qibla/${coords.latitude}/${coords.longitude}`);
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 * 30 }, // Qibla direction doesn't change often, cache for 30 days
    });

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching Qibla direction:', error);
    return null;
  }
}
