import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Facture } from 'src/app/pages/apps/factures/facture';
import { Reglement } from 'src/app/pages/apps/factures/reglement';

const CO = {
  nom: 'OUEDRAOGO Marcelin',
  activite: "Location d'engins et services divers",
  adresse: 'Secteur 52, Arr. 8 — Ouagadougou',
  rccm: 'BF-OUA-01-2024-B12-00123',
  ifu: '00012345678',
  regimeFiscal: 'Réel Normal',
  divisionFiscale: 'DGE — Ouagadougou',
  bp: 'BP 1234 Ouagadougou',
  tel: '+226 70 00 00 00',
  lieu: 'Ouagadougou',
};

@Injectable({ providedIn: 'root' })
export class PrintService {

  private fmt(n: number | undefined | null): string {
    return (n || 0).toLocaleString('fr-FR') + ' FCFA';
  }

  private fmtDate(d: string | undefined | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  private invoiceRef(id: number | undefined, dateStr: string | undefined): string {
    const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
    return `${String(id || 0).padStart(3, '0')}/${year}/GTS`;
  }

  private toFrenchWords(amount: number): string {
    const UNITS = [
      '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
      'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
      'dix-sept', 'dix-huit', 'dix-neuf',
    ];
    const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

    const belowHundred = (n: number): string => {
      if (n < 20) return UNITS[n];
      const t = Math.floor(n / 10);
      const r = n % 10;
      if (t === 7) return r === 0 ? 'soixante-dix' : r === 1 ? 'soixante et onze' : `soixante-${UNITS[10 + r]}`;
      if (t === 8) return r === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[r]}`;
      if (t === 9) return r === 0 ? 'quatre-vingt-dix' : `quatre-vingt-${UNITS[10 + r]}`;
      if (r === 0) return TENS[t];
      return r === 1 ? `${TENS[t]} et un` : `${TENS[t]}-${UNITS[r]}`;
    };

    const belowThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 100) return belowHundred(n);
      const h = Math.floor(n / 100);
      const r = n % 100;
      if (r === 0) return h === 1 ? 'cent' : `${UNITS[h]} cents`;
      return `${h === 1 ? 'cent' : `${UNITS[h]} cent`} ${belowHundred(r)}`;
    };

    const n = Math.floor(Math.abs(amount));
    if (n === 0) return 'zéro franc CFA';

    let out = '';
    const millions = Math.floor(n / 1_000_000);
    if (millions > 0) out += millions === 1 ? 'un million ' : `${belowThousand(millions)} millions `;
    const thousands = Math.floor((n % 1_000_000) / 1_000);
    if (thousands > 0) out += thousands === 1 ? 'mille ' : `${belowThousand(thousands)} mille `;
    const rem = n % 1_000;
    if (rem > 0) out += `${belowThousand(rem)} `;

    return out.trim() + ' francs CFA';
  }

  private baseStyles(): string {
    return `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 28px 36px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .co-name { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
        .co-act  { font-size: 11px; color: #555; margin-bottom: 5px; }
        .co-info { font-size: 11px; line-height: 1.8; color: #333; }
        .date-block { text-align: right; font-size: 11px; color: #333; line-height: 1.9; }
        .title-wrap { text-align: center; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 8px 0; margin: 14px 0 18px; }
        .doc-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
        .doc-sub   { font-size: 11px; color: #555; margin-top: 3px; }
        .doit-wrap { margin-bottom: 14px; }
        .doit-box  { display: inline-block; border: 1px solid #888; padding: 8px 16px; min-width: 300px; }
        .doit-lbl  { font-weight: 700; font-size: 12px; margin-bottom: 4px; }
        .doit-info { font-size: 11px; line-height: 1.8; }
        .objet-row { margin-bottom: 14px; font-size: 11.5px; }
        .objet-lbl { font-weight: 700; }
        table.presta { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        table.presta th,
        table.presta td { border: 1px solid #555; padding: 6px 8px; font-size: 11px; }
        table.presta th { background: #e8e8e8; font-weight: 700; text-align: center; }
        .tc { text-align: center; }
        .tr { text-align: right; }
        .totals-wrap { display: flex; justify-content: flex-end; border-left: 1px solid #555; border-right: 1px solid #555; border-bottom: 1px solid #555; margin-bottom: 14px; }
        .totals-table { width: 100%; border-collapse: collapse; }
        .totals-table td { padding: 5px 10px; font-size: 11.5px; border-bottom: 1px solid #ddd; }
        .totals-table td:last-child { text-align: right; font-weight: 600; min-width: 130px; }
        .totals-table tr.ttc td { font-weight: 700; font-size: 13px; background: #e8e8e8; border-top: 2px solid #555; border-bottom: none; }
        .lettres { border: 1px solid #bbb; padding: 8px 14px; margin-bottom: 24px; font-size: 11px; font-style: italic; background: #fafafa; }
        .signature-wrap  { display: flex; justify-content: flex-end; margin-top: 16px; }
        .signature-block { text-align: center; min-width: 200px; }
        .sig-title { font-weight: 700; font-size: 12px; text-decoration: underline; margin-bottom: 50px; }
        .sig-name  { font-size: 11px; font-weight: 600; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .badge-blue  { background: #dbeafe; color: #1e40af; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-gray  { background: #f3f4f6; color: #374151; }
        .watermark { position: fixed; top: 42%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 900; color: rgba(0,0,0,0.04); pointer-events: none; z-index: 0; }
        .stamp { position: fixed; top: 36%; right: 55px; transform: rotate(-15deg); border: 4px solid #065f46; color: #065f46; font-size: 26px; font-weight: 900; padding: 8px 18px; opacity: .22; border-radius: 6px; letter-spacing: 2px; }
        .reste-box { border: 1px solid #fbbf24; background: #fffbeb; padding: 8px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .reste-box strong { color: #92400e; font-size: 14px; }
        .footer { margin-top: 28px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 10px; color: #888; text-align: center; }
        @media print { body { padding: 14px 20px; } }
      </style>
    `;
  }

  private openPrint(html: string): void {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">${this.baseStyles()}</head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  // ─────────────────────────────────────────────
  // FACTURE PROFORMA (état: VALIDEE)
  // ─────────────────────────────────────────────
  printProforma(facture: Facture): void {
    const ref = this.invoiceRef(facture.id, facture.dateEmission);
    const tva = (facture.montantTTC || 0) - (facture.montantHT || 0);
    const missions = facture.missionsFacturees || [];

    const lignes = missions.map((m, i) => `
      <tr>
        <td class="tc">${i + 1}</td>
        <td>Mission ${m.codeMission || '-'} — ${m.lieuMission || '-'}</td>
        <td class="tc">Heures</td>
        <td class="tc">${m.nbHeures || 0}</td>
        <td class="tr">${this.fmt(m.tarifHoraireApplique)}</td>
        <td class="tr"><strong>${this.fmt(m.sousTotal)}</strong></td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="tc" style="color:#888;padding:12px">Aucune mission</td></tr>`;

    const html = `
      <div class="watermark">PROFORMA</div>

      <div class="header">
        <div>
          <div class="co-name">${CO.nom}</div>
          <div class="co-act">${CO.activite}</div>
          <div class="co-info">
            ${CO.adresse}<br>
            RCCM : ${CO.rccm}<br>
            N° IFU : ${CO.ifu}<br>
            Régime fiscal : ${CO.regimeFiscal}<br>
            Division fiscale : ${CO.divisionFiscale}<br>
            ${CO.bp} &nbsp;|&nbsp; Tél. : ${CO.tel}
          </div>
        </div>
        <div class="date-block">
          <strong>${CO.lieu}, le ${this.fmtDate(facture.dateEmission)}</strong><br><br>
          <span class="badge badge-blue">Document non contractuel</span>
        </div>
      </div>

      <div class="title-wrap">
        <div class="doc-title">Facture Proforma N° ${ref}</div>
      </div>

      <div class="doit-wrap">
        <div class="doit-box">
          <div class="doit-lbl">Doit :</div>
          <div class="doit-info">
            <strong>${facture.clientNom || '—'}</strong><br>
            Location : ${facture.codeLocation || '—'}
          </div>
        </div>
      </div>

      <div class="objet-row">
        <span class="objet-lbl">Objet :</span>
        Location d'engins pour travaux sur le site de
        <strong>${facture.siteLocation || facture.codeLocation || '—'}</strong>
      </div>

      <table class="presta">
        <thead>
          <tr>
            <th style="width:40px">N°</th>
            <th>Désignation</th>
            <th style="width:80px">Unité</th>
            <th style="width:80px">Quantité</th>
            <th style="width:120px">P.U.</th>
            <th style="width:130px">Montant Total</th>
          </tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>

      <div class="totals-wrap">
        <table class="totals-table">
          <tr><td>TOTAL HTVA</td><td>${this.fmt(facture.montantHT)}</td></tr>
          <tr><td>TVA ${facture.tauxTVA || 18} %</td><td>${this.fmt(tva)}</td></tr>
          <tr class="ttc"><td>TOTAL TTC</td><td>${this.fmt(facture.montantTTC)}</td></tr>
        </table>
      </div>

      <div class="lettres">
        Arrêtée la présente facture à la somme de :
        <strong>${this.toFrenchWords(facture.montantTTC || 0)}</strong>
      </div>

      <div class="signature-wrap">
        <div class="signature-block">
          <div class="sig-title">Le Prestataire</div>
          <div class="sig-name">${CO.nom}</div>
        </div>
      </div>

      <div class="footer">Ce document est une facture proforma et ne constitue pas une facture définitive. — GTS</div>
    `;

    this.openPrint(html);
  }

  // ─────────────────────────────────────────────
  // FACTURE DÉFINITIVE (état: VALIDEE ou PAYEE)
  // ─────────────────────────────────────────────
  printFacture(facture: Facture, reglements: Reglement[]): void {
    const ref = this.invoiceRef(facture.id, facture.dateEmission);
    const tva = (facture.montantTTC || 0) - (facture.montantHT || 0);
    const missions = facture.missionsFacturees || [];
    const totalVerse = Array.isArray(reglements)
      ? reglements.reduce((s, r) => s + (r.montantVerse || 0), 0)
      : 0;
    const resteAPayer = Math.max(0, (facture.montantTTC || 0) - totalVerse);
    const isPaid = facture.etatPaiement === 'PAYEE';

    const lignes = missions.map((m, i) => `
      <tr>
        <td class="tc">${i + 1}</td>
        <td>Mission ${m.codeMission || '-'} — ${m.lieuMission || '-'}</td>
        <td class="tc">Heures</td>
        <td class="tc">${m.nbHeures || 0}</td>
        <td class="tr">${this.fmt(m.tarifHoraireApplique)}</td>
        <td class="tr"><strong>${this.fmt(m.sousTotal)}</strong></td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="tc" style="color:#888;padding:12px">Aucune mission</td></tr>`;

    const verseRow = totalVerse > 0
      ? `<tr><td style="color:#065f46">Total versé</td><td style="color:#065f46">${this.fmt(totalVerse)}</td></tr>`
      : '';

    const resteHtml = resteAPayer > 0 && !isPaid
      ? `<div class="reste-box">
           <span>Reste à payer :</span>
           <strong>${this.fmt(resteAPayer)}</strong>
         </div>`
      : '';

    const stamp = isPaid ? `<div class="stamp">PAYÉE</div>` : '';

    const html = `
      ${stamp}

      <div class="header">
        <div>
          <div class="co-name">${CO.nom}</div>
          <div class="co-act">${CO.activite}</div>
          <div class="co-info">
            ${CO.adresse}<br>
            RCCM : ${CO.rccm}<br>
            N° IFU : ${CO.ifu}<br>
            Régime fiscal : ${CO.regimeFiscal}<br>
            Division fiscale : ${CO.divisionFiscale}<br>
            ${CO.bp} &nbsp;|&nbsp; Tél. : ${CO.tel}
          </div>
        </div>
        <div class="date-block">
          <strong>${CO.lieu}, le ${this.fmtDate(facture.dateEmission)}</strong><br><br>
          <span class="badge ${isPaid ? 'badge-green' : 'badge-blue'}">${facture.etatPaiement}</span>
        </div>
      </div>

      <div class="title-wrap">
        <div class="doc-title">Facture N° ${ref}</div>
      </div>

      <div class="doit-wrap">
        <div class="doit-box">
          <div class="doit-lbl">Doit :</div>
          <div class="doit-info">
            <strong>${facture.clientNom || '—'}</strong><br>
            Location : ${facture.codeLocation || '—'}
          </div>
        </div>
      </div>

      <div class="objet-row">
        <span class="objet-lbl">Objet :</span>
        Location d'engins pour travaux sur le site de
        <strong>${facture.siteLocation || facture.codeLocation || '—'}</strong>
      </div>

      <table class="presta">
        <thead>
          <tr>
            <th style="width:40px">N°</th>
            <th>Désignation</th>
            <th style="width:80px">Unité</th>
            <th style="width:80px">Quantité</th>
            <th style="width:120px">P.U.</th>
            <th style="width:130px">Montant Total</th>
          </tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>

      <div class="totals-wrap">
        <table class="totals-table">
          <tr><td>TOTAL HTVA</td><td>${this.fmt(facture.montantHT)}</td></tr>
          <tr><td>TVA ${facture.tauxTVA || 18} %</td><td>${this.fmt(tva)}</td></tr>
          <tr class="ttc"><td>TOTAL TTC</td><td>${this.fmt(facture.montantTTC)}</td></tr>
          ${verseRow}
        </table>
      </div>

      ${resteHtml}

      <div class="lettres">
        Arrêtée la présente facture à la somme de :
        <strong>${this.toFrenchWords(facture.montantTTC || 0)}</strong>
      </div>

      <div class="signature-wrap">
        <div class="signature-block">
          <div class="sig-title">Le Prestataire</div>
          <div class="sig-name">${CO.nom}</div>
        </div>
      </div>

      <div class="footer">Merci de votre confiance — GTS &nbsp;|&nbsp; ${CO.adresse} &nbsp;|&nbsp; Tél. : ${CO.tel}</div>
    `;

    this.openPrint(html);
  }

  // ─────────────────────────────────────────────
  // REÇU DE PAIEMENT (par règlement)
  // ─────────────────────────────────────────────
  printRecu(reglement: Reglement, facture: Facture, resteAPayer: number): void {
    const ref = this.invoiceRef(facture.id, facture.dateEmission);
    const isSolde = resteAPayer <= 0;
    const stamp = isSolde ? `<div class="stamp">SOLDÉE</div>` : '';

    const resteHtml = !isSolde
      ? `<div class="reste-box" style="margin-top:16px">
           <div>
             <div style="font-size:10px;text-transform:uppercase;color:#92400e;margin-bottom:2px">
               Reste à payer sur cette facture
             </div>
             <strong>${this.fmt(resteAPayer)}</strong>
           </div>
           <span class="badge badge-gray">Paiement partiel</span>
         </div>`
      : `<div style="margin-top:16px;text-align:center">
           <span class="badge badge-green" style="font-size:13px;padding:7px 20px">
             ✓ Facture entièrement soldée
           </span>
         </div>`;

    const html = `
      ${stamp}

      <div class="header">
        <div>
          <div class="co-name">${CO.nom}</div>
          <div class="co-act">${CO.activite}</div>
          <div class="co-info">
            ${CO.adresse}<br>
            RCCM : ${CO.rccm}<br>
            N° IFU : ${CO.ifu}<br>
            Régime fiscal : ${CO.regimeFiscal}<br>
            Division fiscale : ${CO.divisionFiscale}<br>
            ${CO.bp} &nbsp;|&nbsp; Tél. : ${CO.tel}
          </div>
        </div>
        <div class="date-block">
          <strong>${CO.lieu}, le ${this.fmtDate(reglement.dateReglement)}</strong><br><br>
          Réf. facture : <strong>FAC-${ref}</strong>
        </div>
      </div>

      <div class="title-wrap">
        <div class="doc-title">Reçu de Paiement</div>
        <div class="doc-sub">Facture N° ${ref}</div>
      </div>

      <div class="doit-wrap">
        <div class="doit-box">
          <div class="doit-lbl">Reçu de :</div>
          <div class="doit-info">
            <strong>${facture.clientNom || '—'}</strong><br>
            Location : ${facture.codeLocation || '—'}
          </div>
        </div>
      </div>

      <div class="objet-row">
        <span class="objet-lbl">Objet :</span>
        Règlement de la facture N° ${ref} par <strong>${reglement.modePaiement || '—'}</strong>
      </div>

      <table class="presta">
        <thead>
          <tr>
            <th>Désignation</th>
            <th style="width:160px">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Versement — ${reglement.modePaiement || '—'}</td>
            <td class="tr"><strong>${this.fmt(reglement.montantVerse)}</strong></td>
          </tr>
          <tr style="background:#f9fafb">
            <td>Montant total facture TTC</td>
            <td class="tr">${this.fmt(facture.montantTTC)}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-wrap">
        <table class="totals-table">
          <tr class="ttc"><td>Montant reçu</td><td>${this.fmt(reglement.montantVerse)}</td></tr>
        </table>
      </div>

      <div class="lettres">
        Arrêtée le présent reçu à la somme de :
        <strong>${this.toFrenchWords(reglement.montantVerse || 0)}</strong>
      </div>

      ${resteHtml}

      <div class="signature-wrap">
        <div class="signature-block">
          <div class="sig-title">Le Prestataire</div>
          <div class="sig-name">${CO.nom}</div>
        </div>
      </div>

      <div class="footer">
        Ce reçu atteste du paiement de la facture FAC-${ref} — GTS &nbsp;|&nbsp;
        ${CO.adresse} &nbsp;|&nbsp; Tél. : ${CO.tel}
      </div>
    `;

    this.openPrint(html);
  }
}
