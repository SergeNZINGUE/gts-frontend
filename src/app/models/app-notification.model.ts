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