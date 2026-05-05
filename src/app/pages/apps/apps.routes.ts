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

export const AppsRoutes: Routes = [
  {
    path: '',
    children: [

      // ── Employés / Conducteurs ──────────────────────────────────────
      {
        path: 'employee',
        component: AppEmployeeComponent,
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
        data: {
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
