export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type LocationInsert = Omit<Location, 'id' | 'created_at' | 'updated_at'>;
export type LocationUpdate = Partial<LocationInsert>;
