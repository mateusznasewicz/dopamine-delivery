import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AddressBar } from '../address-bar/address-bar';
import { RestaurantListComponent } from '../restaurant-list-component/restaurant-list-component';
import { DeliveryService } from '../../service/delivery-service';
import { Address } from '../../model/address';
import { GeocodingService } from '../../service/geocoding-service';
import { Restaurant } from '../../model/restaurant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from "../map-component/map-component";
import { finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { MenuService } from '../../service/menu-service';

@Component({
  selector: 'app-dashboard-component',
  imports: [AddressBar, RestaurantListComponent, MapComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent {
  private destroyRef = inject(DestroyRef);
  deliveryService = inject(DeliveryService);
  geocodingService = inject(GeocodingService)
  menuService = inject(MenuService);

  restaurants = signal<Restaurant[]>([]);
  isLoading = signal<boolean>(false);

  onAddressSelected(address: Address) {
    this.shrinkContentSection(['expand-vertical', 'expand-horizontal']);
    this.deliveryService.setUserAddress(address);
    this.isLoading.set(true);

    this.geocodingService.getRestaurantsNearby(+address.lat, +address.lon, 5000).pipe(
      switchMap((restaurants: Restaurant[]) => {
        if (!restaurants || restaurants.length === 0) {
          return of([]); 
        }

        const requests = restaurants.map(restaurant => {
          const cuisine = restaurant.tags.cuisine?.split(';')[0];

          return this.menuService.getRestaurantImage(cuisine!).pipe(
            map((image_name: string) => {
              return {...restaurant, image_name: image_name}
            })
          )
        });

        return forkJoin(requests);
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.expandContentSection(['expand-vertical']))
    ).subscribe({
        next: (data) => {
          this.restaurants.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false); 
        }
      });
  }

  private expandContentSection(classes: string[]): void {
    const contentSection = document.querySelector('.content-section');
    classes.forEach( c => contentSection?.classList.add(c) );
  }

  private shrinkContentSection(classes: string[]): void {
    const contentSection = document.querySelector('.content-section');
    classes.forEach( c => contentSection?.classList.remove(c) );
  }
}
