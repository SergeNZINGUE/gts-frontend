import { Routes } from '@angular/router';

import { AppEmployeeComponent } from './employee/employee.component';
import { AppEnginsComponent } from './engins/engins.component';
import { ClientsComponent } from './clients/clients.component';
import { LocationsComponent } from './locations/locations.component';
import { MissionsListComponent } from './missions/missions-list/missions-list.component';
import { FacturesListComponent } from './factures/factures-list/factures-list.component';

import { DetailsEmployeeComponent } from './employee/details-employee/details-employee.component';
import { AddEmployeeComponent } from './employee/add-employee/add-employee.component';
import { DetailsEnginsComponent } from './engins/details-engins/details-engins.component';
import { AddEnginComponent } from './engins/add-engin/add-engin.component';
import { AddClientComponent } from './clients/add-client/add-client.component';
import { DetailsClientComponent } from './clients/details-client/details-client.component';
import { DetailsLocationComponent } from './locations/details-location/details-location.component';
import { AddLocationComponent } from './locations/add-location/add-location.component';
import { AddMissionComponent } from './missions/add-mission/add-mission.component';
import { MissionDetailComponent } from './missions/mission-detail/mission-detail.component';
import { AddFactureComponent } from './factures/add-facture/add-facture.component';
import { DetailsFactureComponent } from './factures/details-facture/details-facture.component';
import { AssurancesEnginsComponent } from './engins/assurances-engins/assurances-engins.component';
import { ControlesVGPComponent } from './engins/controles-vgp/controles-vgp.component';
import { RapportsComponent } from './rapports/rapports.component';
import { UsersComponent } from './users/users.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { DetailsUserComponent } from './users/details-user/details-user.component';
import { AuthorizationGuard } from '../../guards/authorization.guard';

const FLOTTE = ['ADMIN', 'MANAGER', 'OPERATEUR'];
const FLOTTE_LECTURE = ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'];
const FINANCE = ['ADMIN', 'MANAGER', 'COMPTABLE'];
const EXPLOITATION = ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'];
const ADMIN_MANAGER = ['ADMIN', 'MANAGER'];
const ADMIN_ONLY = ['ADMIN'];

