import { RestaurantGeometry } from "./restaurant-geometry";
import { RestaurantProperties } from "./restaurant-properties";

export interface Restaurant {
  id?: string;
  type: 'Feature';
  properties: RestaurantProperties;
  geometry: RestaurantGeometry;
}