import { Component, OnInit } from '@angular/core';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { EmployeeService } from '../../../../services/apps/employee/employee.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CoreService } from '../../../../services/core.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-edit-employee',
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
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
})
export class EditEmployeeComponent implements OnInit {

  form: FormGroup;
  conducteurId!: number;
  isSubmitting = false;
  isLoading = true;

  readonly permisOptions = ['B', 'B1', 'B2', 'B96', 'BE', 'BVA', 'C', 'C1', 'CE', 'C1E', 'D', 'D1', 'D2', 'E', 'F', 'BCD'];
  filteredPermis!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
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
      cniDateExp: ['', coreService.futureDateValidator()],
      permisCond: ['', Validators.required],
      qualifications: [''],
      typEmpl: ['', Validators.required],
      statutConducteur: ['1', Validators.required],
      dateDebutEmp: ['', Validators.required],
      dateFinEmp: [''],
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

    this.conducteurId = +this.route.snapshot.paramMap.get('id')!;
    this.employeeService.getEmployeesById(this.conducteurId, 0, 1).subscribe({
      next: (data: any) => {
        this.form.patchValue({
          codeConducteur: data.codeConducteur ?? '',
          nomConducteur: data.nomConducteur ?? '',
          prenomsConducteur: data.prenomsConducteur ?? '',
          dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : '',
          telephone: data.telephone ?? '',
          cniRef: data.cniRef ?? '',
          cniDateEmi: data.cniDateEmi ?? '',
          cniLieuEtab: data.cniLieuEtab ?? '',
          cniDateExp: data.cniDateExp ?? '',
          permisCond: data.permisCond ?? '',
          qualifications: data.qualifications ?? '',
          typEmpl: data.typEmpl ?? '',
          statutConducteur: data.statutConducteur != null ? String(data.statutConducteur) : '1',
          dateDebutEmp: data.dateDebutEmp ? new Date(data.dateDebutEmp) : '',
          dateFinEmp: data.dateFinEmp ? new Date(data.dateFinEmp) : '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement du conducteur', 'Fermer', {
          duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
        });
      },
    });
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
    formData.append('cniRef', this.form.value.cniRef ?? '');
    formData.append('cniDateEmi', this.form.value.cniDateEmi ?? '');
    formData.append('cniLieuEtab', this.form.value.cniLieuEtab ?? '');
    formData.append('cniDateExp', this.form.value.cniDateExp ?? '');
    formData.append('permisCond', this.form.value.permisCond);
    formData.append('qualifications', this.form.value.qualifications ?? '');
    formData.append('dateDebutEmp', this.coreService.formatLocalDate(this.form.value.dateDebutEmp));
    formData.append('typEmpl', this.form.value.typEmpl);
    formData.append('statutConducteur', this.form.value.statutConducteur);

    const typEmpl = this.form.value.typEmpl;
    if (typEmpl === 'CDD' || typEmpl === 'Interim') {
      formData.append('dateFinEmp', this.coreService.formatLocalDate(this.form.value.dateFinEmp));
    }

    this.employeeService.updateEmployee(this.conducteurId, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Conducteur modifié avec succès', 'Fermer', {
          duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
        });
        this.router.navigate(['/apps/employee']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur modification conducteur', err);
        this.snackBar.open('Erreur lors de la modification du conducteur', 'Fermer', {
          duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
        });
      },
    });
  }
}