export interface GeoLocation {
  latitude: string;
  longitude: string;
}

export interface LocationAvailability {
  fromTimestamp: number;
  toTimestamp: number;
}

export interface CreateLocationDTO {
  userId: string;
  address: string;
  city: string;
  contact: string;
  description?: string;
  geolocation: GeoLocation;
  roomsNumber: number;
  totalAreaSquaredMeters: number;
  guestsNumber: number;
  availability: LocationAvailability;
  reserved?: boolean;
}

export interface LocationFilterDTO {
  city?: string;
  guestsNumber?: number;
  fromTimestamp?: number;
  toTimestamp?: number;
  reserved?: boolean;
}

export interface UpdateLocationDTO {
  userId?: string;
  address?: string;
  city?: string;
  contact?: string;
  description?: string;
  geolocation?: GeoLocation;
  roomsNumber?: number;
  totalAreaSquaredMeters?: number;
  guestsNumber?: number;
  availability?: LocationAvailability;
  reserved?: boolean;
}
