import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from '../../model/restaurant';

@Component({
  selector: 'app-restaurant-list-component',
  imports: [],
  templateUrl: './restaurant-list-component.html',
  styleUrl: './restaurant-list-component.css',
})
export class RestaurantListComponent{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  restaurants = input<Restaurant[]>([]);

}
