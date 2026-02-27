// API endpoint for calendar events
// In production, this would fetch from Google Calendar API
// For now, returns demo data

export default function handler(req, res) {
  const today = new Date();
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const shortDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  
  // Generate demo events
  const data = {
    "today": [
      {
        "time": "09:00",
        "title": "Nordic Trailer - Kunde anrufen",
        "location": "",
        "type": ""
      },
      {
        "time": "14:00",
        "title": "Buschkamp Bros Meeting",
        "location": "Remote",
        "type": ""
      }
    ],
    "thisWeek": [
      {
        "day": shortDays[(today.getDay() + 0) % 7],
        "time": "09:00",
        "title": "Nordic Trailer - Kunde anrufen",
        "location": "",
        "type": ""
      },
      {
        "day": shortDays[(today.getDay() + 0) % 7],
        "time": "14:00",
        "title": "Buschkamp Bros Meeting",
        "location": "Remote",
        "type": ""
      },
      {
        "day": shortDays[(today.getDay() + 1) % 7],
        "time": "10:00",
        "title": "Steuerberater",
        "location": "Büro",
        "type": "personal"
      },
      {
        "day": shortDays[(today.getDay() + 2) % 7],
        "time": "18:00",
        "title": "Familienabend",
        "location": "Zuhause",
        "type": "personal"
      },
      {
        "day": shortDays[(today.getDay() + 3) % 7],
        "time": "15:30",
        "title": "Kita abholen",
        "location": "Kita",
        "type": "personal"
      },
      {
        "day": shortDays[(today.getDay() + 4) % 7],
        "time": "09:30",
        "title": "Nordic Trailer - Übergabe",
        "location": "Werkstatt",
        "type": ""
      },
      {
        "day": shortDays[(today.getDay() + 6) % 7],
        "time": "11:00",
        "title": "Einkaufen",
        "location": "Aldi",
        "type": "personal"
      }
    ]
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(data);
}
