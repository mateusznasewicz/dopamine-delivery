import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private http: HttpClient = inject(HttpClient);

  getRoute(start: [number, number], end: [number, number]): Observable<[number, number][]> {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
  
      return this.http.get<any>(url).pipe(
        map((response: any) => {
          if (response.code === 'Ok' && response.routes?.length > 0) {
            return response.routes[0].geometry.coordinates as [number, number][];
          }
          return [];
        })
      );
    }
}
