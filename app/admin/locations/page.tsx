import { LocationForm } from "@/components/admin/location-form";
import { LocationsList } from "@/components/admin/locations-list";

export default function AdminLocationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Locations</h1>
      </div>

      <div className="bg-card border border-foreground/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Add New Location</h2>
        <LocationForm />
      </div>

      <div className="bg-card border border-foreground/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Existing Locations</h2>
        <LocationsList />
      </div>
    </div>
  );
}
