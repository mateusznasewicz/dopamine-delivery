import { Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard-component/dashboard-component';
import { RestaurantMenuComponent } from './component/restaurant-menu-component/restaurant-menu-component';
import { RestaurantListComponent } from './component/restaurant-list-component/restaurant-list-component';
import { ContentEmptyComponent } from './component/content-empty-component/content-empty-component';
import { addressGuard } from './guard/address-guard-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { 
        path: '', 
        component: ContentEmptyComponent
      },
      { 
        path: 'restaurants', 
        component: RestaurantListComponent,
        canActivate: [addressGuard]
      },
      { 
        path: 'menu', 
        component: RestaurantMenuComponent
      }
    ]
  },
];