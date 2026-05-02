import { Component } from '@angular/core';
import {MatFormField, MatInputModule, MatLabel} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {EmployeeService} from "../../../../services/apps/employee/employee.service";
import {Router, RouterLink} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepicker, MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {CoreService} from "../../../../services/core.service";
import {FileUploadComponent} from "../../../../utils/file-upload/file-upload.component";

@Component({
  selector: 'app-add-employee',
  imports: [
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    RouterLink,
    MatDatepicker,
    MatFormField,
    MatCardContent,
    MatCard,
    MatLabel,
    MatSelect,
    MatOption,
    FileUploadComponent,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent {

  form: FormGroup;
  photoFile: File | null = null;
  previewUrl: string = 'assets/images/profile/user-1.jpg';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private coreService: CoreService
  ) {
    this.form = this.fb.group({
      codeConducteur: ['', Validators.required],
      nomConducteur: ['', Validators.required],
      prenomsConducteur: ['', Validators.required],
      dateNaissance: ['', coreService.pastDateValidator()],

      telephone: ['', Validators.required],
      cniRef: [''],
      cniDateEmi: [''],
      cniLieuEtab: [''],
      cniDateExp: ['',coreService.futureDateValidator()],

      permisCond: ['', Validators.required],
      qualifications: [''],
      typEmpl: ['', Validators.required],
      statutConducteur: ['1', Validators.required],
      dateDebutEmp: ['', Validators.required],
    });
  }

  onPhotoSelected(file: File | File[] | null): void {
    this.photoFile = file instanceof File ? file : null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('codeConducteur', this.form.value.codeConducteur);
    formData.append('nomConducteur', this.form.value.nomConducteur);
    formData.append('prenomsConducteur', this.form.value.prenomsConducteur);
    formData.append('dateNaissance', this.coreService.formatLocalDate(this.form.value.dateNaissance));

    formData.append('telephone', this.form.value.telephone);

    formData.append('cniRef', this.form.value.cniRef);
    formData.append('cniDateEmi', this.form.value.cniDateEmi);
    formData.append('cniLieuEtab', this.form.value.cniLieuEtab);
    formData.append('cniDateExp', this.form.value.cniDateExp);

    formData.append('permisCond', this.form.value.permisCond);
    formData.append('qualifications', this.form.value.qualifications);
    formData.append('dateDebutEmp', this.coreService.formatLocalDate(this.form.value.dateDebutEmp));
    formData.append('typEmpl', this.form.value.typEmpl);

    if (this.photoFile) {
      formData.append('imgConducteur', this.photoFile);
    }

    this.employeeService.createEmployee(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Conducteur ajouté avec succès', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/apps/employee']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur ajout conducteur', err);
        this.snackBar.open('Erreur lors de l’ajout du conducteur', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
}
