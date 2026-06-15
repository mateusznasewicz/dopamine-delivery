import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddressBar } from './component/address-bar/address-bar';
import { MapComponent } from "./component/map-component/map-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddressBar, MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('dopamine-delivery-frontend');
}
