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

  connect(): void {
    const wsUrl = 'dopamine-delivery.mateusznasewicz.dev/ws/car-simulation'
    this.socket = new WebSocket(`ws://${wsUrl}`);

    this.socket.onmessage = (event) => {
      const incomingCars: CarState[] = JSON.parse(event.data);
      
      this._cars.update((localCars: CarState[]) => {
      
        const ghostCars = localCars
          .filter(lc => !incomingCars.some(ic => ic.id === lc.id) && lc.targetQueue && lc.targetQueue.length > 0)
          .map(lc => ({
            ...lc,
            isMoving: false
          }));

        const allCarsToProcess = [...incomingCars, ...ghostCars];

        return allCarsToProcess.map((serverCar: CarState) => {
          const existingCar = localCars.find(c => c.id === serverCar.id);

          if (existingCar) {
            const currentQueue = existingCar.targetQueue ? [...existingCar.targetQueue] : [];
            const lastInQueue = currentQueue[currentQueue.length - 1];
            const isNewTarget = lastInQueue 
              ? (lastInQueue[0] !== serverCar.destinationLng || lastInQueue[1] !== serverCar.destinationLat)
              : (existingCar.destinationLng !== serverCar.destinationLng || existingCar.destinationLat !== serverCar.destinationLat);
            
            if (isNewTarget && serverCar.destinationLng && serverCar.destinationLat) {
              currentQueue.push([serverCar.destinationLng, serverCar.destinationLat]);
            }

            return {
              ...existingCar,
              targetQueue: currentQueue
            };

          } else {        
            const start: [number, number] = [serverCar.lng, serverCar.lat];
            const dest: [number, number] = [serverCar.destinationLng, serverCar.destinationLat];
            return {
              ...serverCar,
              localLat: serverCar.lat,
              localLng: serverCar.lng,
              rotationZ: this.calculateRotationZ(start, dest),
              targetQueue: [dest],
              isBuffering: true
            };
          }  
        });
      });
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connect(), 3000);
    };
  }

  private calculateRotationZ(start: [number, number], end: [number, number]): number {
    const startM = MercatorCoordinate.fromLngLat(start, 0);
    const endM = MercatorCoordinate.fromLngLat(end, 0);

    const dx = endM.x - startM.x;
    const dy = endM.y - startM.y;

    const angleRad = Math.atan2(dx, dy);
    return angleRad - Math.PI;
  }
}
