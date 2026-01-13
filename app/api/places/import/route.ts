import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractPlaceIdFromUrl, extractPlaceNameFromUrl, isValidGoogleMapsUrl, expandShortUrl } from "@/lib/maps/url-parser";

export interface PlaceImportResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  formattedAddress?: string;
  website?: string;
  phoneNumber?: string;
  rating?: number;
  types?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: authData, error: authError } = await supabase.auth.getClaims();

    if (authError || !authData?.claims) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { error: "Google Maps URL is required" },
        { status: 400 }
      );
    }

    // Validate it's a Google Maps URL
    if (!isValidGoogleMapsUrl(url)) {
      return NextResponse.json(
        { error: "Invalid Google Maps URL format" },
        { status: 400 }
      );
    }

    // Get API key from server environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return NextResponse.json(
        { error: "Places service not configured" },
        { status: 500 }
      );
    }

    // Expand shortened URLs first
    const expandedUrl = await expandShortUrl(url);

    // Extract Place ID from the URL
    let placeId = extractPlaceIdFromUrl(expandedUrl);

    // If no Place ID found, try to extract place name and search for it
    if (!placeId) {
      const placeName = extractPlaceNameFromUrl(expandedUrl);

      if (placeName) {
        // Use Places API Text Search to find the place by name
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          placeName
        )}&key=${apiKey}`;

        const textSearchResponse = await fetch(textSearchUrl);
        const textSearchData = await textSearchResponse.json();

        if (textSearchData.status === "OK" && textSearchData.results && textSearchData.results.length > 0) {
          // Use the first result's Place ID
          placeId = textSearchData.results[0].place_id;
        }
      }

      if (!placeId) {
        return NextResponse.json(
          { error: "Could not extract Place ID from URL. Please use a Google Maps URL that contains a specific place." },
          { status: 400 }
        );
      }
    }

    // Fetch place details using Place ID
    const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,formatted_address,geometry,place_id,website,formatted_phone_number,rating,types&key=${apiKey}`;

    const response = await fetch(placesUrl);
    const data = await response.json();

    if (data.status !== "OK" || !data.result) {
      const errorMessage = data.error_message || `Could not fetch place details: ${data.status}`;
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const result = data.result;
    const location = result.geometry?.location;

    if (!location) {
      return NextResponse.json(
        { error: "Location data not found in place details" },
        { status: 400 }
      );
    }

    if (!result.name) {
      return NextResponse.json(
        { error: "Place name not found in place details" },
        { status: 400 }
      );
    }

    const importResult: PlaceImportResult = {
      name: result.name,
      address: result.formatted_address || "",
      latitude: location.lat,
      longitude: location.lng,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      website: result.website,
      phoneNumber: result.formatted_phone_number,
      rating: result.rating,
      types: result.types,
    };

    return NextResponse.json(importResult);
  } catch (error) {
    console.error("Error in POST /api/places/import:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
