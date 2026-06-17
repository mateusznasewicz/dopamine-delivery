import { effect, inject, Injectable, signal } from '@angular/core';
import { Restaurant } from '../model/restaurant';
import { MenuItem } from '../model/menu-item';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RestaurantStateService {
  private getStorageBool(key: string, defaultValue: boolean): boolean {
    const value = localStorage.getItem(key);
    return value !== null ? value === 'true' : defaultValue;
  }

  private getStorageJson<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  }

  private _restaurants = signal<Restaurant[]>(this.getStorageJson('state_restaurants', []));
  private _expandMenuHorizontal = signal<boolean>(this.getStorageBool('state_expand_horizontal', false));
  private _expandMenuVertical = signal<boolean>(this.getStorageBool('state_expand_vertical', false));
  private _hideMenu = signal<boolean>(this.getStorageBool('state_hide_menu', false));

  readonly restaurants = this._restaurants.asReadonly();
  readonly expandMenuHorizontal = this._expandMenuHorizontal.asReadonly();
  readonly expandMenuVertical = this._expandMenuVertical.asReadonly();
  readonly hideMenu = this._hideMenu.asReadonly();
  menu = signal<{[key: string]: MenuItem[]}>(this.getStorageJson('state_menu', {}));
  
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = signal<boolean>(false);
  constructor() {
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });

    effect(() => {
      localStorage.setItem('state_expand_horizontal', String(this._expandMenuHorizontal()));
    });

    effect(() => {
      localStorage.setItem('state_expand_vertical', String(this._expandMenuVertical()));
    });

    effect(() => {
      localStorage.setItem('state_hide_menu', String(this._hideMenu()));
    });

    effect(() => {
      localStorage.setItem('state_menu', JSON.stringify(this.menu()));
    });

    effect(() => {
      localStorage.setItem('state_restaurants', JSON.stringify(this._restaurants()));
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
