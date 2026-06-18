import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GuestService } from './service/guest-service';
import { WebSocketService } from './service/web-socket-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('dopamine-delivery-frontend');
  private guestService = inject(GuestService);
  private wsService = inject(WebSocketService);

  ngOnInit(): void {
    this.guestService.getOrCreateGuestId();
    this.wsService.connect();
  }
}
