import { Injectable, signal } from '@angular/core';
import { CarState } from '../model/car-state';
import { MercatorCoordinate } from 'maplibre-gl';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  private _cars = signal<CarState[]>([]);
  cars = this._cars.asReadonly();

  private calculateRotationZ(start: [number, number], end: [number, number]): number {
    const startM = MercatorCoordinate.fromLngLat(start, 0);
    const endM = MercatorCoordinate.fromLngLat(end, 0);

    const dx = endM.x - startM.x;
    const dy = endM.y - startM.y;

    const angleRad = Math.atan2(dx, dy);
    return angleRad - Math.PI;
  }

  connect(): void {
    const wsUrl = 'dopamine-delivery.mateusznasewicz.dev/ws/car-simulation'
    this.socket = new WebSocket(`ws://${wsUrl}`);

    this.socket.onmessage = (event) => {
      const incomingCars: CarState[] = JSON.parse(event.data);
      this._cars.update((localCars: CarState[]) => {
        return incomingCars.map((serverCar: CarState) => {
          const existingCar = localCars.find(c => c.guestID === serverCar.guestID);
          const lng = existingCar ? existingCar.localLng : serverCar.lng;
          const lat = existingCar ? existingCar.localLat : serverCar.lat;
          const rotationZ = this.calculateRotationZ([lng,lat],[serverCar.destinationLng, serverCar.destinationLat])
          
          return {
              ...serverCar,
              localLng: lng,
              localLat: lat,
              rotationZ: rotationZ,
            };
          
        });
      });
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connect(), 3000);
    };
  }
}
