import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statutLabel', standalone: true })
export class StatutLabelPipe implements PipeTransform {
  private readonly labels: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    EN_COURS:   'En cours',
    TERMINEE:   'Terminée',
    VALIDEE:    'Validée',
    ANNULEE:    'Annulée',
  };

  transform(value: string | undefined | null): string {
    if (!value) return '';
    return this.labels[value] ?? value;
  }
}