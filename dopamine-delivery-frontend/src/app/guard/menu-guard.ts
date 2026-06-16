import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router'; 
import { RestaurantStateService } from '../service/restaurant-state-service';

export const menuGuard: CanActivateFn = (route, state) => {
    const restaurantStateService = inject(RestaurantStateService);
    const router = inject(Router);
    const menu = restaurantStateService.menu()
    const isMenuNotEmpty = menu && Object.keys(menu).length > 0;
    
    if (isMenuNotEmpty) {
        return true;
    }

    router.navigate(['/dashboard']);
    return false;
};