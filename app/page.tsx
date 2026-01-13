import { MapWithLocations } from "@/components/map-with-locations";
import { LocationSidebar } from "@/components/location-sidebar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <h1>Bull City A-Z</h1>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        <aside className="w-80 border-r overflow-hidden">
          <LocationSidebar />
        </aside>
        <div className="flex-1">
          <MapWithLocations />
        </div>
      </div>
    </main>
  );
}
