import MessageIcon from '$lib/ui/icons/MessageIcon.svelte'
import InvoiceIcon from '$lib/ui/icons/InvoiceIcon.svelte'

export default [
  {
    name: 'Colombia',
    folder: 'co',
    flag: '🇨🇴',
    templates: [
      {
        name: 'Invoice',
        file: 'simple.json',
        icon: InvoiceIcon
      },
      {
        name: 'Invoice (Simplified)',
        file: 'simplified.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'France',
    folder: 'fr',
    flag: '🇫🇷',
    templates: [
      {
        name: 'Invoice',
        file: 'invoice.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'Italy',
    folder: 'it',
    flag: '🇮🇹',
    templates: [
      {
        name: 'Invoice (Freelance)',
        file: 'freelance.json',
        icon: InvoiceIcon
      },
      {
        name: 'Invoice (Hotel)',
        file: 'hotel.json',
        icon: InvoiceIcon
      },
      {
        name: 'Invoice (Reverse Charge)',
        file: 'reverse-charge.json',
        icon: InvoiceIcon
      },
      {
        name: 'Invoice (Stamp Duty)',
        file: 'stamp-duty.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'Mexico',
    folder: 'mx',
    flag: '🇲🇽',
    templates: [
      {
        name: 'Invoice',
        file: 'invoice.json',
        icon: InvoiceIcon
      },
      {
        name: 'Credit Note',
        file: 'credit-note.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'Netherlands',
    folder: 'nl',
    flag: '🇳🇱',
    templates: [
      {
        name: 'Invoice',
        file: 'invoice.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'Portugal',
    folder: 'pt',
    flag: '🇵🇹',
    templates: [
      {
        name: 'Invoice',
        file: 'invoice.json',
        icon: InvoiceIcon
      },
      {
        name: 'Credit Note',
        file: 'credit-note.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'Spain',
    folder: 'es',
    flag: '🇪🇸',
    templates: [
      {
        name: 'Invoice',
        file: 'invoice.json',
        icon: InvoiceIcon
      },
      {
        name: 'Invoice (reverse charge)',
        file: 'invoice-rev-charge.json',
        icon: InvoiceIcon
      },
      {
        name: 'Invoice (freelance)',
        file: 'invoice-freelance.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'United States',
    folder: 'us',
    flag: '🇺🇸',
    templates: [
      {
        name: 'Invoice',
        file: 'invoice.json',
        icon: InvoiceIcon
      }
    ]
  },
  {
    name: 'Other',
    folder: 'misc',
    templates: [
      {
        name: 'Message',
        file: 'message.json',
        icon: MessageIcon
      }
    ]
  }
]
