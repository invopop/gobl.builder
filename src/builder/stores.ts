import { writable } from "svelte/store";
import * as GOBL from "../lib/gobl";
import type { Severity } from "../ui/alerts";

function createKeypairStore() {
  const { subscribe, set } = writable<GOBL.Keypair>(null, function start(set) {
    GOBL.keygen().then((value) => {
      set(value);
      console.log("Created keypair.", value);
    });
  });

  return {
    subscribe,
    renew: async () => set(await GOBL.keygen()),
  };
}

const defaultEditor = `{
  "$schema": "https://gobl.org/draft-0/bill/invoice",
  "code": "INV2021-001",
  "currency": "EUR",
  "customer": {
    "addresses": [
      {
        "code": "28792",
        "country": "ES",
        "locality": "Miraflores de la Sierra",
        "num": "1629",
        "region": "Madrid",
        "street": "Calle Diseminado"
      }
    ],
    "emails": [
      {
        "addr": "sam.lown@invopop.com"
      }
    ],
    "name": "Autofiscal S.L.",
    "tax_id": {
      "code": "B-85905495",
      "country": "ES"
    }
  },
  "issue_date": "2021-06-16",
  "lines": [
    {
      "i": 1,
      "item": {
        "name": "Development services day rate",
        "price": "200.00"
      },
      "quantity": "20",
      "sum": "4000.00",
      "taxes": [
        {
          "cat": "VAT",
          "rate": "standard"
        },
        {
          "cat": "IRPF",
          "rate": "pro"
        }
      ],
      "total": "4000.00"
    },
    {
      "i": 2,
      "item": {
        "name": "Something random",
        "price": "100.00"
      },
      "quantity": "10",
      "sum": "1000.00",
      "taxes": [
        {
          "cat": "VAT",
          "rate": "standard"
        }
      ],
      "total": "1000.00"
    },
    {
      "i": 3,
      "item": {
        "name": "Additional random services",
        "price": "34.50"
      },
      "quantity": "5",
      "sum": "172.50",
      "taxes": [
        {
          "cat": "VAT",
          "rate": "zero"
        }
      ],
      "total": "172.50"
    },
    {
      "i": 4,
      "item": {
        "name": "Impuesto local",
        "price": "5.00"
      },
      "quantity": "3",
      "sum": "15.00",
      "total": "15.00"
    }
  ],
  "outlays": [
    {
      "amount": "0",
      "desc": "Something paid for by us",
      "i": 1
    }
  ],
  "payment": {
    "instructions": {
      "code": "credit_transfer",
      "credit_transfer": [
        {
          "iban": "ES06 0128 0011 3901 0008 1391",
          "name": "Bankinter"
        }
      ]
    },
    "terms": {
      "code": "instant"
    }
  },
  "supplier": {
    "addresses": [
      {
        "code": "28003",
        "country": "ES",
        "locality": "Madrid",
        "num": "10",
        "region": "Madrid",
        "street": "Calle Mayor"
      }
    ],
    "emails": [
      {
        "addr": "contact@company.com"
      }
    ],
    "name": "A Company Name S.L.",
    "people": [
      {
        "name": {
          "alias": "Paco",
          "given": "Francisco",
          "surname": "Smith"
        }
      }
    ],
    "tax_id": {
      "code": "B91983379",
      "country": "ES"
    },
    "telephones": [
      {
        "label": "mobile",
        "num": "+34644123123"
      }
    ]
  },
  "totals": {
    "outlays": "0.00",
    "payable": "5637.50",
    "sum": "5187.50",
    "tax": "450.00",
    "taxes": {
      "categories": [
        {
          "amount": "1050.00",
          "base": "5172.50",
          "code": "VAT",
          "rates": [
            {
              "amount": "1050.00",
              "base": "5000.00",
              "key": "standard",
              "percent": "21.0%"
            },
            {
              "amount": "0.00",
              "base": "172.50",
              "key": "zero",
              "percent": "0.0%"
            }
          ]
        },
        {
          "amount": "600.00",
          "base": "4000.00",
          "code": "IRPF",
          "rates": [
            {
              "amount": "600.00",
              "base": "4000.00",
              "key": "pro",
              "percent": "15.0%"
            }
          ],
          "retained": true
        }
      ],
      "sum": "450.00"
    },
    "total": "5187.50",
    "total_with_tax": "5637.50"
  },
  "uuid": "3d7fdbdc-d037-11eb-a068-3e7e00ce5635"
}`;

type Status = {
  severity: Severity;
  message: string;
  context?: string;
};

// function createStatusStore() {
//   const { subscribe, set } = writable<Status>(null);

//   return {
//     subscribe,
//     setInfo: ({ message, context }: Pick<Status, "message" | "context">) =>
//       set({
//         severity: Severity.Info,
//         message,
//         context,
//       }),
//     setError: ({ message, context }: Pick<Status, "message" | "context">) =>
//       set({
//         severity: Severity.Error,
//         message,
//         context,
//       }),
//   };
// }

export const keypair = createKeypairStore();
export const editor = writable(defaultEditor);
export const draft = writable(false);
export const status = writable<Status>(null);
