export interface CarState {
    id: number;
    guestID: string;
    speed: number;
    lng: number;
    lat: number;
    destinationLng: number;
    destinationLat: number;
    
    rotationZ: number
    localLng: number; 
    localLat: number;
}
