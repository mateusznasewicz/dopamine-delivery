import { inject, Injectable, signal } from '@angular/core';
import { Restaurant } from '../model/restaurant';
import { MenuItem } from '../model/menu-item';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RestaurantStateService {
  private _restaurants = signal<Restaurant[]>([]);
  private _expandMenuHorizontal = signal<boolean>(false);
  private _expandMenuVertical = signal<boolean>(false);
  private _hideMenu = signal<boolean>(false);

  readonly restaurants = this._restaurants.asReadonly();
  readonly expandMenuHorizontal = this._expandMenuHorizontal.asReadonly();
  readonly expandMenuVertical = this._expandMenuVertical.asReadonly();
  readonly hideMenu = this._hideMenu.asReadonly();
  menu = signal<{[key: string]: MenuItem[]}>({})
  
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = signal<boolean>(false);
  constructor() {
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  updateRestaurants(data: Restaurant[]) {
    this._restaurants.set(data);
  }

  updateExpandMenuHorizontal(value: boolean){
    if(this.isMobile()) return;
    this._expandMenuHorizontal.set(value);
  }
  updateExpandMenuVertical(value: boolean){
    this._expandMenuVertical.set(value);
  }
  updateHideMenu(value: boolean){
    this._hideMenu.set(value);
  }
}
