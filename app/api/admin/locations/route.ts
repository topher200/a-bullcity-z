import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LocationInsert } from "@/lib/types/database";

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
    const { name, address, latitude, longitude, description } = body;

    // Validate required fields
    if (!name || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, address, latitude, longitude" },
        { status: 400 }
      );
    }

    // Validate latitude and longitude ranges
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: "Latitude must be between -90 and 90" },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180" },
        { status: 400 }
      );
    }

    // Prepare location data
    const locationData: LocationInsert = {
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description: description || null,
    };

    // Insert location into database
    const { data, error } = await supabase
      .from("locations")
      .insert([locationData])
      .select()
      .single();

    if (error) {
      console.error("Error inserting location:", error);
      return NextResponse.json(
        { error: "Failed to create location" },
        { status: 500 }
      );
    }

    // Revalidate the admin locations page to refresh the list
    revalidatePath("/admin/locations");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/locations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
