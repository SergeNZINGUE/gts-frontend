import { Routes } from '@angular/router';
import { MissionsListComponent } from './missions-list/missions-list.component';
import { AddMissionComponent } from './add-mission/add-mission.component';
import { EditMissionComponent } from './edit-mission/edit-mission.component';
import { MissionDetailComponent } from './mission-detail/mission-detail.component';

export const MissionsRoutes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: MissionsListComponent },
  { path: 'add', component: AddMissionComponent },
  { path: 'edit/:id', component: EditMissionComponent },
  { path: 'detail/:id', component: MissionDetailComponent },
];
