import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AddressBar } from '../address-bar/address-bar';
import { RestaurantListComponent } from '../restaurant-list-component/restaurant-list-component';
import { DeliveryService } from '../../service/delivery-service';
import { Address } from '../../model/address';
import { GeocodingService } from '../../service/geocoding-service';
import { Restaurant } from '../../model/restaurant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from "../map-component/map-component";

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

  restaurants = signal<Restaurant[]>([]);
  isLoading = signal<boolean>(false);

  onAddressSelected(address: Address) {
    this.deliveryService.setUserAddress(address);
    this.isLoading.set(true);

    this.geocodingService.getRestaurantsNearby(+address.lat, +address.lon, 5000).pipe(
      takeUntilDestroyed(this.destroyRef)
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
}
