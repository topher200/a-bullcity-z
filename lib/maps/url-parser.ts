/**
 * Extract Place ID from various Google Maps URL formats
 * Supports:
 * - https://www.google.com/maps/place/?q=place_id:ChIJ...
 * - https://www.google.com/maps/place/Place+Name/@lat,lng,zoom/data=...
 * - https://maps.google.com/?q=lat,lng
 * - https://www.google.com/maps/search/?api=1&query=lat,lng
 * - https://www.google.com/maps/place/Place+Name/data=!4m2!3m1!1sPLACE_ID
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Format 1: ?q=place_id:ChIJ...
    const qParam = urlObj.searchParams.get("q");
    if (qParam?.startsWith("place_id:")) {
      return qParam.replace("place_id:", "");
    }

    // Format 2: /place/Place+Name/data=!4m2!3m1!1sPLACE_ID
    const pathMatch = urlObj.pathname.match(/\/place\/[^/]+\/data=.*!1s([^!]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Format 3: Check for place_id in data parameter
    const dataParam = urlObj.searchParams.get("data");
    if (dataParam) {
      const placeIdMatch = dataParam.match(/!1s([^!]+)/);
      if (placeIdMatch) {
        return placeIdMatch[1];
      }
    }

    // Format 4: Check for place_id in the URL hash/fragment
    if (urlObj.hash) {
      const hashPlaceIdMatch = urlObj.hash.match(/!1s([^!]+)/);
      if (hashPlaceIdMatch) {
        return hashPlaceIdMatch[1];
      }
    }

    // Format 5: Check if URL contains a Place ID pattern (ChIJ...)
    // Place IDs typically start with ChIJ and are 27 characters long
    const placeIdPattern = /(ChIJ[a-zA-Z0-9_-]{27})/;
    const placeIdMatch = url.match(placeIdPattern);
    if (placeIdMatch) {
      return placeIdMatch[1];
    }

    // Format 6: Check for place_id in query parameters (cid parameter sometimes contains it)
    const cidParam = urlObj.searchParams.get("cid");
    if (cidParam) {
      const cidPlaceIdMatch = cidParam.match(/(ChIJ[a-zA-Z0-9_-]{27})/);
      if (cidPlaceIdMatch) {
        return cidPlaceIdMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

/**
 * Extract place name from Google Maps URL
 * Supports URLs like /place/Place+Name or /place/Place+Name/@lat,lng
 */
export function extractPlaceNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Match /place/Place+Name or /place/Place+Name/@lat,lng
    const placeMatch = pathname.match(/\/place\/([^/@]+)/);
    if (placeMatch) {
      // Decode URL encoding and replace + with spaces
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return placeName;
    }

    return null;
  } catch (error) {
    console.error("Error extracting place name from URL:", error);
    return null;
  }
}

/**
 * Extract coordinates from Google Maps URL
 * Supports URLs with lat,lng coordinates
 */
export function extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
  try {
    const urlObj = new URL(url);

    // Format 1: ?q=lat,lng
    const qParam = urlObj.searchParams.get("q");
    if (qParam) {
      const coords = qParam.split(",").map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { lat: coords[0], lng: coords[1] };
      }
    }

    // Format 2: ?query=lat,lng
    const queryParam = urlObj.searchParams.get("query");
    if (queryParam) {
      const coords = queryParam.split(",").map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { lat: coords[0], lng: coords[1] };
      }
    }

    // Format 3: /place/Place+Name/@lat,lng,zoom
    const pathMatch = urlObj.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (pathMatch) {
      return {
        lat: parseFloat(pathMatch[1]),
        lng: parseFloat(pathMatch[2]),
      };
    }

    return null;
  } catch (error) {
    console.error("Error extracting coordinates from URL:", error);
    return null;
  }
}

/**
 * Validate if a string is a valid Google Maps URL
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Accept shortened Google Maps URLs
    if (hostname === "maps.app.goo.gl" || hostname === "goo.gl") {
      return true;
    }

    return (
      hostname.includes("google.com") &&
      (urlObj.pathname.includes("/maps/") ||
        urlObj.pathname.includes("/place/") ||
        urlObj.searchParams.has("q") ||
        urlObj.searchParams.has("query"))
    );
  } catch {
    return false;
  }
}

/**
 * Expand shortened Google Maps URLs by following redirects
 */
export async function expandShortUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Only expand shortened URLs
    if (hostname !== "maps.app.goo.gl" && hostname !== "goo.gl") {
      return url;
    }

    // Follow redirect to get the actual URL
    // Use GET with a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok && response.url && response.url !== url) {
        return response.url;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // If fetch fails, try with HEAD as fallback
      try {
        const headResponse = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
        });
        if (headResponse.ok && headResponse.url && headResponse.url !== url) {
          return headResponse.url;
        }
      } catch {
        // Ignore errors and return original URL
      }
    }

    return url;
  } catch (error) {
    console.error("Error expanding short URL:", error);
    return url;
  }
}
