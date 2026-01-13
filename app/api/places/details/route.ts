import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface PlaceDetails {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
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
    const { placeId } = body;

    // Validate placeId
    if (!placeId || typeof placeId !== "string" || !placeId.trim()) {
      return NextResponse.json(
        { error: "Place ID is required" },
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

    // Make request to Google Places API (Place Details)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,formatted_address,geometry,place_id,website,formatted_phone_number,rating,types&key=${apiKey}`;

    const response = await fetch(placesUrl);
    const data = await response.json();

    // Check if request was successful
    if (data.status === "OK" && data.result) {
      const result = data.result;
      const location = result.geometry?.location;

      if (!location) {
        return NextResponse.json(
          { error: "Location data not found in place details" },
          { status: 400 }
        );
      }

      const placeDetails: PlaceDetails = {
        name: result.name || "",
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

      return NextResponse.json(placeDetails);
    } else {
      const errorMessage = data.error_message || `Could not fetch place details: ${data.status}`;
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/places/details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
