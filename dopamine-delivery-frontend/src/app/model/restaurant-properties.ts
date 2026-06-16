import { RestaurantTags } from "./restaurant-tags";

export interface RestaurantProperties {
  osm_id: string;
  name: string;
  other_tags: RestaurantTags
  image_name?: string;
}