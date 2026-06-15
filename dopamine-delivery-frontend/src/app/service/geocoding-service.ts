import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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

  getRestaurantsNearby(lat: number, lon: number, radiusMeters: number = 2000): Observable<Restaurant[]> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const query = `
      [out:json];
      node(around:${radiusMeters}, ${lat}, ${lon})[amenity=restaurant];
      out;
    `;

    const body = new URLSearchParams();
    body.set('data', query);

    return this.http.post<any>(overpassUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(response => {
        const elements = response.elements || [];
    
        return elements.filter((restaurant: Restaurant) => 
          restaurant.tags && 
          restaurant.tags['addr:street'] && 
          restaurant.tags['addr:housenumber'] &&
          restaurant.tags['cuisine'] &&
          restaurant.tags.name
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
