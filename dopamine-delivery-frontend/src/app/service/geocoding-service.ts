import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Address } from '../model/address';
import { Restaurant } from '../model/restaurant';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private http: HttpClient = inject(HttpClient)

  searchAdress(query: string): Observable<Address[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    const params = new URLSearchParams({
      q: query.trim(),
      lang: "en",
      limit: "5",
    })
    params.append('osm_tag', 'highway');

    const url = `https://photon.komoot.io/api/?${params}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        const features = response.features || [];
        const allAddresses = features.map((item: any) => this.mapToAddress(item));

        const seen = new Set<string>();

        return allAddresses.filter((address: Address) => {
          if (seen.has(address.displayName)) {
            return false;
          }
          seen.add(address.displayName);
          return true;
        });
      }),
      catchError(() => of([]))
    );
  }

  getRestaurantsNearby(lat: number, lon: number, radius: number = 2): Observable<Restaurant[]> {
    const url = '/api/restaurant';

    const params = new HttpParams()
    .set('lng', lon)
    .set('lat', lat)
    .set('radius', radius)
    .set('limit', 20)

    return this.http.get<any>(url, {params: params}).pipe(
      map(response => {
        return response.filter((restaurant: Restaurant) => 
          restaurant.properties.other_tags && 
          restaurant.properties.other_tags['addr:street'] && 
          restaurant.properties.other_tags['addr:housenumber'] &&
          restaurant.properties.other_tags['cuisine'] &&
          restaurant.properties.name
        );
      })
    );
  }

  private mapToAddress(item: any): Address {
      const props = item.properties;
      const coords = item.geometry.coordinates;
      
      const fieldsToLoop = ['name', 'postcode', 'housenumber', 'district', 'city', 'state', 'country'];
      const addressParts = fieldsToLoop.map(fieldName => props[fieldName]);

      let fullAddress = addressParts
        .filter(Boolean)
        .join(', ');

      if (!fullAddress) {
        fullAddress = 'Nieznany adres';
      }

      return {
        displayName: fullAddress,
        lon: coords[0],
        lat: coords[1]
      };  
    }
}
