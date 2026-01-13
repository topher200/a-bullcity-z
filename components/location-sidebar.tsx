"use client";

import { useEffect, useState } from "react";
import { getAllLocations } from "@/lib/supabase/locations";
import type { Location } from "@/lib/types/database";

interface LocationSidebarProps {
  onLocationSelect?: (location: Location) => void;
  selectedLocationId?: string;
}

export function LocationSidebar({
  onLocationSelect,
  selectedLocationId,
}: LocationSidebarProps) {
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
      <div className="p-4">
        <p className="text-gray-600">Loading locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-600">No locations found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Locations</h2>
        <p className="text-sm text-gray-600 mt-1">
          {locations.length} {locations.length === 1 ? "location" : "locations"}
        </p>
      </div>
      <div className="divide-y">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => onLocationSelect?.(location)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              selectedLocationId === location.id ? "bg-blue-50" : ""
            }`}
          >
            <h3 className="font-semibold text-gray-900">{location.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{location.address}</p>
            {location.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {location.description}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
