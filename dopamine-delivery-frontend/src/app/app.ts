import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddressBar } from './address-bar/address-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddressBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('dopamine-delivery-frontend');
}
