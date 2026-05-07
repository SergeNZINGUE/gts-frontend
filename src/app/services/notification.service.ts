import { computed, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppNotification } from '../models/app-notification.model';
import { AuthService } from './auth.service';
import { AssurancesService } from './apps/assurances/assurances.service';
import { ControlesVGPService } from './apps/controles-vgp/controles-vgp.service';
import { LocationService } from './apps/location/location.service';
import { MissionsService } from './apps/missions/missions.service';
import { FacturesService } from './apps/factures/factures.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly count = computed(() => this._notifications().length);

  constructor(
    private authService: AuthService,
    private assurancesService: AssurancesService,
    private controlesService: ControlesVGPService,
    private locationService: LocationService,
    private missionsService: MissionsService,
    private facturesService: FacturesService,
  ) {}

  private get isAdmin(): boolean {
    if (this.authService.isAdmin) return true;
    try {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]') as string[];
      return roles.includes('ADMIN');
    } catch {
      return false;
    }
  }

  load(): void {
    const safe = <T>(obs: Observable<T[]>) => obs.pipe(catchError(() => of([] as T[])));

    const sources: Record<string, Observable<any[]>> = {
      locations: safe(this.locationService.getLocations()),
      missions:  safe(this.missionsService.getMissions()),
    };

    if (this.isAdmin) {
      sources['assurances'] = safe(this.assurancesService.getAll());
      sources['controles']  = safe(this.controlesService.getAll());
      sources['factures']   = safe(this.facturesService.getFactures());
    }

    forkJoin(sources).subscribe(data => {
      const now      = new Date();
      const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const in30UTC  = todayUTC + 30 * 86_400_000;
      const notifs: AppNotification[] = [];

      // ── Locations EN ATTENTE (tous rôles) ──────────────────────────
      (data['locations'] as any[])
        .filter(l => l.statut === 'EN ATTENTE')
        .forEach(l => notifs.push({
          id:       `location-${l.id}`,
          type:     'location',
          severity: 'info',
          icon:     'construction',
          title:    'Location en attente',
          subtitle: [l.codeLocation, l.client?.nameClient].filter(Boolean).join(' — '),
          link:     '/apps/locations',
        }));

      // ── Missions EN ATTENTE (tous rôles) ───────────────────────────
      (data['missions'] as any[])
        .filter(m => m.statutMission === 'EN ATTENTE')
        .forEach(m => notifs.push({
          id:       `mission-${m.id}`,
          type:     'mission',
          severity: 'info',
          icon:     'assignment',
          title:    'Mission en attente',
          subtitle: m.codeMission ?? `Mission #${m.id}`,
          link:     '/apps/missions',
        }));

      if (this.isAdmin) {
        // ── Assurances expirant ≤ 30 j (ADMIN) ───────────────────────
        (data['assurances'] as any[]).forEach(a => {
          if (!a.dateFin) return;
          const [y, mo, d] = (a.dateFin as string).split('-').map(Number);
          const t = Date.UTC(y, mo - 1, d);
          if (t < todayUTC) {
            notifs.push({
              id: `assurance-${a.id}`, type: 'assurance', severity: 'danger',
              icon: 'shield', title: 'Assurance expirée',
              subtitle: `Expirée le ${a.dateFin}`,
              link: '/apps/engins/assurances-engins',
            });
          } else if (t <= in30UTC) {
            notifs.push({
              id: `assurance-${a.id}`, type: 'assurance', severity: 'warning',
              icon: 'shield', title: 'Assurance expire bientôt',
              subtitle: `Expire le ${a.dateFin}`,
              link: '/apps/engins/assurances-engins',
            });
          }
        });

        // ── Contrôles VGP expirant ≤ 30 j (ADMIN) ────────────────────
        (data['controles'] as any[]).forEach(c => {
          if (!c.dateProchaineEcheance) return;
          const [y, mo, d] = (c.dateProchaineEcheance as string).split('-').map(Number);
          const t = Date.UTC(y, mo - 1, d);
          if (t < todayUTC) {
            notifs.push({
              id: `visite-${c.id}`, type: 'visite', severity: 'danger',
              icon: 'event_busy', title: 'Visite VGP en retard',
              subtitle: `Échéance dépassée : ${c.dateProchaineEcheance}`,
              link: '/apps/engins/controles-des-engins',
            });
          } else if (t <= in30UTC) {
            notifs.push({
              id: `visite-${c.id}`, type: 'visite', severity: 'warning',
              icon: 'event_busy', title: 'Visite VGP à planifier',
              subtitle: `Prochaine échéance : ${c.dateProchaineEcheance}`,
              link: '/apps/engins/controles-des-engins',
            });
          }
        });

        // ── Factures BROUILLON (ADMIN) ────────────────────────────────
        (data['factures'] as any[])
          .filter(f => f.etatPaiement === 'BROUILLON')
          .forEach(f => notifs.push({
            id:       `facture-${f.id}`,
            type:     'facture',
            severity: 'info',
            icon:     'receipt',
            title:    'Facture en attente',
            subtitle: f.numeroFacture ?? `Facture #${f.id}`,
            link:     '/apps/factures',
          }));
      }

      this._notifications.set(notifs);
    });
  }
}