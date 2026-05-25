import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Tableau de bord',
    iconName: 'solar:widget-line-duotone',
    route: '/dashboards/dashboard1',
  },

  // ── Gestion du parc ────────────────────────────────────────────
  {
    navCap: 'Gestion du parc',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
  },
  {
    displayName: 'Engins',
    iconName: 'solar:branching-paths-up-line-duotone',
    route: 'apps/engins',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
    children: [
      {
        displayName: 'Tous les Engins',
        iconName: 'tabler:point',
        route: 'apps/engins',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
      {
        displayName: 'Ajouter un Engin',
        iconName: 'tabler:point',
        route: 'apps/engins/add-engin',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
    ],
  },
  {
    displayName: 'Suivi administratif',
    iconName: 'solar:clapperboard-edit-line-duotone',
    route: 'apps/suivi-administratif',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
    children: [
      {
        displayName: 'Assurances engins',
        iconName: 'tabler:point',
        route: 'apps/engins/assurances-engins',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
      {
        displayName: 'Controles des engins',
        iconName: 'tabler:point',
        route: 'apps/engins/controles-des-engins',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
      {
        displayName: 'Etat des lieux',
        iconName: 'tabler:point',
        route: 'apps/engins/etat-des-lieux',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
    ],
  },
  {
    displayName: 'Suivi technique',
    iconName: 'solar:settings-line-duotone',
    route: 'apps/suivi-technique',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
    children: [
      {
        displayName: 'Maintenance',
        iconName: 'tabler:point',
        route: 'apps/engins/maintenance',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
      {
        displayName: 'Pieces de rechange',
        iconName: 'tabler:point',
        route: 'apps/engins/pieces-de-rechange',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
      {
        displayName: 'Consommation en carburant',
        iconName: 'tabler:point',
        route: 'apps/engins/consommation-carburant',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
    ],
  },

  // ── Exploitation ───────────────────────────────────────────────
  {
    navCap: 'Exploitation',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
  },
  {
    displayName: 'Location',
    iconName: 'solar:document-text-line-duotone',
    route: 'apps/locations',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
    children: [
      {
        displayName: 'Liste des locations',
        iconName: 'tabler:point',
        route: 'apps/locations',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
      },
      {
        displayName: 'Ajouter une location',
        iconName: 'tabler:point',
        route: 'apps/locations/add-location',
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },
  {
    displayName: 'Missions',
    iconName: 'solar:widget-2-line-duotone',
    route: 'apps/missions',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
  },
  {
    displayName: 'Planning et Disponibilites',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/location',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
  },

  // ── Clients ────────────────────────────────────────────────────
  {
    navCap: 'Clients',
    roles: ['ADMIN', 'MANAGER', 'COMPTABLE', 'OPERATEUR'],
  },
  {
    displayName: 'Liste des clients',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/clients',
    roles: ['ADMIN', 'MANAGER', 'COMPTABLE', 'OPERATEUR'],
    children: [
      {
        displayName: 'Liste des clients',
        iconName: 'tabler:point',
        route: 'apps/clients',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE', 'OPERATEUR'],
      },
      {
        displayName: 'Ajouter un client',
        iconName: 'tabler:point',
        route: 'apps/clients/add-client',
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },
  {
    displayName: 'Activités clients',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/clients/activites-clients',
    roles: ['ADMIN', 'MANAGER'],
    children: [
      {
        displayName: 'Liste des activités',
        iconName: 'tabler:point',
        route: 'apps/clients/list-activites',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        displayName: 'Ajouter une activité',
        iconName: 'tabler:point',
        route: 'apps/clients/add-activite',
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },

  // ── Employés ───────────────────────────────────────────────────
  {
    navCap: 'Employés',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
  },
  {
    displayName: 'Conducteurs',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/employe',
    roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
    children: [
      {
        displayName: 'Liste des conducteurs',
        iconName: 'tabler:point',
        route: 'apps/employee',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR', 'COMPTABLE'],
      },
      {
        displayName: 'Ajouter un conducteur',
        iconName: 'tabler:point',
        route: 'apps/employee/add-employee',
        roles: ['ADMIN', 'MANAGER', 'OPERATEUR'],
      },
    ],
  },

  // ── Finance ────────────────────────────────────────────────────
  {
    navCap: 'Finance',
    roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
  },
  {
    displayName: 'Facture',
    iconName: 'solar:bill-list-line-duotone',
    route: 'apps/factures',
    roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
    children: [
      {
        displayName: 'Liste',
        iconName: 'tabler:point',
        route: 'apps/factures',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
      },
      {
        displayName: 'Nouvelle Facture',
        iconName: 'tabler:point',
        route: 'apps/factures/add',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
      },
    ],
  },

  // ── Rapports ───────────────────────────────────────────────────
  {
    navCap: 'Rapports',
    roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
  },
  {
    displayName: 'Rapports',
    iconName: 'solar:chart-line-duotone',
    route: 'apps/rapports',
    roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
    children: [
      {
        displayName: 'Locations sur période',
        iconName: 'tabler:point',
        route: 'apps/rapports',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
      },
      {
        displayName: 'Locations par client',
        iconName: 'tabler:point',
        route: 'apps/rapports',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
      },
      {
        displayName: 'Missions par conducteur',
        iconName: 'tabler:point',
        route: 'apps/rapports',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
      },
      {
        displayName: 'Suivi des impayés',
        iconName: 'tabler:point',
        route: 'apps/rapports',
        roles: ['ADMIN', 'MANAGER', 'COMPTABLE'],
      },
    ],
  },

  // ── Administration ─────────────────────────────────────────────
  {
    navCap: 'Administration',
    roles: ['ADMIN'],
  },
  {
    displayName: 'Utilisateurs',
    iconName: 'solar:chart-line-duotone',
    route: 'apps/users',
    roles: ['ADMIN'],
    children: [
      {
        displayName: 'Liste des utilisateurs',
        iconName: 'tabler:point',
        route: 'apps/users',
        roles: ['ADMIN'],
      },
      {
        displayName: 'Nouvel utilisateur',
        iconName: 'tabler:point',
        route: 'apps/users/add-user',
        roles: ['ADMIN'],
      },
    ],
  },
];
