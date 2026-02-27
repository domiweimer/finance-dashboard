// API endpoint for projects data

export default function handler(req, res) {
  const data = {
    "projects": [
      {
        "name": "Buschkamp Bros Event-Manager",
        "description": "Event-Management System für Buschkamp Bros Veranstaltungen",
        "status": "active",
        "progress": 65
      },
      {
        "name": "Nordic Trailer",
        "description": "Vermietung und Verwaltung von Anhängern",
        "status": "active",
        "progress": 80
      }
    ]
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(data);
}
