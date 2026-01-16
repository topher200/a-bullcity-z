"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LocationInsert } from "@/lib/types/database";
import { LocationMapPreview } from "./location-map-preview";
import { isValidGoogleMapsUrl } from "@/lib/maps/url-parser";

interface LocationFormProps {
  onCancel?: () => void;
}

interface PlaceImportResult {
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

export function LocationForm({ onCancel }: LocationFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [formData, setFormData] = useState<LocationInsert>({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasImported, setHasImported] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleImport = async () => {
    if (!url.trim()) {
      setError("Please enter a Google Maps URL");
      return;
    }

    if (!isValidGoogleMapsUrl(url)) {
      setError("Please enter a valid Google Maps URL");
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/places/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import location from URL");
      }

      const data: PlaceImportResult = await response.json();

      setFormData((prev) => ({
        ...prev,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        description: prev.description || "",
      }));
      setHasImported(true);
      setSuccess(`Successfully imported: ${data.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import location from URL");
      setHasImported(false);
    } finally {
      setIsImporting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.address.trim()) {
      setError("Address is required");
      return;
    }

    if (!hasImported || formData.latitude === 0 || formData.longitude === 0) {
      setError("Please import a location from a Google Maps URL first");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create location");
      }

      // Reset form
      setUrl("");
      setFormData({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
        description: "",
      });
      setHasImported(false);
      setSuccess(null);

      // Refresh the page to show the new location
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create location");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-md p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-md p-4">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium mb-2"
          >
            Google Maps URL *
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="url"
              name="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://www.google.com/maps/place/..."
              className="flex-1 px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !url.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? "Importing..." : "Import"}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste a Google Maps URL to automatically import location details
          </p>
        </div>

        {hasImported && (
          <>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium mb-2"
              >
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="latitude"
                  className="block text-sm font-medium mb-2"
                >
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  step="any"
                  readOnly
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-accent/50 focus:outline-none focus:ring-2 focus:ring-foreground/50"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="block text-sm font-medium mb-2"
                >
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  step="any"
                  readOnly
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-accent/50 focus:outline-none focus:ring-2 focus:ring-foreground/50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Map Preview
              </label>
              <LocationMapPreview
                latitude={formData.latitude}
                longitude={formData.longitude}
              />
            </div>
          </>
        )}
      </div>

      {hasImported && (
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Location"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-foreground/20 rounded-md hover:bg-accent"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
}
