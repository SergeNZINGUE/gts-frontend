import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaintenanceService } from 'src/app/services/apps/maintenance/maintenance.service';
import { EnginService } from 'src/app/services/apps/engin/engin.service';
import { EmployeeService } from 'src/app/services/apps/employee/employee.service';

import { Engin } from '../../engin';
import { Employee } from '../../../employee/employee';
import {
  SystemeIntervention,
  TypeMaintenance,
  TYPE_MAINTENANCE_LABELS,
  SYSTEME_INTERVENTION_LABELS,
  MaintenanceDetail,
} from '../maintenance.models';

@Component({
  standalone: true,
  selector: 'app-add-maintenance',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    TablerIconsModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './add-maintenance.component.html',
})
export class AddMaintenanceComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  isEdit = false;
  editId?: number;

  // Listes pour autocomplete
  engins: Engin[] = [];
  filteredEngins: Engin[] = [];
  enginSearchCtrl = new FormControl('');

  conducteurs: Employee[] = [];
  filteredConducteurs: Employee[] = [];
  conducteurSearchCtrl = new FormControl('');

  readonly typeOptions = Object.values(TypeMaintenance).map(v => ({
    value: v,
    label: TYPE_MAINTENANCE_LABELS[v],
  }));

  readonly systemeOptions = Object.values(SystemeIntervention).map(v => ({
    value: v,
    label: SYSTEME_INTERVENTION_LABELS[v],
  }));

  readonly TypeMaintenance = TypeMaintenance;
  readonly TYPE_LABELS: Record<string, string>    = TYPE_MAINTENANCE_LABELS;
  readonly SYSTEME_LABELS: Record<string, string> = SYSTEME_INTERVENTION_LABELS;

  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private enginService: EnginService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadReferentials();

    // Détection mode édition
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.editId = +idParam;
      this.loadForEdit(this.editId);
    }
  }

  // ── Construction du formulaire ──────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      // Identification
      enginId:                [null, Validators.required],
      codeMaintenance:        [''],
      libMaintenance:         [''],
      dateDbtMaintenance:     [new Date(), Validators.required],
      type:                   [TypeMaintenance.PREVENTIVE, Validators.required],

      // Intervention
      horametreIntervention:  [null],
      nomTechnicien:          [''],
      heureDebut:             [''],
      heureFin:               [''],
      conducteurId:           [null],
      enginOperationnel:      [null],

      // Observations générales
      descriptionTravaux:     [''],

      // Clôture
      coutMainOeuvre:         [null],
      prochaineEcheanceHeures:[null],
      prochaineMaintenanceDate:[null],
      signatureTechnicien:    [''],
      signatureResponsable:   [''],

      // Sous-collections
      actions:          this.fb.array([]),
      piecesConsommees: this.fb.array([]),
    });
  }

  // ── Getters FormArray ───────────────────────────────────────────────────

  get actionsArray(): FormArray { return this.form.get('actions') as FormArray; }
  get piecesArray(): FormArray  { return this.form.get('piecesConsommees') as FormArray; }

  actionGroup(i: number): FormGroup { return this.actionsArray.at(i) as FormGroup; }
  pieceGroup(i: number): FormGroup  { return this.piecesArray.at(i) as FormGroup; }

  asGroup(ctrl: AbstractControl): FormGroup { return ctrl as FormGroup; }

  // ── Actions FormArray ───────────────────────────────────────────────────

  addAction(): void {
    this.actionsArray.push(this.fb.group({
      systeme:          [SystemeIntervention.MOTEUR, Validators.required],
      descriptionAction:['', Validators.required],
      resultat:         [''],
    }));
  }

  removeAction(i: number): void { this.actionsArray.removeAt(i); }

  // ── Pièces FormArray ────────────────────────────────────────────────────

  addPiece(): void {
    this.piecesArray.push(this.fb.group({
      designation: ['', Validators.required],
      referencePiece: [''],
      quantite:    [null, [Validators.required, Validators.min(0.001)]],
      unite:       ['pce', Validators.required],
      prixUnitaire:[null],
    }));
  }

  removePiece(i: number): void { this.piecesArray.removeAt(i); }

  montantLigne(i: number): number {
    const g = this.pieceGroup(i).value;
    if (!g.quantite || !g.prixUnitaire) return 0;
    return g.quantite * g.prixUnitaire;
  }

  get totalPieces(): number {
    return this.piecesArray.controls.reduce((sum, c) => {
      const v = (c as FormGroup).value;
      return sum + (v.quantite && v.prixUnitaire ? v.quantite * v.prixUnitaire : 0);
    }, 0);
  }

  get totalMO(): number { return this.form.value.coutMainOeuvre ?? 0; }
  get totalGeneral(): number { return this.totalPieces + this.totalMO; }

  // ── Référentiels ────────────────────────────────────────────────────────

  private loadReferentials(): void {
    this.enginService.getEngins().subscribe(data => {
      this.engins = data;
      this.filteredEngins = data;
    });

    this.employeeService.getEmployees().subscribe(data => {
      this.conducteurs = data;
      this.filteredConducteurs = data;
    });

    this.enginSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').toLowerCase();
      this.filteredEngins = this.engins.filter(
        e => e.codeEngin?.toLowerCase().includes(s) || e.modelEngin?.toLowerCase().includes(s),
      );
    });

    this.conducteurSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').toLowerCase();
      this.filteredConducteurs = this.conducteurs.filter(
        c => c.nomConducteur?.toLowerCase().includes(s) ||
             c.prenomsConducteur?.toLowerCase().includes(s) ||
             c.codeConducteur?.toLowerCase().includes(s),
      );
    });
  }

  selectEngin(e: Engin): void {
    this.form.patchValue({ enginId: e.id });
    this.enginSearchCtrl.setValue(`${e.codeEngin} — ${e.modelEngin}`, { emitEvent: false });
    // Pré-remplir horamètre depuis l'engin
    if (e.horametre && !this.form.value.horametreIntervention) {
      this.form.patchValue({ horametreIntervention: e.horametre });
    }
  }

  selectConducteur(c: Employee): void {
    this.form.patchValue({ conducteurId: c.id });
    this.conducteurSearchCtrl.setValue(
      `${c.nomConducteur} ${c.prenomsConducteur}`, { emitEvent: false },
    );
  }

  clearConducteur(): void {
    this.form.patchValue({ conducteurId: null });
    this.conducteurSearchCtrl.setValue('', { emitEvent: false });
    this.filteredConducteurs = this.conducteurs;
  }

  // ── Chargement en mode édition ──────────────────────────────────────────

  private loadForEdit(id: number): void {
    this.maintenanceService.getById(id).subscribe({
      next: (m: MaintenanceDetail) => {
        // Pré-sélectionner l'engin dans l'autocomplete
        const enginFound = this.engins.find(e => e.id === m.enginId);
        if (enginFound) {
          this.enginSearchCtrl.setValue(`${enginFound.codeEngin} — ${enginFound.modelEngin}`,
            { emitEvent: false });
        }

        if (m.conducteurId) {
          const cFound = this.conducteurs.find(c => c.id === m.conducteurId);
          if (cFound) {
            this.conducteurSearchCtrl.setValue(
              `${cFound.nomConducteur} ${cFound.prenomsConducteur}`, { emitEvent: false });
          }
        }

        this.form.patchValue({
          enginId:                m.enginId,
          codeMaintenance:        m.codeMaintenance ?? '',
          libMaintenance:         m.libMaintenance ?? '',
          dateDbtMaintenance:     m.dateDbtMaintenance ? new Date(m.dateDbtMaintenance) : null,
          type:                   m.type,
          horametreIntervention:  m.horametreIntervention,
          nomTechnicien:          m.nomTechnicien ?? '',
          heureDebut:             m.heureDebut ?? '',
          heureFin:               m.heureFin ?? '',
          conducteurId:           m.conducteurId,
          enginOperationnel:      m.enginOperationnel,
          descriptionTravaux:     m.descriptionTravaux ?? '',
          coutMainOeuvre:         m.coutMainOeuvre,
          prochaineEcheanceHeures:m.prochaineEcheanceHeures,
          prochaineMaintenanceDate: m.prochaineMaintenanceDate
            ? new Date(m.prochaineMaintenanceDate) : null,
          signatureTechnicien:    m.signatureTechnicien ?? '',
          signatureResponsable:   m.signatureResponsable ?? '',
        });

        // Reconstruire FormArrays
        this.actionsArray.clear();
        (m.actions ?? []).forEach(a => {
          this.actionsArray.push(this.fb.group({
            systeme:           [a.systeme, Validators.required],
            descriptionAction: [a.descriptionAction, Validators.required],
            resultat:          [a.resultat ?? ''],
          }));
        });

        this.piecesArray.clear();
        (m.piecesConsommees ?? []).forEach(p => {
          this.piecesArray.push(this.fb.group({
            designation:   [p.designation, Validators.required],
            referencePiece:[p.referencePiece ?? ''],
            quantite:      [p.quantite, [Validators.required, Validators.min(0.001)]],
            unite:         [p.unite, Validators.required],
            prixUnitaire:  [p.prixUnitaire],
          }));
        });
      },
      error: () => this.snack('Erreur lors du chargement de la fiche'),
    });
  }

  // ── Soumission ──────────────────────────────────────────────────────────

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;

    const v = this.form.getRawValue();

    const payload = {
      enginId:                v.enginId,
      conducteurId:           v.conducteurId ?? undefined,
      codeMaintenance:        v.codeMaintenance || undefined,
      libMaintenance:         v.libMaintenance || undefined,
      dateDbtMaintenance:     this.toDateStr(v.dateDbtMaintenance)!,
      horametreIntervention:  v.horametreIntervention ?? undefined,
      type:                   v.type,
      nomTechnicien:          v.nomTechnicien || undefined,
      heureDebut:             v.heureDebut || undefined,
      heureFin:               v.heureFin || undefined,
      descriptionTravaux:     v.descriptionTravaux || undefined,
      coutMainOeuvre:         v.coutMainOeuvre ?? undefined,
      prochaineEcheanceHeures:v.prochaineEcheanceHeures ?? undefined,
      prochaineMaintenanceDate: this.toDateStr(v.prochaineMaintenanceDate),
      enginOperationnel:      v.enginOperationnel ?? undefined,
      signatureTechnicien:    v.signatureTechnicien || undefined,
      signatureResponsable:   v.signatureResponsable || undefined,
      actions: v.actions.map((a: any) => ({
        systeme:          a.systeme,
        descriptionAction:a.descriptionAction,
        resultat:         a.resultat || undefined,
      })),
      piecesConsommees: v.piecesConsommees.map((p: any) => ({
        designation:   p.designation,
        referencePiece:p.referencePiece || undefined,
        quantite:      p.quantite,
        unite:         p.unite,
        prixUnitaire:  p.prixUnitaire ?? undefined,
      })),
    };

    const op$ = this.isEdit
      ? this.maintenanceService.update(this.editId!, payload)
      : this.maintenanceService.create(payload);

    op$.subscribe({
      next: (res) => {
        this.snack(this.isEdit ? 'Fiche mise à jour' : 'Fiche créée');
        this.router.navigate(['/apps/engins/maintenance', res.id]);
      },
      error: () => { this.snack('Erreur lors de l\'enregistrement'); this.isSubmitting = false; },
    });
  }

  cancel(): void {
    this.router.navigate(['/apps/engins/maintenance']);
  }

  private toDateStr(val: any): string | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return val;
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
