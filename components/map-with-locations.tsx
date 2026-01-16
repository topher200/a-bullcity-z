"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { getAllLocations } from "@/lib/supabase/locations";
import type { Location } from "@/lib/types/database";

const mapContainerStyle = {
  width: "100%",
  height: "600px",
};

// Default center - Durham, NC
const defaultCenter = {
  lat: 35.9940,
  lng: -78.8986,
};

export function MapWithLocations() {
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
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={12}
    >
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={{
            lat: location.latitude,
            lng: location.longitude,
          }}
          title={location.name}
        />
      ))}
    </GoogleMap>
  );
}
