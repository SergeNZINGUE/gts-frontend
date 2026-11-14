# TerraOps GTS — Documentation technique

> **Frontend :** Angular 21 (composants standalone, Signals) — dépôt `FrontGTS`
> **Backend :** Spring Boot 4 / Java 21 / MySQL — dépôt `backgts`
> **Hébergement :** Railway (déploiement par GitHub Actions)
> **Mise à jour :** 2026-11-14

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture du frontend](#2-architecture-du-frontend)
3. [Environnements et déploiement](#3-environnements-et-déploiement)
4. [Développement local](#4-développement-local)
5. [Authentification et sécurité](#5-authentification-et-sécurité)
6. [Rôles et droits](#6-rôles-et-droits)
7. [Routes](#7-routes)
8. [Services et API](#8-services-et-api)
9. [Notifications](#9-notifications)
10. [Impression et exports](#10-impression-et-exports)
11. [Navigation et layout](#11-navigation-et-layout)
12. [Backend : points notables](#12-backend--points-notables)
13. [Configuration globale](#13-configuration-globale-appconfigts)
14. [Fonctionnalités en attente](#14-fonctionnalités-en-attente)

---

## 1. Vue d'ensemble

**TerraOps GTS** gère un parc d'engins (mines, BTP) et son exploitation.

| Domaine | Périmètre |
|---|---|
| Parc matériel | Engins (types et familles), assurances, contrôles VGP |
| Suivi technique | Maintenance (fiches, actions, pièces consommées), pièces de rechange (stock, alertes), consommation de carburant |
| Exploitation | Locations, missions (clôture automatique) |
| Ressources humaines | Conducteurs |
| Clients | Clients, activités clients |
| Finance | Factures, règlements |
| Pilotage | Tableau de bord (KPI dépenses), rapports, exports PDF/Excel |
| Administration | Utilisateurs, rôles, journal d'audit (back) |

**Stack frontend :** Angular 21, Angular Material, Tailwind CSS 4, `ngx-toastr`, `ngx-permissions`,
`@ngx-translate/core`, `angular-tabler-icons` + Iconify, ApexCharts, `jspdf` + `jspdf-autotable`, `xlsx`.

---

## 2. Architecture du frontend

```
src/app/
├── app.config.ts            # Providers globaux
├── app.routes.ts            # Routage racine (AuthGuard)
├── material.module.ts       # Barrel des modules Material
├── guards/
│   ├── auth.guard.ts            # Token présent ET non expiré
│   └── authorization.guard.ts   # Rôles requis (route.data.roles)
├── interceptors/
│   └── auth.interceptor.ts      # Bearer + 401 → session expirée, 403 → toast
├── layouts/full/                # Shell (sidebar, header, breadcrumb)
├── models/
├── services/
│   ├── auth.service.ts, core.service.ts, nav.service.ts, notification.service.ts
│   ├── print/print.service.ts       # Facture, proforma, reçu
│   ├── export/export.service.ts     # PDF / Excel
│   └── apps/                        # Un service par domaine (voir §8)
└── pages/
    ├── authentication/   # Login, mot de passe oublié, 2 étapes
    ├── dashboards/       # dashboard1 (principal)
    └── apps/             # Modules métier (voir §7)
```

---

## 3. Environnements et déploiement

| Environnement | Fichier | `apiUrl` | Branche Git |
|---|---|---|---|
| Développement | `environment.ts` | `http://localhost:8081` | — |
| Homologation | `environment.homol.ts` | `https://gts-backend-homologation.up.railway.app` | `homologation` |
| Production | `environment.prod.ts` | `https://gts-backend-production.up.railway.app` | `main` |

**CI/CD :** `.github/workflows/deploy.yml` lance `railway up --service gts-frontend` à chaque push sur
`main`, `homologation` ou `dev`, avec le jeton Railway propre à chaque environnement.

**Image Docker du front** (`Dockerfile`, `Dockerfile.prod`, `Dockerfile.homol`) :
1. `node:22-alpine` : `npm ci` (à partir de `package-lock.json`), puis `npm run build -- --configuration=<env>`.
2. `nginx:alpine` : sert `dist/Modernize/browser` avec `nginx.conf` (SPA + relais `/api/`).

> **Gestionnaire de paquets : npm uniquement.** `pnpm-lock.yaml` a été supprimé.
> `package.json` et `package-lock.json` doivent rester synchronisés, sinon `npm ci` échoue sur Railway :
> après tout ajout ou mise à jour de dépendance, commiter les deux fichiers ensemble.

`.dockerignore` exclut `node_modules`, `dist`, `.angular`, `.git` : un build local n'embarque jamais
les dépendances de la machine hôte.

---

## 4. Développement local

Le poste de dev (Windows 11 ARM) bloque l'exécution de binaires non signés (`esbuild`, `tailwindcss-oxide`),
ce qui empêche `ng serve` de compiler correctement. **Le front tourne donc dans un conteneur Docker Linux :**

```powershell
cd C:\Users\serge\IdeaProjects\FrontGTS
docker run --rm -it -p 4300:4200 -v "${PWD}:/app" -v gts_front_modules:/app/node_modules -w /app node:22 `
  sh -c "npm install && npx ng serve --host 0.0.0.0 --poll 2000"
```

- Application : `http://localhost:4300` (le port 4200 est souvent occupé).
- Le volume `gts_front_modules` garde des dépendances Linux séparées du `node_modules` Windows.
- `--poll 2000` détecte les modifications faites depuis Windows.
- Le back tourne dans IntelliJ (profil `dev`, port 8081, MySQL WAMP `db_gts`).
  `app.cors.allowed-origins` (dans `application-dev.properties`) doit contenir `http://localhost:4300`.

---

## 5. Authentification et sécurité

### `AuthService` (`services/auth.service.ts`)

| Méthode | Endpoint | Rôle |
|---|---|---|
| `login(username, password)` | `POST /api/gts/auth/login` | Stocke `token`, `username`, `roles` dans le localStorage et charge `ngx-permissions` |
| `restoreSession()` | — | Relit le localStorage au démarrage (`APP_INITIALIZER`) |
| `forgotPassword(email)` | `POST /api/gts/emails/forgot-password` | Envoie un code par e-mail |
| `resetPassword(email, code, pwd)` | `POST /api/gts/emails/` | Réinitialise le mot de passe |
| `sessionExpired()` | — | Vide la session, affiche un toast, redirige vers le login |
| `logout()` | — | Vide la session |

### `AuthGuard` (toutes les routes sous le layout principal)
- Exige un `token` **et** un `username` dans le localStorage ; sinon, redirection vers `/authentication/login`.
- Décode le champ `exp` du JWT : si le token est expiré ou illisible, appelle `sessionExpired()`.

### `AuthorizationGuard`
- Exige un token, puis compare `route.data.roles` aux rôles stockés.
- Si l'utilisateur n'a pas le rôle : toast « Accès refusé » et redirection vers `/dashboards/dashboard1`.

### `AuthInterceptor`
- Ajoute `Authorization: Bearer <token>` à chaque requête.
- **401**, ou statut `0` alors qu'un token existe (CORS sur token expiré) → `sessionExpired()`.
- **403** → toast « Accès refusé », sans déconnexion (désactivable par requête via le `HttpContextToken` `BYPASS_403`).
- Les erreurs de `/auth/login` sont laissées au composant de login.

### Côté back
- JWT sans état (`JwtAuthenticationFilter`), mots de passe en BCrypt, durée de validité `jwt.expiration` (4 h).
- Contrôle d'accès à deux niveaux : règles par URL (`SecurityConfig`) et `@PreAuthorize` sur les contrôleurs.
- Un refus `@PreAuthorize` renvoie **403** (handler `AccessDeniedException` dans `GlobalExceptionHandler`).
  Auparavant, ce refus tombait dans le handler générique et renvoyait une 500.
- Les starters non utilisés ont été retirés : **data-rest** (il exposait automatiquement tous les repositories
  JPA, dont `Users`, à la racine de l'API), data-ldap, ldap, graphql, h2.

### Nginx (`nginx.conf`)
- Relais `/api/` vers le back de production avec **vérification TLS** activée
  (`proxy_ssl_verify on`, bundle CA d'Alpine installé dans l'image).
- L'app appelle le back directement via `environment.apiUrl`. Le relais `/api/` ne sert qu'aux URL relatives.
  Attention : l'image d'homologation relaie elle aussi vers la **production**.

---

## 6. Rôles et droits

| Rôle | Périmètre |
|---|---|
| `ADMIN` | Tout, y compris utilisateurs, rôles, types d'engins, audit |
| `MANAGER` | Flotte, exploitation, clients, finance |
| `OPERATEUR` | Flotte et exploitation (pas de finance) |
| `COMPTABLE` | Finance, rapports, lecture des locations, missions, conducteurs et carburant |

Groupes utilisés dans `apps.routes.ts` :

| Constante | Rôles |
|---|---|
| `FLOTTE` | ADMIN, MANAGER, OPERATEUR |
| `FLOTTE_LECTURE` / `EXPLOITATION` | ADMIN, MANAGER, OPERATEUR, COMPTABLE |
| `FINANCE` | ADMIN, MANAGER, COMPTABLE |
| `ADMIN_MANAGER` | ADMIN, MANAGER |
| `ADMIN_ONLY` | ADMIN |

Le menu (`sidebar-data.ts`) masque chaque entrée selon le champ `roles`. Côté back, `SecurityConfig` et
`@PreAuthorize` restent les garants des droits.

---

## 7. Routes

Routage racine : `/` → login ; `/dashboards/**` et `/apps/**` (avec `AuthGuard`) ; `/authentication/**` (layout vide) ; `**` → page d'erreur.

Toutes les routes `/apps/**` passent par `AuthorizationGuard`.

| Route | Composant | Rôles |
|---|---|---|
| `apps/engins` | Liste des engins (KPI, filtres, voir / **modifier** / supprimer) | FLOTTE |
| `apps/engins/add-engin` | Formulaire engin (création) | FLOTTE |
| `apps/engins/edit-engin/:id` | Même formulaire en mode modification | FLOTTE |
| `apps/engins/details-engins/:id` | Détail engin | FLOTTE |
| `apps/engins/assurances-engins` | Assurances | FLOTTE |
| `apps/engins/controles-des-engins` | Contrôles VGP | FLOTTE |
| `apps/engins/maintenance` (`/add`, `/edit/:id`, `/:id`) | Fiches de maintenance | FLOTTE |
| `apps/engins/pieces-de-rechange` | Stock, alertes, ajustement | FLOTTE |
| `apps/engins/consommation-carburant` | Rapport carburant | FLOTTE + COMPTABLE |
| `apps/locations` (`/add-location`, `/details-location/:id`) | Locations | EXPLOITATION (création : ADMIN_MANAGER) |
| `apps/missions` (`/add`, `/detail/:id`) | Missions | EXPLOITATION (création : FLOTTE) |
| `apps/employee` (`/add-employee`, `/details-employee/:id`) | Conducteurs | FLOTTE_LECTURE (création : FLOTTE) |
| `apps/clients` (`/add-client`, `/details-client/:id`) | Clients | ADMIN_MANAGER + COMPTABLE, OPERATEUR |
| `apps/clients/activites` | **Activités clients** (liste, création, modification) | ADMIN_MANAGER |
| `apps/factures` (`/add`, `/detail/:id`) | Factures | FINANCE |
| `apps/rapports` | Rapports (onglets) | FINANCE |
| `apps/users` (`/add-user`, `/details-user/:id`) | Utilisateurs | ADMIN_ONLY |

---

## 8. Services et API

Tous les services métier envoient le header Bearer et utilisent `environment.apiUrl`.

| Service (front) | Base API | Opérations |
|---|---|---|
| `EnginService` | `/api/gts/engins` | CRUD (`PUT /{id}` pour la modification) |
| `TypesEnginsService` | `/api/gts/types-engins` | `GET /actifs` (types et familles) |
| `AssurancesService` | `/api/gts/assurances` | CRUD par engin |
| `ControlesVGPService` | `/api/gts/controles-vgp` | CRUD par engin |
| `MaintenanceService` | `/api/gts/maintenance` | Liste paginée, `GET /engin/{id}`, CRUD |
| `PiecesRechangeService` | `/api/gts/pieces-rechange` | CRUD, `GET /en-alerte`, `PATCH /{id}/stock?delta=` |
| `CarburantReportingService` | `/api/gts/reporting/carburant` | Rapport global, `GET /engin/{id}`, `GET /missions` |
| `LocationService` | `/api/gts/locations` | Liste, création, `PUT /{id}/valider`, `PUT /{id}/terminer` |
| `MissionsService` | `/api/gts/missions` | CRUD, `PUT /{id}/terminer`, `PATCH /{id}/cloturer` |
| `EmployeeService` | `/api/gts/conducteurs` | CRUD + images |
| `ClientsService` | `/api/gts/clients` | CRUD + logo |
| `ActiviteClientService` | `/api/gts/activite-client` | `GET /list` ; `POST ?codeActivite=&libelleActivite=` ; `PUT /updateActiviteClients/{code}?libelleActivite=` |
| `FacturesService` | `/api/gts/factures` | CRUD, état de paiement |
| `ReglementsService` | `/api/gts/reglements` | Création, liste par facture |
| `ReportingService` | `/api/gts/reporting` | Locations par période / par client, missions par conducteur, impayés |
| `DashboardService` | `/api/gts/dashboard` | `GET /kpi-depenses?annee=` |
| `UsersService` | `/api/gts/users` | CRUD, activation, code de vérification |

**Activités clients.** Le code est mis en majuscules, unique (409 si doublon) et non modifiable après création.
Le back renseigne `dateCreation` à la création et `dateModification` à la mise à jour.

---

## 9. Notifications

`NotificationService` (Signals) est chargé depuis le header. Il agrège plusieurs sources avec `forkJoin` ;
chaque source a un `catchError(() => of([]))`, donc une source en panne ne bloque pas les autres.

| Condition | Rôle | Sévérité |
|---|---|---|
| Location ou mission `EN ATTENTE` | Tous | info |
| Assurance expirée / expire sous 30 j | ADMIN | danger / warning |
| Contrôle VGP dépassé / sous 30 j | ADMIN | danger / warning |
| Facture `BROUILLON` | ADMIN | info |

---

## 10. Impression et exports

- `PrintService` : facture proforma, facture définitive, reçu de paiement (montants en FCFA, HTVA / TVA 18 % / TTC).
- `ExportService` : `exportPdf(title, filename, headers, rows, foot?)` (jsPDF + autotable) et
  `exportExcel(filename, headers, rows)` (xlsx). Utilisé par les rapports et les listes.

---

## 11. Navigation et layout

`layouts/full/vertical/sidebar/sidebar-data.ts` :

```
Home            → Tableau de bord
Gestion du parc → Engins (liste, ajout)
                  Suivi administratif (assurances, contrôles)
                  Suivi technique (maintenance, pièces, carburant)
Exploitation    → Locations, Missions
Clients         → Liste des clients, Activités clients
Employés        → Conducteurs
Finance         → Factures
Rapports        → Rapports
Administration  → Utilisateurs
```

Le header contient les notifications, le profil (username, rôle, déconnexion), le thème clair/sombre et la langue.
Le breadcrumb lit `route.data.title` et `route.data.urls`.

---

## 12. Backend : points notables

- **Organisation :** `com.gts.backgts` → `configuration`, `dto` (records Java), `entites`, `enums`, `exceptions`,
  `repository`, `services`, `web`.
- **Profils :** `dev` (MySQL local, port 8081), `homol`, `prod`, `docker`.
- **Missions :** statut piloté par le back (`StatutMission`, `ModeCloture`) ; le `MissionScheduler`
  (`@Scheduled(cron = "0 30 23 * * *")`) clôture automatiquement chaque soir ; contrôle des conflits de conducteur.
- **Engins :** héritage (Camion, Pelle, Foreuse, Grue, Tombereau minier) ; `TypeEngin` + `FamilleEngin` ;
  statuts `TypeEtatEngins` = `DISPONIBLE`, `EN_MISSION`, `EN_COURS_DE_REPARATION`, `HORS_SERVICE`.
- **Audit :** `AuditAspect` (`@Around` sur `com.gts.backgts.web.*`) → `AuditLog`, consultable via
  `GET /api/gts/audit` (ADMIN).
- **Erreurs :** `GlobalExceptionHandler` → JSON `{ "error": "..." }`.
  `IllegalArgumentException` → 404, `ResponseStatusException` → son propre statut,
  `AccessDeniedException` → 403, validation → 400, autres → 500.
- **E-mails :** Gmail SMTP + modèles Thymeleaf (`templates/emails`).
- **API docs :** Swagger UI sur `/swagger-ui.html`.

---

## 13. Configuration globale (`app.config.ts`)

| Provider | Rôle |
|---|---|
| `provideRouter(...)` | Routeur (scroll en mémoire, binding des inputs de composant) |
| `provideHttpClient(withInterceptorsFromDi())` + `AuthInterceptor` | HTTP + auth |
| `APP_INITIALIZER` | Restauration de session |
| `provideAnimationsAsync()`, `provideToastr()`, `provideNativeDateAdapter()` | UI |
| `NgxPermissionsModule`, `TranslateModule`, `TablerIconsModule`, `NgScrollbarModule`, `CalendarModule` | Modules tiers |
| `provideClientHydration()` | Inutile sans SSR (warning `NG0505` en console) — à retirer |

---

## 14. Fonctionnalités en attente

| Élément | État |
|---|---|
| **État des lieux** | API back complète (`/api/gts/etats-des-lieux`, multipart avec photo) ; pas encore d'écran ; entrée de menu masquée (TODO dans `sidebar-data.ts`) |
| **Planning & Disponibilités** | Ni API ni écran ; entrée de menu masquée |
| Pastilles de statut (liste des engins) | `getStatusClass` utilise d'anciens libellés : tout s'affiche en gris sauf « Disponible » |
| Écrans squelettes | `reglements`, `dashboard2`, `missions.component`, `factures.component` (conteneurs vides) |
| Restes du template « Modernize » | Images de démo à purger (`find-unused-images.ps1`), nom du package et `outputPath` |

---

*Document mis à jour le 2026-11-14 — TerraOps*
