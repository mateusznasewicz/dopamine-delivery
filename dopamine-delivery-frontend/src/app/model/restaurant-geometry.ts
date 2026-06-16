export interface RestaurantGeometry {
  type: 'Point';
  coordinates: [number, number]; 
}

export const getLon = (geo: RestaurantGeometry): number => geo.coordinates[0];
export const getLat = (geo: RestaurantGeometry): number => geo.coordinates[1];