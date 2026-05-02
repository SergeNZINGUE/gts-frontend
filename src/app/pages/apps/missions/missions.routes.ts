import { Routes } from '@angular/router';
import { MissionsListComponent } from './missions-list/missions-list.component';
import { AddMissionComponent } from './add-mission/add-mission.component';

export const MissionsRoutes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: MissionsListComponent },
  { path: 'add', component: AddMissionComponent },
];
