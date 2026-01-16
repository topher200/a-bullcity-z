"use client";

import { useEffect, useState } from "react";
import type { Location } from "@/lib/types/database";
import { getAllLocations } from "@/lib/supabase/locations";
import { LocationActions } from "./location-actions";

export function LocationsList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        const data = await getAllLocations();
        setLocations(data);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError("Failed to load locations");
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-accent/50 rounded-lg">
        <p className="text-foreground/70">Loading locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 bg-red-50 dark:bg-red-950 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-accent/50 rounded-lg">
        <p className="text-foreground/70">No locations yet. Add your first location above!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-foreground/20">
            <th className="text-left py-3 px-4 font-semibold">Name</th>
            <th className="text-left py-3 px-4 font-semibold">Address</th>
            <th className="text-left py-3 px-4 font-semibold">Coordinates</th>
            <th className="text-left py-3 px-4 font-semibold">Description</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr
              key={location.id}
              className="border-b border-foreground/10 hover:bg-accent/50"
            >
              <td className="py-3 px-4">{location.name}</td>
              <td className="py-3 px-4 text-sm">{location.address}</td>
              <td className="py-3 px-4 text-sm font-mono">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </td>
              <td className="py-3 px-4 text-sm">
                {location.description ? (
                  <span className="line-clamp-2">{location.description}</span>
                ) : (
                  <span className="text-foreground/40 italic">No description</span>
                )}
              </td>
              <td className="py-3 px-4">
                <LocationActions
                  locationId={location.id}
                  locationName={location.name}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
