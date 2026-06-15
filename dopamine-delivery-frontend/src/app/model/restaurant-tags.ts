export interface RestaurantTags {
    name: string;
    amenity: 'restaurant';
    cuisine?: string;
    website?: string;
    'addr:city'?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:postcode'?: string;
    [key: string]: any;
}
