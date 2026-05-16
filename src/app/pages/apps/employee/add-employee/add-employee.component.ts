import { Component, OnInit } from '@angular/core';
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
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {Observable, startWith, map} from "rxjs";
import {AsyncPipe} from "@angular/common";

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
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent implements OnInit {

  form: FormGroup;
  photoFile: File | null = null;
  previewUrl: string = 'assets/images/profile/user-1.jpg';
  isSubmitting = false;

  readonly permisOptions = ['B', 'B1', 'B2', 'B96', 'BE', 'BVA', 'C', 'C1', 'CE', 'C1E', 'D', 'D1', 'D2', 'E', 'F', 'BCD'];
  filteredPermis!: Observable<string[]>;

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
      dateFinEmp: [''],
      coutHoraire: [1500, [Validators.required, Validators.min(1000)]],
    });
  }

  ngOnInit(): void {
    this.filteredPermis = this.form.get('permisCond')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filter = (value ?? '').toLowerCase();
        return this.permisOptions.filter(p => p.toLowerCase().includes(filter));
      })
    );

    this.generateCode();

    this.form.get('typEmpl')!.valueChanges.subscribe((type: string) => {
      const ctrl = this.form.get('dateFinEmp')!;
      if (type === 'CDD' || type === 'Interim') {
        ctrl.setValidators(Validators.required);
      } else {
        ctrl.clearValidators();
        ctrl.reset();
      }
      ctrl.updateValueAndValidity();
    });
  }

  private generateCode(): void {
    const year = new Date().getFullYear();
    const prefix = `EMPL-${year}-`;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        const maxSeq = employees
          .map(e => e.codeConducteur ?? '')
          .filter(c => c.startsWith(prefix))
          .map(c => parseInt(c.replace(prefix, ''), 10))
          .filter(n => !isNaN(n))
          .reduce((max, n) => Math.max(max, n), 0);
        const next = String(maxSeq + 1).padStart(3, '0');
        this.form.get('codeConducteur')!.setValue(`${prefix}${next}`);
      },
      error: () => {
        this.form.get('codeConducteur')!.setValue(`${prefix}001`);
      },
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
    formData.append('coutHoraireConducteur', this.form.value.coutHoraire);
    const typEmpl = this.form.value.typEmpl;
    if (typEmpl === 'CDD' || typEmpl === 'Interim') {
      formData.append('dateFinEmp', this.coreService.formatLocalDate(this.form.value.dateFinEmp));
    }

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
