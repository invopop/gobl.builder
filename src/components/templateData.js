import InvoiceIcon from '$lib/ui/icons/InvoiceIcon.svelte'
import MessageIcon from '$lib/ui/icons/MessageIcon.svelte'

export default [
  {
    name: 'Argentina',
    folder: 'ar',
    flag: '🇦🇷',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (ARCA)', file: 'invoice-arca.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Austria',
    folder: 'at',
    flag: '🇦🇹',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Belgium',
    folder: 'be',
    flag: '🇧🇪',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Brazil',
    folder: 'br',
    flag: '🇧🇷',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (NF-e)', file: 'invoice-nfe.json', icon: InvoiceIcon },
      { name: 'Invoice (NFS-e)', file: 'invoice-nfse.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Canada',
    folder: 'ca',
    flag: '🇨🇦',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Colombia',
    folder: 'co',
    flag: '🇨🇴',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (DIAN)', file: 'invoice-dian.json', icon: InvoiceIcon },
      { name: 'Invoice (Simplified)', file: 'simplified.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Denmark',
    folder: 'dk',
    flag: '🇩🇰',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'France',
    folder: 'fr',
    flag: '🇫🇷',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (Chorus Pro)', file: 'invoice-choruspro.json', icon: InvoiceIcon },
      { name: 'Invoice (Factur-X)', file: 'invoice-facturx.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Germany',
    folder: 'de',
    flag: '🇩🇪',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (XRechnung)', file: 'invoice-xrechnung.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Greece',
    folder: 'gr',
    flag: '🇬🇷',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (myDATA)', file: 'invoice-mydata.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'India',
    folder: 'in',
    flag: '🇮🇳',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Ireland',
    folder: 'ie',
    flag: '🇮🇪',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Italy',
    folder: 'it',
    flag: '🇮🇹',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (SDI)', file: 'invoice-sdi.json', icon: InvoiceIcon },
      { name: 'Invoice (Freelance)', file: 'freelance.json', icon: InvoiceIcon },
      { name: 'Invoice (Hotel)', file: 'hotel.json', icon: InvoiceIcon },
      { name: 'Invoice (Reverse Charge)', file: 'reverse-charge.json', icon: InvoiceIcon },
      { name: 'Invoice (Stamp Duty)', file: 'stamp-duty.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Mexico',
    folder: 'mx',
    flag: '🇲🇽',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (CFDI)', file: 'invoice-cfdi.json', icon: InvoiceIcon },
      { name: 'Credit Note', file: 'credit-note.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Netherlands',
    folder: 'nl',
    flag: '🇳🇱',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Poland',
    folder: 'pl',
    flag: '🇵🇱',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (FA_VAT)', file: 'invoice-favat.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Portugal',
    folder: 'pt',
    flag: '🇵🇹',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (SAF-T)', file: 'invoice-saft.json', icon: InvoiceIcon },
      { name: 'Credit Note', file: 'credit-note.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Singapore',
    folder: 'sg',
    flag: '🇸🇬',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Spain',
    folder: 'es',
    flag: '🇪🇸',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon },
      { name: 'Invoice (FacturaE)', file: 'invoice-facturae.json', icon: InvoiceIcon },
      { name: 'Invoice (SII)', file: 'invoice-sii.json', icon: InvoiceIcon },
      { name: 'Invoice (TicketBAI)', file: 'invoice-tbai.json', icon: InvoiceIcon },
      { name: 'Invoice (VeriFactu)', file: 'invoice-verifactu.json', icon: InvoiceIcon },
      { name: 'Invoice (Freelance)', file: 'invoice-freelance.json', icon: InvoiceIcon },
      { name: 'Invoice (Reverse Charge)', file: 'invoice-rev-charge.json', icon: InvoiceIcon },
      { name: 'Credit Note', file: 'credit-note.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Sweden',
    folder: 'se',
    flag: '🇸🇪',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Switzerland',
    folder: 'ch',
    flag: '🇨🇭',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'United Arab Emirates',
    folder: 'ae',
    flag: '🇦🇪',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'United Kingdom',
    folder: 'gb',
    flag: '🇬🇧',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'United States',
    folder: 'us',
    flag: '🇺🇸',
    templates: [
      { name: 'Invoice', file: 'invoice.json', icon: InvoiceIcon }
    ]
  },
  {
    name: 'Other',
    folder: 'misc',
    templates: [
      { name: 'Message', file: 'message.json', icon: MessageIcon }
    ]
  }
]
