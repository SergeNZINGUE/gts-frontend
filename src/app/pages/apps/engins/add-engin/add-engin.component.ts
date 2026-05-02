import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Engin } from '../engin';
import { EnginService } from 'src/app/services/apps/engin/engin.service';

@Component({
  standalone: true,
  selector: 'app-add-engin',
  templateUrl: './add-engin.component.html',
  styleUrl: './add-engin.component.scss',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TablerIconsModule,
    RouterLink,
  ],
})
export class AddEnginComponent implements OnInit {
  action: 'Add' | 'Update' = 'Add';
  local_data: Engin = {} as Engin;
  dateAcqEngin = new FormControl();
  dateCreation = new FormControl();
  dateModification = new FormControl();

  constructor(
    private enginService: EnginService,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (id) {
      this.action = 'Update';
      this.enginService.getEnginById(+id).subscribe({
        next: (engin) => {
          this.local_data = engin;
          this.dateAcqEngin.setValue(
            engin.dateAcqEngin || new Date().toISOString().split('T')[0]
          );
          this.dateCreation.setValue(
            engin.dateCreation || new Date().toISOString().split('T')[0]
          );
          this.dateModification.setValue(
            engin.dateModification || new Date().toISOString().split('T')[0]
          );
        },
        error: (error) => {
          console.error('Erreur chargement engin:', error);
        },
      });
    } else {
      this.action = 'Add';
      this.local_data = {} as Engin;
      this.dateAcqEngin.setValue(new Date().toISOString().split('T')[0]);
      this.dateCreation.setValue(new Date().toISOString().split('T')[0]);
      this.dateModification.setValue(new Date().toISOString().split('T')[0]);
      console.log("this.local_data_ngOnitit"+this.local_data);
    }
  }

  doAction(): void {
    this.local_data.dateAcqEngin = this.dateAcqEngin.value;
    this.local_data.dateCreation = this.dateCreation.value;
    this.local_data.dateModification = this.dateModification.value;
    this.local_data.etatEngin = 1;

    if (this.action === 'Add') {
      console.log("ici je suis là "+this.local_data.codeEngin);
      this.enginService.addEngin(this.local_data).subscribe({
        next: ()  => {
          this.openSnackBar('Engin ajouté avec succès', 'Close');
          this.router.navigate(['/apps/engins']); },

        error:(error) => {
        console.log('Erreur lors de l\'ajout de l\'engin:', error);
        this.openSnackBar('Erreur', 'Close');

      }
      });
  } else {
      this.enginService.updateEngin(this.local_data.id, this.local_data).subscribe({
        next: () => {
          this.openSnackBar('Engin modifié avec succès !', 'Close');
          this.router.navigate(['/apps/engins']);
        },
        error: () => this.openSnackBar('Erreur lors de la modification', 'Close'),
      });
    }

  }

  cancel(): void {
    this.router.navigate(['/apps/engins']);
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
