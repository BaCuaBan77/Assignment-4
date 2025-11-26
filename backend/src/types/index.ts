export interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  dob: string;
}

export interface Location {
  id: string;
  longitude: number;
  latitude: number;
  country: string;
  city: string;
}

export interface Sensor {
  id: string;
  name: string;
  sensor_type: string;
  unit: string;
  threshold: number;
  owner_id: string;
  location_id: string;
}

export interface Observation {
  id: string;
  sensor_id: string;
  value: number;
  timestamp: number;
}

export interface Alarm {
  id: string;
  sensor_id: string;
  alarm_value: number;
  timestamp: number;
}

export interface SensorWithDetails extends Sensor {
  owner_name?: string;
  location?: string;
  latest_value?: number;
  max_value?: number;
  min_value?: number;
}

