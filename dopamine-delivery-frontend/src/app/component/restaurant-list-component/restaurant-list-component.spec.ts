import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantListComponent } from './restaurant-list-component';

describe('RestaurantListComponent', () => {
  let component: RestaurantListComponent;
  let fixture: ComponentFixture<RestaurantListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
