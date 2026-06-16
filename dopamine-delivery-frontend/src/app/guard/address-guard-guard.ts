import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router'; 
import { DeliveryService } from '../service/delivery-service';

export const addressGuard: CanActivateFn = (route, state) => {
  const deliveryService = inject(DeliveryService);
  const router = inject(Router);

  if (deliveryService.userAddress()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};