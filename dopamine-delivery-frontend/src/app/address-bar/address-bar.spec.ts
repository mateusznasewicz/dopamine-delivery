import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressBar } from './address-bar';

describe('AddressBar', () => {
  let component: AddressBar;
  let fixture: ComponentFixture<AddressBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressBar],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
