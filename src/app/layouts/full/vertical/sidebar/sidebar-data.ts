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

  {
    navCap: 'Gestion du parc',
  },
  {
    displayName: 'Engins',
    iconName: 'solar:branching-paths-up-line-duotone',
    route: 'apps/engins',
    children: [
      {
        displayName: 'Tous les Engins',
        iconName: 'tabler:point',
        route: 'apps/engins',
      },
      {
        displayName: 'Ajouter un Engin',
        iconName: 'tabler:point',
        route: 'apps/engins/add-engin',
      },
    ]
  },
  {
    displayName: 'Suivi administratif',
    iconName: 'solar:clapperboard-edit-line-duotone',
    route: 'apps/suivi-administratif',
    children: [
      {
        displayName: 'Assurances engins',
        iconName: 'tabler:point',
        route: 'apps/engins/assurances-engins',
      },
      {
        displayName: 'Controles des engins',
        iconName: 'tabler:point',
        route: 'apps/engins/controles-des-engins',
      },
      {
        displayName: 'Etat des lieux',
        iconName: 'tabler:point',
        route: 'apps/engins/etat-des-lieux',
      },
    ]
  },
  {
    displayName: 'Suivi technique',
    iconName: 'solar:settings-line-duotone',
    route: 'apps/suivi-technique',
    children: [
      {
        displayName: 'Maintenance',
        iconName: 'tabler:point',
        route: 'apps/engins/maintenance',
      },
      {
        displayName: 'Pieces de rechange',
        iconName: 'tabler:point',
        route: 'apps/engins/pieces-de-rechange',
      },
      {
        displayName: 'Consommation en carburant',
        iconName: 'tabler:point',
        route: 'apps/engins/consommation-en-carburant',
      },
    ]
  },

  {
    navCap: 'Exploitation',
  },
  {
    displayName: 'Location',
    iconName: 'solar:document-text-line-duotone',
    route: 'apps/locations',
    children: [
      {
        displayName: 'Liste des locations',
        iconName: 'tabler:point',
        route: 'apps/locations',
      },
      {
        displayName: 'Ajouter une location',
        iconName: 'tabler:point',
        route: 'apps/locations/add-location',
      }
    ]
  },


  {
    displayName: 'Missions',
    iconName: 'solar:widget-2-line-duotone',
    route: 'apps/missions',
  },
  {
    displayName: 'Planning et Disponibilites',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/location',
  },
  {
    navCap: 'Clients',
  },
  {
    displayName: 'Liste des clients',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/clients',
    children: [
      {
        displayName: 'Liste des clients',
        iconName: 'tabler:point',
        route: 'apps/clients',
      },
      {
        displayName: 'Ajouter un client',
        iconName: 'tabler:point',
        route: 'apps/clients/add-client',
      }
    ]
  },

  {
    displayName: 'Activités clients',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/clients/activites-clients',
    children: [
      {
        displayName: 'Liste des activités',
        iconName: 'tabler:point',
        route: 'apps/clients/list-activites',
      },
      {
        displayName: 'Ajouter une activité',
        iconName: 'tabler:point',
        route: 'apps/clients/add-activite',
      }
    ]
  },

  {
    navCap: 'Employés',
  },
  {
    displayName: 'Conducteurs',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/employe',
    children: [
      {
        displayName: 'Liste des conducteurs',
        iconName: 'tabler:point',
        route: 'apps/employee',
      },
      {
        displayName: 'Ajouter un conducteur',
        iconName: 'tabler:point',
        route: 'apps/employee/add-employee',
      }
    ]
  },

  {
    navCap: 'Finance',
  },
  {
    displayName: 'Facture',
    iconName: 'solar:bill-list-line-duotone',
    route: 'apps/factures',
    children: [
      {
        displayName: 'Liste',
        iconName: 'tabler:point',
        route: 'apps/factures',
      },

      {
        displayName: 'Nouvelle Facture',
        iconName: 'tabler:point',
        route: 'apps/factures/add',
      }

    ],
  },
  {
    navCap: 'Rapports',
  },
  {
    displayName: 'Rapports',
    iconName: 'solar:chart-line-duotone',
    route: 'apps/rapports',
    children: [
      {
        displayName: 'Locations sur période',
        iconName: 'tabler:point',
        route: 'apps/rapports',
      },
      {
        displayName: 'Locations par client',
        iconName: 'tabler:point',
        route: 'apps/rapports',
      },
      {
        displayName: 'Missions par conducteur',
        iconName: 'tabler:point',
        route: 'apps/rapports',
      },
      {
        displayName: 'Suivi des impayés',
        iconName: 'tabler:point',
        route: 'apps/rapports',
      },
    ],
  },
  {
    navCap: 'Administration',
  }
];
