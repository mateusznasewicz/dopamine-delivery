import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router'; 
import { CartStateService } from '../service/cart-state-service';


export const paymentGuard: CanActivateFn = (route, state) => {
    const cartStateService = inject(CartStateService);
    const router = inject(Router);
    const cart = cartStateService.cart();
    const isCartNotEmpty = cart && Object.keys(cart).length > 0;
    
    if (isCartNotEmpty) {
        return true;
    }

    router.navigate(['/dashboard']);
    return false;
};