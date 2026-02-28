# 💰 Finance Dashboard

A personal finance dashboard that displays income and expenses from Google Sheets, built with Next.js and Chart.js.

![Finance Dashboard](https://img.shields.io/badge/Next.js-14.2-black) ![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-black)

## Features

- 📊 **Bar Chart** - Monthly expenses visualization
- 📈 **Line Chart** - Income vs Expenses over time
- 🥧 **Pie Chart** - Expenses by category
- 💰 **Totals** - Ausgaben (expenses), Einnahmen (income), Netto
- 🔄 **Auto-refresh** - Updates every 5 minutes
- 📋 **Transactions** - Recent transactions list

## Google Sheets Structure

The dashboard expects a Google Sheet with two tabs:

### "Ausgaben" (Expenses)
| Datum | Quelle | Kategorie | Betrag_EUR | Referenz | Notizen |
|-------|--------|-----------|------------|----------|---------|
| 01.01.2026 | Amazon | Online | 50,00 | ... | ... |

### "Einnahmen" (Income)
| Datum | Quelle | Kategorie | Betrag_EUR | Referenz | Notizen |
|-------|--------|-----------|------------|----------|---------|
| 01.01.2026 | Arbeit | Gehalt | 3000,00 | ... | ... |

**Sheet ID:** `1Z15lr6tatNY8mHf0UctJYROScUbMirAZlgTleAwJzgk`

## Deployment to Vercel

### Option 1: Service Account (Recommended)

1. **Create a Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new Project (or use existing)
   - Go to Credentials > Create Credentials > Service Account
   - Download the JSON key file

2. **Share your Google Sheet:**
   - Open your Google Sheet
   - Click "Teilen" (Share)
   - Add the service account email (e.g., `dashboard@project.iam.gserviceaccount.com`)
   - Give it "Bearbeiter" (Editor) access

3. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Set Environment Variables in Vercel:**
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = your-service-account@project.iam.gserviceaccount.com
   - `GOOGLE_PRIVATE_KEY` = The private key from your JSON file (replace `\n` with actual newlines)

### Option 2: OAuth Token

For simpler setup, you can use an OAuth access token:
- `GOOGLE_ACCESS_TOKEN` = Your OAuth access token

Note: Access tokens expire, so this method requires periodic token refresh.

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── pages/
│   ├── api/
│   │   └── finance.js      # Google Sheets API integration
│   └── index.js            # Main dashboard UI
├── public/
├── .env.example            # Environment variable template
└── package.json
```

## Tech Stack

- **Next.js 14** - React framework
- **Chart.js** - Beautiful charts
- **Google Sheets API v4** - Data source

## License

MIT
