import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MenuItem } from '../model/menu-item';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private http: HttpClient = inject(HttpClient);
  private endpoint: string = "/api/menu"

  getRestaurantImage(cuisine: string): Observable<string> {
    const params = new HttpParams().set('cuisine', cuisine);
    const url = `${this.endpoint}/restaurant-header`;
    return this.http.get(url, {params: params, responseType: 'text'});
  }

  getRestaurantMenu(cuisine: string): Observable<MenuItem[]> {
    const params = new HttpParams().set('cuisine', cuisine);
    return this.http.get<MenuItem[]>(this.endpoint, {params: params});
  }
}
