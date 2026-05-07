import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/config';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';
import { NgIf } from '@angular/common';

interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];

  @Output() optionsChange = new EventEmitter<AppSettings>();

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    public authService: AuthService,
    public notificationService: NotificationService,
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.notificationService.load();
  }

  options = this.settings.getOptions();

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }

  setlightDark(theme: string) {
    this.options.theme = theme;
    this.emitOptions();
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  severityConfig: Record<string, { bg: string; text: string }> = {
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    danger:  { bg: 'bg-red-100',    text: 'text-red-600'    },
    info:    { bg: 'bg-blue-100',   text: 'text-blue-600'   },
  };

  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/apps/email/inbox',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/apps/taskboard',
    },
  ];

  apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-user-male.svg',
      title: 'Conducteurs',
      subtitle: 'Gestion des conducteurs',
      link: '/apps/employee',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-office-bag.svg',
      title: 'Engins',
      subtitle: 'Parc matériel',
      link: '/apps/engins',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'Clients',
      subtitle: 'Gestion des clients',
      link: '/apps/clients',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Locations',
      subtitle: "Locations d'engins",
      link: '/apps/locations',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'Missions',
      subtitle: 'Suivi des missions',
      link: '/apps/missions',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Factures',
      subtitle: 'Facturation & paiements',
      link: '/apps/factures',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-pie.svg',
      title: 'Rapports',
      subtitle: 'Analyses & statistiques',
      link: '/apps/rapports',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-connect.svg',
      title: 'Utilisateurs',
      subtitle: 'Gestion des comptes',
      link: '/apps/users',
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Tableau de bord',
      link: '/dashboards/dashboard1',
    },
    {
      id: 2,
      title: 'Conducteurs',
      link: '/apps/employee',
    },
    {
      id: 3,
      title: 'Engins',
      link: '/apps/engins',
    },
    {
      id: 4,
      title: 'Clients',
      link: '/apps/clients',
    },
    {
      id: 5,
      title: 'Locations',
      link: '/apps/locations',
    },
    {
      id: 6,
      title: 'Missions',
      link: '/apps/missions',
    },
    {
      id: 7,
      title: 'Factures',
      link: '/apps/factures',
    },
    {
      id: 8,
      title: 'Utilisateurs',
      link: '/apps/users',
    },
  ];

  protected logout() {
  this.authService.logout();

  }
}

@Component({
  selector: 'search-dialog',
  imports: [RouterModule, MaterialModule, TablerIconsModule, FormsModule],
  templateUrl: 'search-dialog.component.html'
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);


}
