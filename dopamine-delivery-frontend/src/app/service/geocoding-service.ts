import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Address } from '../model/address';

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