export const AppsRoutes: Routes = [
  {
    path: '',
    children: [

      // ── Employés / Conducteurs ──────────────────────────────────────
      {
        path: 'employee',
        component: AppEmployeeComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE_LECTURE,
          title: 'Conducteurs',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Conducteurs' },
          ],
        },
      },
      {
        path: 'employee/details-employee/:id',
        component: DetailsEmployeeComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE_LECTURE,
          title: 'Détails conducteur',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Conducteurs', url: '/apps/employee' },
            { title: 'Détails conducteur' },
          ],
        },
      },
      {
        path: 'employee/add-employee',
        component: AddEmployeeComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Ajouter un conducteur',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Conducteurs', url: '/apps/employee' },
            { title: 'Ajouter un conducteur' },
          ],
        },
      },

      // ── Engins ─────────────────────────────────────────────────────
      {
        path: 'engins',
        component: AppEnginsComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Engins',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Engins' },
          ],
        },
      },
      {
        path: 'engins/add-engin',
        component: AddEnginComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Ajouter un engin',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Engins', url: '/apps/engins' },
            { title: 'Ajouter un engin' },
          ],
        },
      },
      {
        path: 'engins/details-engins/:id',
        component: DetailsEnginsComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Détails engin',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Engins', url: '/apps/engins' },
            { title: 'Détails engin' },
          ],
        },
      },

      // ── Clients ────────────────────────────────────────────────────
      {
        path: 'clients',
        component: ClientsComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: [...ADMIN_MANAGER, 'COMPTABLE', 'OPERATEUR'],
          title: 'Clients',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Clients' },
          ],
        },
      },
      {
        path: 'clients/add-client',
        component: AddClientComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: ADMIN_MANAGER,
          title: 'Ajouter un client',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Clients', url: '/apps/clients' },
            { title: 'Ajouter un client' },
          ],
        },
      },
      {
        path: 'clients/details-client/:id',
        component: DetailsClientComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: [...ADMIN_MANAGER, 'COMPTABLE', 'OPERATEUR'],
          title: 'Détails client',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Clients', url: '/apps/clients' },
            { title: 'Détails client' },
          ],
        },
      },

      // ── Assurances ─────────────────────────────────────────────────
      {
        path: 'engins/assurances-engins',
        component: AssurancesEnginsComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Assurances engins',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Engins', url: '/apps/engins' },
            { title: 'Assurances engins' },
          ],
        },
      },
      {
        path: 'engins/controles-des-engins',
        component: ControlesVGPComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Contrôles VGP',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Engins', url: '/apps/engins' },
            { title: 'Contrôles VGP' },
          ],
        },
      },

      // ── Locations ──────────────────────────────────────────────────
      {
        path: 'locations',
        component: LocationsComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: EXPLOITATION,
          title: 'Locations',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Locations' },
          ],
        },
      },
      {
        path: 'locations/details-location/:id',
        component: DetailsLocationComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: EXPLOITATION,
          title: 'Détails location',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Locations', url: '/apps/locations' },
            { title: 'Détails location' },
          ],
        },
      },
      {
        path: 'locations/add-location',
        component: AddLocationComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: ADMIN_MANAGER,
          title: 'Nouvelle location',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Locations', url: '/apps/locations' },
            { title: 'Nouvelle location' },
          ],
        },
      },

      // ── Missions ───────────────────────────────────────────────────
      {
        path: 'missions',
        component: MissionsListComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: EXPLOITATION,
          title: 'Missions',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Missions' },
          ],
        },
      },
      {
        path: 'missions/add',
        component: AddMissionComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FLOTTE,
          title: 'Nouvelle mission',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Missions', url: '/apps/missions' },
            { title: 'Nouvelle mission' },
          ],
        },
      },
      {
        path: 'missions/detail/:id',
        component: MissionDetailComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: EXPLOITATION,
          title: 'Détails mission',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Missions', url: '/apps/missions' },
            { title: 'Détails mission' },
          ],
        },
      },

      // ── Utilisateurs ───────────────────────────────────────────────
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: ADMIN_ONLY,
          title: 'Utilisateurs',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Utilisateurs' },
          ],
        },
      },
      {
        path: 'users/add-user',
        component: AddUserComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: ADMIN_ONLY,
          title: 'Nouvel utilisateur',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Utilisateurs', url: '/apps/users' },
            { title: 'Nouvel utilisateur' },
          ],
        },
      },
      {
        path: 'users/details-user/:id',
        component: DetailsUserComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: ADMIN_ONLY,
          title: 'Détails utilisateur',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Utilisateurs', url: '/apps/users' },
            { title: 'Détails utilisateur' },
          ],
        },
      },

      // ── Rapports ───────────────────────────────────────────────────
      {
        path: 'rapports',
        component: RapportsComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FINANCE,
          title: 'Rapports',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Rapports' },
          ],
        },
      },

      // ── Factures ───────────────────────────────────────────────────
      {
        path: 'factures',
        component: FacturesListComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FINANCE,
          title: 'Factures',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Factures' },
          ],
        },
      },
      {
        path: 'factures/add',
        component: AddFactureComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FINANCE,
          title: 'Nouvelle facture',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Factures', url: '/apps/factures' },
            { title: 'Nouvelle facture' },
          ],
        },
      },
      {
        path: 'factures/detail/:id',
        component: DetailsFactureComponent,
        canActivate: [AuthorizationGuard],
        data: {
          roles: FINANCE,
          title: 'Détails facture',
          urls: [
            { title: 'Accueil', url: '/dashboards/dashboard1' },
            { title: 'Factures', url: '/apps/factures' },
            { title: 'Détails facture' },
          ],
        },
      },

    ],
  },
];
