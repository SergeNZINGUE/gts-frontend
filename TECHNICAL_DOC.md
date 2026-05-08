# TerraOps GTS — Documentation Technique

> **Version :** Angular 19+ (standalone components)
> **Backend :** Spring Boot — Railway.app
> **Date :** 2026-05-07

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Environnements](#3-environnements)
4. [Authentification & Sécurité](#4-authentification--sécurité)
5. [Guards](#5-guards)
6. [Intercepteur HTTP](#6-intercepteur-http)
7. [Modules & Routes](#7-modules--routes)
8. [Services](#8-services)
9. [Notifications](#9-notifications)
10. [Impression](#10-impression)
11. [Navigation & Layout](#11-navigation--layout)
12. [Modèles de données](#12-modèles-de-données)
13. [Configuration globale](#13-configuration-globale)

---

## 1. Vue d'ensemble

**TerraOps GTS** est une application web de gestion de parc matériel et de transport. Elle couvre :

| Domaine | Périmètre |
|---|---|
| Parc matériel | Engins, assurances, contrôles VGP |
| Exploitation | Locations, missions, planning |
| Ressources humaines | Conducteurs (employés) |
| Finance | Clients, factures, règlements |
| Rapports | Analyses par période, client, conducteur |
| Administration | Utilisateurs, rôles, accès |

**Stack technique :**
- Angular 19+ (composants standalone, Signals)
- Angular Material + Tailwind CSS
- `ngx-toastr` pour les notifications toast
- `ngx-scrollbar` pour les scrollbars personnalisées
- `angular-tabler-icons` + Iconify pour les icônes
- `@ngx-translate/core` pour l'internationalisation
- `ngx-permissions` pour la gestion des droits

---

## 2. Architecture

```
src/app/
├── app.config.ts          # Bootstrap, providers globaux
├── app.routes.ts          # Routage racine + AuthGuard
├── config.ts              # Interface AppSettings
├── material.module.ts     # Barrel des imports Material
│
├── guards/
│   ├── auth.guard.ts          # Vérifie la session (localStorage)
│   └── authorization.guard.ts # Vérifie le rôle ADMIN
│
├── interceptors/
│   └── auth.interceptor.ts    # Gestion expiration token (401/403/CORS)
│
├── layouts/
│   └── full/
│       ├── full.component.*       # Shell principal (sidenav, header)
│       ├── vertical/
│       │   ├── header/            # Toolbar desktop
│       │   └── sidebar/           # Sidebar + données de navigation
│       ├── horizontal/            # Layout alternatif horizontal
│       └── shared/
│           ├── breadcrumb/        # Breadcrumb + title service
│           └── customizer/        # Panneau de personnalisation du thème
│
├── models/
│   └── app-notification.model.ts
│
├── services/
│   ├── auth.service.ts
│   ├── core.service.ts
│   ├── nav.service.ts
│   ├── notification.service.ts
│   ├── print.service.ts
│   └── apps/
│       ├── activite-client/
│       ├── assurances/
│       ├── clients/
│       ├── controles-vgp/
│       ├── employee/
│       ├── engin/
│       ├── factures/
│       ├── location/
│       ├── missions/
│       ├── reglements/
│       ├── reporting/
│       └── users/
│
└── pages/
    ├── authentication/    # Login, forgot password, 2FA
    ├── dashboards/        # Tableau de bord
    └── apps/              # Tous les modules métier
        ├── employee/
        ├── engins/
        ├── clients/
        ├── locations/
        ├── missions/
        ├── factures/
        ├── rapports/
        └── users/
```

---

## 3. Environnements

| Environnement | Fichier | `apiUrl` |
|---|---|---|
| Développement | `environment.ts` | `http://localhost:8081` |
| Homologation | `environment.homol.ts` | `https://gts-backend-homologation.up.railway.app` |
| Production | `environment.prod.ts` | `https://gts-backend-production.up.railway.app` |

---

## 4. Authentification & Sécurité

### Service : `AuthService`

Fichier : `src/app/services/auth.service.ts`

**Propriétés d'état :**

| Propriété | Type | Description |
|---|---|---|
| `isLoggedIn` | `boolean` | Session active |
| `isAdmin` | `boolean` | Rôle ADMIN détecté |
| `role` | `string[]` | Liste des rôles de l'utilisateur |
| `username` | `string` | Identifiant connecté |

**Méthodes :**

| Méthode | Endpoint | Description |
|---|---|---|
| `login(username, password)` | `POST /api/gts/auth/login` | Authentification, stockage token/rôles |
| `forgotPassword(email)` | `POST /api/gts/emails/forgot-password` | Envoi code par email |
| `resetPassword(email, code, newPassword)` | `POST /api/gts/emails/` | Réinitialisation mot de passe |
| `sessionExpired()` | — | Efface le localStorage, redirige vers login avec toastr warning |
| `logout()` | — | Efface l'état et le localStorage |

**Persistance localStorage :**

```
token      → JWT Bearer token
username   → identifiant utilisateur
roles      → JSON.stringify(string[])
```

> Les rôles sont relus depuis `localStorage` lors du rechargement de page pour maintenir l'état `isAdmin` et les notifications sans redemander un login.

### Flux de connexion

```
Login form
  → POST /api/gts/auth/login
  → tap(): isLoggedIn=true, username, token, roles → localStorage
  → navigate('/dashboards/dashboard1')

Erreur 401/403:
  → authError = 'Identifiant ou mot de passe incorrect.'

Page refresh:
  → AuthGuard vérifie localStorage.getItem('username')
  → NotificationService relit localStorage.getItem('roles') pour isAdmin
```

---

## 5. Guards

### `AuthGuard`

Fichier : `src/app/guards/auth.guard.ts`

- **Vérifie :** `localStorage.getItem('username')` non nul
- **Si absent :** redirige vers `/authentication/login`
- **Appliqué sur :** toutes les routes sous `FullComponent` (layout principal)

### `AuthorizationGuard`

Fichier : `src/app/guards/authorization.guard.ts`

- **Vérifie :** rôle `ADMIN` dans `authService.role` + données de route
- **Si non autorisé :** redirige vers `/authentication/login`
- **Usage :** routes d'administration réservées aux admins

---

## 6. Intercepteur HTTP

Fichier : `src/app/interceptors/auth.interceptor.ts`

Enregistré dans `app.config.ts` via `HTTP_INTERCEPTORS`.

**Logique :**

```
Chaque requête HTTP sortante passe par l'intercepteur.
Sur erreur :
  - Si endpoint = /auth/login → ne pas intercepter (laisser passer au composant)
  - Si status === 401 ou 403 → token expiré → authService.sessionExpired()
  - Si status === 0 ET localStorage contient un token
      → CORS causé par un token expiré → authService.sessionExpired()
  - Sinon → throwError() vers l'appelant
```

> Le cas `status === 0` permet de distinguer une vraie erreur réseau d'une requête bloquée par CORS suite à un token expiré côté backend.

---

## 7. Modules & Routes

### Routage racine (`app.routes.ts`)

```
/                     → redirect → /authentication/login
/dashboards/**        → DashboardsRoutes  (AuthGuard)
/apps/**              → AppsRoutes        (AuthGuard)
/authentication/**    → AuthenticationRoutes (layout blank)
/**                   → /authentication/error
```

### Authentication (`authentication.routes.ts`)

| Route | Composant | Description |
|---|---|---|
| `login` | `AppSideLoginComponent` | Page de connexion principale |
| `boxed-login` | `AppBoxedLoginComponent` | Variante connexion encadrée |
| `side-forgot-pwd` | `AppSideForgotPasswordComponent` | Étape 1 : saisie email |
| `side-two-steps` | `AppSideTwoStepsComponent` | Étape 2 : code + nouveau mot de passe |
| `side-register` | `AppSideRegisterComponent` | Inscription (désactivée en prod) |
| `error` | `AppErrorComponent` | Page 404 |
| `maintenance` | `AppMaintenanceComponent` | Page maintenance |

**Flux mot de passe oublié :**
```
side-forgot-pwd → saisie email → POST /forgot-password
  → navigate('side-two-steps', { state: { email } })
  → saisie code 6 chiffres (auto-avance) + nouveau mot de passe
  → POST /emails/ (reset)
  → navigate('login')
```

### Dashboards (`dashboards.routes.ts`)

| Route | Composant | Description |
|---|---|---|
| `dashboard1` | `AppDashboard1Component` | Tableau de bord principal (KPIs, statistiques) |
| `dashboard2` | `AppDashboard2Component` | Dashboard secondaire |

### Applications métier (`apps.routes.ts`)

#### Conducteurs (Employés)

| Route | Description |
|---|---|
| `apps/employee` | Liste des conducteurs |
| `apps/employee/add-employee` | Ajout conducteur |
| `apps/employee/details-employee/:id` | Détail / édition conducteur |

#### Engins (Parc matériel)

| Route | Description |
|---|---|
| `apps/engins` | Liste des engins |
| `apps/engins/add-engin` | Ajout engin |
| `apps/engins/details-engins/:id` | Détail / édition engin |
| `apps/engins/assurances-engins` | Suivi des assurances |
| `apps/engins/controles-des-engins` | Suivi des contrôles VGP |

#### Clients

| Route | Description |
|---|---|
| `apps/clients` | Liste des clients |
| `apps/clients/add-client` | Ajout client |
| `apps/clients/details-client/:id` | Détail / édition client |

#### Locations

| Route | Description |
|---|---|
| `apps/locations` | Liste des locations |
| `apps/locations/add-location` | Nouvelle location |
| `apps/locations/details-location/:id` | Détail location + validation |

#### Missions

| Route | Description |
|---|---|
| `apps/missions` | Liste des missions |
| `apps/missions/add` | Nouvelle mission |
| `apps/missions/detail/:id` | Détail mission |

#### Factures

| Route | Description |
|---|---|
| `apps/factures` | Liste des factures |
| `apps/factures/add` | Nouvelle facture |
| `apps/factures/detail/:id` | Détail facture + impression |

#### Rapports

| Route | Description |
|---|---|
| `apps/rapports` | Rapports et analyses |

#### Utilisateurs (Administration)

| Route | Description |
|---|---|
| `apps/users` | Liste des utilisateurs |
| `apps/users/add-user` | Création utilisateur (avec choix de rôle) |
| `apps/users/details-user/:id` | Détail / édition utilisateur |

---

## 8. Services

### `CoreService`

Fichier : `src/app/services/core.service.ts`

- Gestion des options de thème (`AppSettings`) via Signals
- Fournit `getHeaders()` → `{ Authorization: 'Bearer <token>' }` depuis localStorage
- Validateurs de dates : `futureDate`, `pastDate`, `todayOrFutureDate`
- Formatage de dates

### `NavService`

Fichier : `src/app/services/nav.service.ts`

- Suivi de l'URL active via Signal
- Utilisé par la sidebar pour marquer l'item courant

### `NotificationService`

Voir section [9. Notifications](#9-notifications).

### `PrintService`

Fichier : `src/app/services/print.service.ts`

- Génération et impression de documents PDF/HTML
- Types supportés : facture proforma, facture définitive, reçu de paiement
- Formatage en français (montants, dates)

### Services métier

| Service | Endpoints principaux |
|---|---|
| `ClientsService` | CRUD clients + images |
| `EmployeeService` | CRUD conducteurs + images |
| `EnginService` | CRUD engins |
| `AssurancesService` | CRUD assurances par engin |
| `ControlesVGPService` | CRUD contrôles VGP par engin |
| `LocationService` | CRUD locations + validation statut |
| `MissionsService` | CRUD missions + mise à jour complétion |
| `FacturesService` | CRUD factures + changement état paiement |
| `ReglementsService` | Création règlement, liste par facture |
| `UsersService` | CRUD utilisateurs + toggle actif + envoi code vérification |
| `ReportingService` | Locations par période/client, missions par conducteur, impayés |
| `ActiviteClientService` | Historique activités client |

Tous les services métier :
- Injectent `CoreService` pour obtenir les headers Bearer
- Communiquent avec `environment.apiUrl`
- Retournent des `Observable<T>` typés

---

## 9. Notifications

Fichier : `src/app/services/notification.service.ts`
Modèle : `src/app/models/app-notification.model.ts`

### Architecture

Basé sur les **Angular Signals** :

```typescript
private readonly _notifications = signal<AppNotification[]>([]);
readonly notifications = this._notifications.asReadonly();
readonly count = computed(() => this._notifications().length);
```

Appelé depuis `HeaderComponent.ngOnInit()` → `notificationService.load()`.

### Règles de chargement (role-based)

| Condition | Rôle requis | Sévérité | Icône |
|---|---|---|---|
| Location `EN ATTENTE` | Tous | `info` | `construction` |
| Mission `EN ATTENTE` | Tous | `info` | `assignment` |
| Assurance expirée | ADMIN | `danger` | `shield` |
| Assurance expire ≤ 30 j | ADMIN | `warning` | `shield` |
| Contrôle VGP dépassé | ADMIN | `danger` | `event_busy` |
| Contrôle VGP ≤ 30 j | ADMIN | `warning` | `event_busy` |
| Facture `BROUILLON` | ADMIN | `info` | `receipt` |

### Détection du rôle ADMIN

```typescript
private get isAdmin(): boolean {
  if (this.authService.isAdmin) return true;        // En mémoire
  try {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    return roles.includes('ADMIN');                  // Après refresh
  } catch { return false; }
}
```

### Résilience

Chaque source utilise `catchError(() => of([]))` dans un `forkJoin` — la défaillance d'un endpoint n'empêche pas le chargement des autres notifications.

### Affichage dans le header

- Badge rouge sur l'icône cloche (caché si count = 0)
- Menu déroulant avec couleur selon sévérité (`severityConfig`)
- Lien direct vers le module concerné

---

## 10. Impression

Fichier : `src/app/services/print.service.ts`

Types de documents imprimables :

| Type | Description |
|---|---|
| Facture proforma | Devis avant validation |
| Facture définitive | Facture émise et validée |
| Reçu de paiement | Confirmation de règlement |

Formatage français : montants en FCFA, dates localisées.

---

## 11. Navigation & Layout

### Layout principal (`FullComponent`)

Fichier : `src/app/layouts/full/full.component.*`

- **Sidebar desktop** : fixe, collapsable, affiche username + rôle en bas
- **Sidebar mobile** : mode `over`, s'ouvre au clic hamburger
- **Responsive** : breakpoints MOBILE (≤768px), TABLET (769-1024px), MONITOR (>1024px)
- **Thème** : toggle dark/light, couleurs d'accentuation via `CoreService`

### Sidebar — données de navigation

Fichier : `src/app/layouts/full/vertical/sidebar/sidebar-data.ts`

```
Home
  └─ Tableau de bord

Gestion du parc
  └─ Engins
      ├─ Suivi administratif
      │   ├─ Assurances engins
      │   └─ Controles des engins
      └─ Suivi technique
          ├─ Maintenance
          ├─ Pièces de rechange
          └─ Consommation carburant

Exploitation
  ├─ Locations
  ├─ Missions
  └─ Planning & Disponibilités

Clients
  ├─ Liste des clients
  └─ Activités clients

Employés
  └─ Conducteurs

Finance
  └─ Factures

Rapports

Administration
  └─ Utilisateurs
```

### Header (`HeaderComponent`)

- **Toolbar desktop** : menu Apps (8 modules), Quicklinks, boutons Tableau de bord / Locations / Missions
- **Toolbar mobile** : icône menu contextuel
- **Profil** : visible si `authService.isLoggedIn`, affiche username + rôle + bouton logout
- **Notifications** : badge + menu déroulant (voir section 9)
- **Thème** : toggle lune/soleil
- **Langue** : sélecteur de langue (EN/ES/FR/DE)

### Breadcrumb

Fichier : `src/app/layouts/full/shared/breadcrumb/breadcrumb.component.ts`

- Lit `route.data.title` à chaque navigation
- Met à jour le `Title` du navigateur via `TitleService`

---

## 12. Modèles de données

### `AppNotification`

```typescript
export type NotificationType = 'assurance' | 'visite' | 'location' | 'mission' | 'facture';
export type NotificationSeverity = 'warning' | 'danger' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  icon: string;
  title: string;
  subtitle: string;
  link: string;
}
```

### `UserRequest` / `RegisterRequest`

```typescript
export interface UserRequest {
  username: string; nomUsers: string; prenomsUsers: string;
  emailUsers: string; tel1Users: string;
  active: boolean; cguUsers: boolean; roleCode: string;
}
export interface RegisterRequest extends UserRequest {
  password: string;
}
```

### `UserResponse`

```typescript
export interface UserResponse {
  id: number; username: string; active: boolean;
  nomUsers: string; prenomsUsers: string;
  emailUsers: string; tel1Users: string;
  cguUsers: boolean; dateCreation: string;
  dateModification: string; roles: string[];
}
```

---

## 13. Configuration globale

Fichier : `src/app/app.config.ts`

**Providers enregistrés :**

| Provider | Description |
|---|---|
| `provideRouter(routes, withInMemoryScrolling(), withComponentInputBinding())` | Routeur Angular |
| `provideHttpClient(withInterceptorsFromDi())` | Client HTTP avec support intercepteurs DI |
| `{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }` | Intercepteur auth |
| `provideAnimationsAsync()` | Animations Material asynchrones |
| `provideToastr()` + `ToastrModule.forRoot()` | Notifications toast |
| `provideNativeDateAdapter()` | Adaptateur date Material |
| `NgxPermissionsModule.forRoot()` | Gestion permissions granulaires |
| `TablerIconsModule.pick(TablerIcons)` | Icônes Tabler (subset) |
| `TranslateModule.forRoot(CustomLoader)` | i18n |
| `NgScrollbarModule` | Scrollbars personnalisées |
| `CalendarModule.forRoot(adapterFactory)` | Composant calendrier |
| `provideClientHydration()` | SSR hydratation |

---

*Document généré le 2026-05-07 — TerraOps*
