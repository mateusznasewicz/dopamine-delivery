import { Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard-component/dashboard-component';
import { RestaurantMenuComponent } from './component/restaurant-menu-component/restaurant-menu-component';
import { RestaurantListComponent } from './component/restaurant-list-component/restaurant-list-component';
import { ContentEmptyComponent } from './component/content-empty-component/content-empty-component';
import { restaurantGuard } from './guard/restaurant-guard';
import { menuGuard } from './guard/menu-guard';
import { PaymentComponent } from './component/payment-component/payment-component';
import { paymentGuard } from './guard/payment-guard';
import { PaymentSuccessComponent } from './component/payment-success-component/payment-success-component';

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
        canActivate: [restaurantGuard]
      },
      { 
        path: 'menu', 
        component: RestaurantMenuComponent,
        canActivate: [menuGuard]
      },
      {
        path: 'payment',
        component: PaymentComponent,
      },
      {
        path: 'paymentSuccess',
        component: PaymentSuccessComponent
      }
    ]
  },
];