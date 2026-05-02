import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { LocationService } from 'src/app/services/apps/location/location.service';
import { MissionsService } from 'src/app/services/apps/missions/missions.service';
import { LocationEngin } from '../location-engin';
import { Mission } from '../../missions/mission';
import {LocationEnginResponse} from "../locationEnginResponse";

@Component({
  selector: 'app-details-location',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './details-location.component.html',
  styleUrl: './details-location.component.scss',
})
export class DetailsLocationComponent implements OnInit {
  location: LocationEnginResponse | null = null;
  missions: Mission[] = [];
  isLoading = true;

  missionColumns = ['codeMission', 'lieuMission', 'nbHeures', 'sousTotal', 'statutMission'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private missionsService: MissionsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.locationService.getLocationById(id, 0, 100).subscribe({
      next: (data: any) => {
        this.location = data;
        console.log("[DEBUG] LOCATION", this.location)
        this.isLoading = false;
      },
    });

    this.missionsService.getMissions().subscribe({
      next: (missions) => {
        this.missions = missions.filter(m => m.locationId === id);
      },
    });
  }

  get totalMissions(): number {
    return this.missions.reduce((sum, m) => sum + (m.sousTotal || 0), 0);
  }

  openMissionDetail(mission: Mission): void {
    this.router.navigate(['/apps/missions/detail', mission.id]);
  }
}
