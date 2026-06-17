import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { AddressBar } from '../address-bar/address-bar';
import { DeliveryService } from '../../service/delivery-service';
import { Address } from '../../model/address';
import { GeocodingService } from '../../service/geocoding-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from "../map-component/map-component";
import { finalize } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { RestaurantStateService } from '../../service/restaurant-state-service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard-component',
  imports: [AddressBar, MapComponent, RouterOutlet],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  router = inject(Router);
  private destroyRef = inject(DestroyRef);
  deliveryService = inject(DeliveryService);
  geocodingService = inject(GeocodingService)
  restaurantStateService = inject(RestaurantStateService);
  

  isLoading = signal<boolean>(false);
  isMobile = this.restaurantStateService.isMobile;
  expandMenuVertical = this.restaurantStateService.expandMenuVertical;
  expandMenuHorizontal = this.restaurantStateService.expandMenuHorizontal;
  isMenuHidden = this.restaurantStateService.hideMenu;

  ngOnInit(): void {
    const currentUrl = this.router.url;
    if(currentUrl === '/dashboard'){
      this.restaurantStateService.updateExpandMenuVertical(false);
      this.restaurantStateService.updateExpandMenuHorizontal(false);
    }
  }

  onAddressSelected(address: Address) {
    this.restaurantStateService.updateExpandMenuHorizontal(false);
    this.restaurantStateService.updateExpandMenuVertical(false);
    this.deliveryService.setUserAddress(address);
    this.isLoading.set(true);

    this.geocodingService.getRestaurantsNearby(+address.lat, +address.lon, 2).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.router.navigate(['/dashboard', 'restaurants']);
        this.restaurantStateService.updateExpandMenuVertical(true);
      })
    ).subscribe({
        next: (data) => {
          this.restaurantStateService.updateRestaurants(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false); 
        }
      });
  }
}
