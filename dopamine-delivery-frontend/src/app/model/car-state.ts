export interface CarState {
    id: number;
    guestID: string;
    speed: number;
    lng: number;
    lat: number;
    isMoving: boolean;

    destinationLng: number;
    destinationLat: number;
    targetQueue: [number, number][];
    rotationZ: number
    localLng: number; 
    localLat: number;
    isBuffering: boolean;
}
