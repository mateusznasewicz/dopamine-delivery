import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentEmptyComponent } from './content-empty-component';

describe('ContentEmptyComponent', () => {
  let component: ContentEmptyComponent;
  let fixture: ComponentFixture<ContentEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentEmptyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentEmptyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
