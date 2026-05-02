import { Component } from '@angular/core';
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatFormField, MatInputModule, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDatepicker, MatDatepickerModule} from "@angular/material/datepicker";
import {Router, RouterLink} from "@angular/router";
import {MatCard, MatCardContent} from "@angular/material/card";
import {FileUploadComponent} from "../../../../utils/file-upload/file-upload.component";
import {EmployeeService} from "../../../../services/apps/employee/employee.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CoreService} from "../../../../services/core.service";
import {ActiviteClient} from "../activite-client/activite-client";
import {ActiviteClientService} from "../../../../services/apps/activite-client/activite-client.service";
import {ClientsService} from "../../../../services/apps/clients/clients.service";
import {NgIf,NgFor} from "@angular/common";

@Component({
  selector: 'app-add-client',
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
    NgIf,
    NgFor
  ],
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.scss',
})
export class AddClientComponent {
  form: FormGroup;
  logoFile: File | null = null;
  previewUrl: string = 'assets/images/profile/user-1.jpg';
  isSubmitting = false;
  paysList = [
    { code: 'CI', nom: 'Côte d’Ivoire' },
    { code: 'SN', nom: 'Sénégal' },
    { code: 'ML', nom: 'Mali' },
    { code: 'BF', nom: 'Burkina Faso' },
    { code: 'GN', nom: 'Guinée' },
    { code: 'GH', nom: 'Ghana' },
    { code: 'TG', nom: 'Togo' },
    { code: 'BJ', nom: 'Bénin' },
    { code: 'NG', nom: 'Nigeria' },
    { code: 'FR', nom: 'France' },
  ];
  activiteClient: ActiviteClient[] = [];
  constructor(
    private fb: FormBuilder,
    private activiteClientService: ActiviteClientService,
    private clientService : ClientsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private coreService: CoreService
  ) {
    this.form = this.fb.group({
      codeClient: ['', Validators.required],
      nameClient: [''],
      descriptionEntreprise: [''],
      designationEntreprise: ['', Validators.required],
      paysEntreprise: ['', Validators.required],
      email: [''],
      phoneNumber: ['', Validators.required],
      personneRessource: [''],
      telPersonneRessource: [''],
      adresseEntreprise: [''],
      rccmClient: [''],
      numeroIFUEntreprise: [''],
      regimeFiscalEntreprise: [''],
      numeroCompteBancaire: [''],
      dateCreation: ['', coreService.todayOrFutureDateValidator()],
      activiteClient: ['',Validators.required]
    });
  }
  ngOnInit() {
    this.loadActiviteClient()  ;
  }

  onPhotoSelected(file: File | File[] | null): void {
    this.logoFile = file instanceof File ? file : null;
  }

  submit(): void {
    if (this.form.invalid) {
      console.log("Invalid this.form.value", this.form.value);
      this.form.markAllAsTouched();
      return;
    }
    console.log("this.form.value", this.form.value);

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('codeClient', this.form.value.codeClient);
    formData.append('nameClient', this.form.value.nameClient);
    formData.append('descriptionEntreprise', this.form.value.descriptionEntreprise);
    formData.append('designationEntreprise', this.form.value.designationEntreprise);

    formData.append('paysEntreprise', this.form.value.paysEntreprise);

    formData.append('email', this.form.value.email);
    formData.append('phoneNumber', this.form.value.phoneNumber);
    formData.append('personneRessource', this.form.value.personneRessource);
    formData.append('telPersonneRessource', this.form.value.telPersonneRessource);

    formData.append('adresseEntreprise', this.form.value.adresseEntreprise);
    formData.append('rccmClient', this.form.value.rccmClient);
    formData.append('numeroIFUEntreprise', this.form.value.numeroIFUEntreprise);
    formData.append('regimeFiscalEntreprise', this.form.value.regimeFiscalEntreprise);
    formData.append('numeroCompteBancaire', this.form.value.numeroCompteBancaire);
    formData.append('dateCreation', this.coreService.formatLocalDate(this.form.value.dateCreation));

    if (this.logoFile) {
      formData.append('cheminLogoEntreprise', this.logoFile);
    }

    this.clientService.createClient(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Client ajouté avec succès', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/apps/clients']);
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


  private loadActiviteClient() {
    this.activiteClientService.getActiviteClient().subscribe({
      next : (activiteClient) => {
        this.activiteClient = activiteClient;
        console.log("activiteClient",this.activiteClient);
      },
      error : (error) => {
        console.error('Error fetching activiteClient:', error);
      }
    });
  }
}
