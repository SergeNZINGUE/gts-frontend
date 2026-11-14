import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AddActiviteComponent } from './add-activite.component';

describe('AddActiviteComponent', () => {
  let component: AddActiviteComponent;
  let fixture: ComponentFixture<AddActiviteComponent>;
  const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddActiviteComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { existingCodes: ['MINES'] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddActiviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('refuse un code déjà utilisé', () => {
    component.form.get('codeActivite')!.setValue('mines');
    expect(component.form.get('codeActivite')!.hasError('duplicate')).toBeTrue();
  });
});
