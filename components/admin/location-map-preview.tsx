"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";

interface LocationMapPreviewProps {
  latitude: number;
  longitude: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

export function LocationMapPreview({ latitude, longitude }: LocationMapPreviewProps) {
  const center = {
    lat: latitude,
    lng: longitude,
  };

  // Don't show map if coordinates are at origin (likely not geocoded yet)
  if (latitude === 0 && longitude === 0) {
    return null;
  }

  return (
    <div className="border border-foreground/20 rounded-md overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
