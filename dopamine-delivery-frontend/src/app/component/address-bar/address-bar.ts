import { Component, inject, OnInit, DestroyRef, signal, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { GeocodingService } from '../../service/geocoding-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Address } from '../../model/address';
import { DeliveryService } from '../../service/delivery-service';
import { add } from 'three/tsl';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './address-bar.html',
  styleUrl: './address-bar.css',
})
export class AddressBar implements OnInit{

  addressSelected = output<Address>();

  searchControl = new FormControl('');
  addressList = signal<Address[]>([]);

  private geoCodingService: GeocodingService = inject(GeocodingService);
  private deliveryService: DeliveryService = inject(DeliveryService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  
  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 3) {
          console.log('malo '+ query);
          return of([]);
        }
        return this.geoCodingService.searchAdress(query)
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.addressList.set(data));
  }

  selectAddress(address: Address) {
    this.searchControl.setValue(address.displayName, { emitEvent: false });
    this.addressList.set([]);
    this.addressSelected.emit(address);
  }
}
