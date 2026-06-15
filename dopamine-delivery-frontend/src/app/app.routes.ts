import { Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard-component/dashboard-component';
import { RestaurantMenuComponent } from './component/restaurant-menu-component/restaurant-menu-component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'restaurant/:id', component: RestaurantMenuComponent },
];