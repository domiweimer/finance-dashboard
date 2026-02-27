// API endpoint for finance data
// In production, this would fetch from Google Sheets
// For now, returns mock data that matches the existing structure

export default function handler(req, res) {
  const data = {
    "ausgaben": 64734.2,
    "einnahmen": 65501.54,
    "netto": 767.34,
    "categories": [
      { "name": "Miete", "amount": 15660.0 },
      { "name": "Online", "amount": 12748.26 },
      { "name": "Sparen", "amount": 8272.32 },
      { "name": "Kreditkarte", "amount": 7588.84 },
      { "name": "Sonst", "amount": 6641.16 },
      { "name": "Familie", "amount": 4278.0 },
      { "name": "Lebensmittel", "amount": 3837.94 },
      { "name": "NordicTrailer", "amount": 1050.0 },
      { "name": "Handy/Internet", "amount": 1029.88 },
      { "name": "Kita", "amount": 944.0 },
      { "name": "Steuern", "amount": 785.0 },
      { "name": "Nebenkosten", "amount": 726.79 },
      { "name": "Tanken", "amount": 601.9 },
      { "name": "Versicherung", "amount": 321.0 },
      { "name": "Essen", "amount": 249.11 }
    ],
    "transactionsList": [
      { "d": "25.02.2026", "m": "Nexi Germany GmbH", "c": "Sonst", "a": 7.5 },
      { "d": "25.02.2026", "m": "AKTIV MARKT HOLZKY-SCHULZ", "c": "Lebensmittel", "a": 21.71 },
      { "d": "24.02.2026", "m": "BRANTNER BAECK", "c": "Lebensmittel", "a": 6.15 },
      { "d": "23.02.2026", "m": "ESSO STATION", "c": "Tanken", "a": 2.6 },
      { "d": "23.02.2026", "m": "Netto Marken-Discoun", "c": "Lebensmittel", "a": 6.91 },
      { "d": "23.02.2026", "m": "RAIFFBK AICHH-HARDT-SULGEN", "c": "Sonst", "a": 30.0 },
      { "d": "20.02.2026", "m": "Vodafone West GmbH", "c": "Handy/Internet", "a": 34.99 },
      { "d": "19.02.2026", "m": "ALDI SE U. CO. KG", "c": "Lebensmittel", "a": 11.79 },
      { "d": "19.02.2026", "m": "Dominik Weimer", "c": "Familie", "a": 1.0 },
      { "d": "17.02.2026", "m": "", "c": "Sonst", "a": 29.19 }
    ],
    "monthlyAusgaben": {
      "2025-03": 8286, "2025-04": 7513, "2025-05": 7807, "2025-06": 6891,
      "2025-07": 6234, "2025-08": 7456, "2025-09": 6892, "2025-10": 7234,
      "2025-11": 7567, "2025-12": 8567, "2026-01": 10029, "2026-02": 6280
    },
    "monthlyEinnahmen": {
      "2025-03": 5200, "2025-04": 5200, "2025-05": 5200, "2025-06": 5200,
      "2025-07": 5200, "2025-08": 5200, "2025-09": 5200, "2025-10": 5200,
      "2025-11": 5500, "2025-12": 8500, "2026-01": 6500, "2026-02": 5500
    }
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(data);
}
