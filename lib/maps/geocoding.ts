export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Geocode an address to get latitude and longitude coordinates
 * Uses the Google Maps Geocoding API
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key not found");
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    } else {
      console.error("Geocoding failed:", data.status);
      return null;
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get an address
 * Uses the Google Maps Geocoding API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key not found");
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.error("Reverse geocoding failed:", data.status);
      return null;
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}
