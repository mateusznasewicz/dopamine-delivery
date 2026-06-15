import { RestaurantTags } from "./restaurant-tags";

export interface Restaurant {
    id: number;
    lat: number;
    lon: number;
    tags: RestaurantTags;
}
