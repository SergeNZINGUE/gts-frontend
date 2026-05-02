import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglementsComponent } from './reglements.component';

describe('ReglementsComponent', () => {
  let component: ReglementsComponent;
  let fixture: ComponentFixture<ReglementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
