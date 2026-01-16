import { createClient } from "./client";
import type { Location } from "../types/database";

/**
 * Fetch all locations from the database
 */
export async function getAllLocations(): Promise<Location[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }

  return data || [];
}
