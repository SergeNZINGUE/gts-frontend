import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateLocationDialogComponent } from './validate-location-dialog.component';

describe('ValidateLocationDialogComponent', () => {
  let component: ValidateLocationDialogComponent;
  let fixture: ComponentFixture<ValidateLocationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateLocationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
