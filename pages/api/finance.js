// API endpoint for finance data from Google Sheets
import { google } from 'googleapis';

const SPREADSHEET_ID = '1Z15lr6tatNY8mHf0UctJYROScUbMirAZlgTleAwJzgk';

// Helper to parse German date format (DD.MM.YYYY)
function parseGermanDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return new Date(dateStr);
}

// Get auth client - tries multiple methods
async function getAuth() {
  const { google } = require('googleapis');
  
  // Method 1: Use service account (for Vercel/production)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
  }
  
  // Method 2: Use OAuth token from environment (for Vercel with token)
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: process.env.GOOGLE_ACCESS_TOKEN });
    return auth;
  }
  
  // Method 3: Read from local token file (for development)
  try {
    const fs = require('fs');
    const path = require('path');
    const tokenPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config/google-calendar/token.json');
    
    if (fs.existsSync(tokenPath)) {
      const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      
      // Check if token needs refresh
      if (token.refresh_token) {
        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({
          access_token: token.access_token,
          refresh_token: token.refresh_token,
        });
        
        // Trigger token refresh if needed
        const isAuth = await auth.getAccessToken();
        return auth;
      }
    }
  } catch (e) {
    console.log('Local token not available, trying other methods');
  }
  
  return null;
}

export default async function handler(req, res) {
  try {
    const auth = await getAuth();
    
    if (!auth) {
      // Return mock data if no auth available
      console.log('No Google auth available, using mock data');
      return res.status(200).json(getMockData());
    }
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Fetch both sheets
    const [ausgabenResponse, einnahmenResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Ausgaben!A:F',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Einnahmen!A:F',
      }),
    ]);
    
    const ausgabenData = ausgabenResponse.data.values || [];
    const einnahmenData = einnahmenResponse.data.values || [];
    
    // Skip header row
    const ausgabenRows = ausgabenData.slice(1);
    const einnahmenRows = einnahmenData.slice(1);
    
    // Process Ausgaben (expenses)
    const ausgaben = {
      total: 0,
      byCategory: {},
      byMonth: {},
      transactions: [],
    };
    
    for (const row of ausgabenRows) {
      if (row.length >= 4 && row[3]) {
        const amount = Math.abs(parseFloat(row[3].toString().replace(',', '.'))) || 0;
        const category = row[2] || 'Sonst';
        const dateStr = row[0];
        const date = parseGermanDate(dateStr);
        
        ausgaben.total += amount;
        ausgaben.byCategory[category] = (ausgaben.byCategory[category] || 0) + amount;
        
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          ausgaben.byMonth[monthKey] = (ausgaben.byMonth[monthKey] || 0) + amount;
        }
        
        ausgaben.transactions.push({
          d: dateStr,
          m: row[1] || '',
          c: category,
          a: amount,
        });
      }
    }
    
    // Process Einnahmen (income)
    const einnahmen = {
      total: 0,
      byCategory: {},
      byMonth: {},
      transactions: [],
    };
    
    for (const row of einnahmenRows) {
      if (row.length >= 4 && row[3]) {
        const amount = Math.abs(parseFloat(row[3].toString().replace(',', '.'))) || 0;
        const category = row[2] || 'Sonst';
        const dateStr = row[0];
        const date = parseGermanDate(dateStr);
        
        einnahmen.total += amount;
        einnahmen.byCategory[category] = (einnahmen.byCategory[category] || 0) + amount;
        
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          einnahmen.byMonth[monthKey] = (einnahmen.byMonth[monthKey] || 0) + amount;
        }
        
        einnahmen.transactions.push({
          d: dateStr,
          m: row[1] || '',
          c: category,
          a: amount,
        });
      }
    }
    
    // Format categories for response
    const categories = Object.entries(ausgaben.byCategory)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    // Sort transactions by date (most recent first)
    const transactionsList = ausgaben.transactions
      .sort((a, b) => {
        const dateA = parseGermanDate(a.d);
        const dateB = parseGermanDate(b.d);
        return dateB - dateA;
      })
      .slice(0, 20);
    
    const result = {
      ausgaben: ausgaben.total,
      einnahmen: einnahmen.total,
      netto: einnahmen.total - ausgaben.total,
      categories,
      transactionsList,
      monthlyAusgaben: ausgaben.byMonth,
      monthlyEinnahmen: einnahmen.byMonth,
    };
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error.message);
    // Return mock data on error
    return res.status(200).json(getMockData());
  }
}

function getMockData() {
  return {
    ausgaben: 64734.2,
    einnahmen: 65501.54,
    netto: 767.34,
    categories: [
      { name: 'Miete', amount: 15660.0 },
      { name: 'Online', amount: 12748.26 },
      { name: 'Sparen', amount: 8272.32 },
      { name: 'Kreditkarte', amount: 7588.84 },
      { name: 'Sonst', amount: 6641.16 },
      { name: 'Familie', amount: 4278.0 },
      { name: 'Lebensmittel', amount: 3837.94 },
      { name: 'NordicTrailer', amount: 1050.0 },
      { name: 'Handy/Internet', amount: 1029.88 },
      { name: 'Kita', amount: 944.0 },
      { name: 'Steuern', amount: 785.0 },
      { name: 'Nebenkosten', amount: 726.79 },
      { name: 'Tanken', amount: 601.9 },
      { name: 'Versicherung', amount: 321.0 },
      { name: 'Essen', amount: 249.11 },
    ],
    transactionsList: [
      { d: '25.02.2026', m: 'Nexi Germany GmbH', c: 'Sonst', a: 7.5 },
      { d: '25.02.2026', m: 'AKTIV MARKT HOLZKY-SCHULZ', c: 'Lebensmittel', a: 21.71 },
      { d: '24.02.2026', m: 'BRANTNER BAECK', c: 'Lebensmittel', a: 6.15 },
      { d: '23.02.2026', m: 'ESSO STATION', c: 'Tanken', a: 2.6 },
      { d: '23.02.2026', m: 'Netto Marken-Discoun', c: 'Lebensmittel', a: 6.91 },
    ],
    monthlyAusgaben: {
      '2025-03': 8286, '2025-04': 7513, '2025-05': 7807, '2025-06': 6891,
      '2025-07': 6234, '2025-08': 7456, '2025-09': 6892, '2025-10': 7234,
      '2025-11': 7567, '2025-12': 8567, '2026-01': 10029, '2026-02': 6280,
    },
    monthlyEinnahmen: {
      '2025-03': 5200, '2025-04': 5200, '2025-05': 5200, '2025-06': 5200,
      '2025-07': 5200, '2025-08': 5200, '2025-09': 5200, '2025-10': 5200,
      '2025-11': 5500, '2025-12': 8500, '2026-01': 6500, '2026-02': 5500,
    },
  };
}
