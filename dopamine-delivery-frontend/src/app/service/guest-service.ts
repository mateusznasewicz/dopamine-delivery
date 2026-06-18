import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GuestService {

  private _guestID = signal<string>("")
  guestID = this._guestID.asReadonly();

  getOrCreateGuestId() {
    let guestId = localStorage.getItem('guest_id');
    if (!guestId || guestId.length == 0) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_id', guestId);
    }
    
    this._guestID.set(guestId);
  }
}
