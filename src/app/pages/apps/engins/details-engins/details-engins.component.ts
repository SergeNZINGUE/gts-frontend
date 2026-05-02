import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaterialModule } from 'src/app/material.module';
import { Engin } from '../engin';
import { EnginService } from 'src/app/services/apps/engin/engin.service';

@Component({
  selector: 'app-details-engins',
  standalone: true,
  templateUrl: './details-engins.component.html',
  styleUrl: './details-engins.component.scss',
  imports: [
    MaterialModule,
    CommonModule,
    TablerIconsModule,
    RouterLink,
  ],
})
export class DetailsEnginsComponent implements OnInit {
  local_data: Engin = {} as Engin;

  constructor(
    private activatedRoute: ActivatedRoute,
    private enginService: EnginService
  ) {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (id) {
      this.enginService.getEnginById(+id).subscribe({
        next: (engin) => {
          this.local_data = engin;
        },
        error: (error) => {
          console.error('Erreur chargement détails engin:', error);
        },
      });
    }
  }
}
