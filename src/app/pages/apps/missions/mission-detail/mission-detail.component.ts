import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { StatutLabelPipe } from 'src/app/pipe/statut-label.pipe';
import { Mission } from '../mission';

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink, DatePipe, StatutLabelPipe],
  providers: [DatePipe],
  templateUrl: './mission-detail.component.html',
  styleUrl: './mission-detail.component.scss',
})
export class MissionDetailComponent implements OnInit {
  mission: Mission | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionsService: MissionsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.missionsService.getMissionById(id).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.isLoading = false;
        console.log("[DEBUG][mission]",mission);
      },
    });
  }

  get kmParcourus(): number {
    const kmDbt = Number(this.mission?.kmDbtMission || 0);
    const kmFin = Number(this.mission?.kmFinMission || 0);
    return kmFin > kmDbt ? kmFin - kmDbt : 0;
  }

  get litresConsommes(): number {
    const carbtDbt = Number(this.mission?.carbtDbtMission || 0);
    const carbtFin = Number(this.mission?.carbtFinMission || 0);
    return carbtDbt > carbtFin ? carbtDbt - carbtFin : 0;
  }


}
