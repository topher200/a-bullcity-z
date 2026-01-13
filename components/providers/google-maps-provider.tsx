"use client";

import { LoadScript } from "@react-google-maps/api";
import { ReactNode } from "react";

interface GoogleMapsProviderProps {
  children: ReactNode;
}

/**
 * Google Maps Provider - Loads the Google Maps API once at the app root level.
 * This prevents reloading the Maps script on every component render.
 */
export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key not found in environment variables");
    return <>{children}</>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} loadingElement={<div>Loading Maps...</div>}>
      {children}
    </LoadScript>
  );
}
