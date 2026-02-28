import Head from 'next/head';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('finanzen');
  const [financeData, setFinanceData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [todos, setTodos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load finance data with auto-refresh
  const loadFinanceData = () => {
    fetch('/api/finance')
      .then(res => res.json())
      .then(data => {
        setFinanceData(data);
        setLastUpdated(new Date());
      })
      .catch(console.error);
  };

  // Initialize charts when finance data is loaded and Chart.js is available
  useEffect(() => {
    if (!financeData) return;

    // Wait for Chart.js to be available
    const initCharts = () => {
      if (typeof Chart === 'undefined') {
        setTimeout(initCharts, 100);
        return;
      }

      const months = ['Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan', 'Feb'];
      const monthKeys = ['2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'];
      const ausData = monthKeys.map(m => financeData.monthlyAusgaben?.[m] || 0);
      const einData = monthKeys.map(m => financeData.monthlyEinnahmen?.[m] || 0);

      // Destroy existing charts first
      const barEl = document.getElementById('barChart');
      const lineEl = document.getElementById('lineChart');
      const pieEl = document.getElementById('pieChart');

      if (barEl?.chart) { barEl.chart.destroy(); }
      if (lineEl?.chart) { lineEl.chart.destroy(); }
      if (pieEl?.chart) { pieEl.chart.destroy(); }

      // Bar chart - monthly expenses
      if (barEl) {
        barEl.chart = new Chart(barEl, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [{ label: 'Ausgaben', data: ausData, backgroundColor: '#4f46e5', borderRadius: 4 }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
      }

      // Line chart - income vs expenses
      if (lineEl) {
        lineEl.chart = new Chart(lineEl, {
          type: 'line',
          data: {
            labels: months,
            datasets: [
              { label: 'Einnahmen', data: einData, borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.3 },
              { label: 'Ausgaben', data: ausData, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.3 }
            ]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
        });
      }

      // Pie/Doughnut chart - categories
      if (pieEl && financeData.categories?.length > 0) {
        const topCategories = financeData.categories.slice(0, 8);
        const otherAmount = financeData.categories.slice(8).reduce((sum, c) => sum + c.amount, 0);
        const pieLabels = topCategories.map(c => c.name);
        const pieData = topCategories.map(c => c.amount);
        if (otherAmount > 0) {
          pieLabels.push('Sonstiges');
          pieData.push(otherAmount);
        }
        const colors = ['#4f46e5', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#94a3b8'];
        pieEl.chart = new Chart(pieEl, {
          type: 'doughnut',
          data: {
            labels: pieLabels,
            datasets: [{ data: pieData, backgroundColor: colors.slice(0, pieLabels.length), borderWidth: 0 }]
          },
          options: { responsive: true, plugins: { legend: { position: 'right' } } }
        });
      }
    };

    initCharts();
  }, [financeData]);

  useEffect(() => {
    loadFinanceData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadFinanceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load calendar data when tab is active
  useEffect(() => {
    if (activeTab === 'termine' && !calendarData) {
      fetch('/api/calendar')
        .then(res => res.json())
        .then(setCalendarData)
        .catch(console.error);
    }
  }, [activeTab, calendarData]);

  // Load todos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    } else {
      setTodos([
        { id: 1, text: 'Rechnungen bezahlen', quadrant: 'q1', completed: false },
        { id: 2, text: 'Steuererklärung vorbereiten', quadrant: 'q2', completed: false },
        { id: 3, text: 'E-Mails sortieren', quadrant: 'q3', completed: false },
        { id: 4, text: 'Alte Dateien aufräumen', quadrant: 'q4', completed: true }
      ]);
    }
  }, []);

  const saveTodos = (newTodos) => {
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  const addTodo = (e) => {
    e.preventDefault();
    const text = document.getElementById('new-todo-text').value.trim();
    const quadrant = document.getElementById('new-todo-quadrant').value;
    
    if (text) {
      const newTodos = [...todos, { id: Date.now(), text, quadrant, completed: false }];
      saveTodos(newTodos);
      document.getElementById('new-todo-text').value = '';
    }
  };

  const toggleTodo = (id) => {
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos(newTodos);
  };

  const deleteTodo = (id) => {
    const newTodos = todos.filter(t => t.id !== id);
    saveTodos(newTodos);
  };

  const renderTodos = (quadrant) => {
    const filtered = todos.filter(t => t.quadrant === quadrant);
    if (filtered.length === 0) {
      return <li style={{ color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>Keine Aufgaben</li>;
    }
    return filtered.map(t => (
      <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
        <input type="checkbox" checked={t.completed} onChange={() => toggleTodo(t.id)} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
        <span style={{ flex: 1, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#64748b' : 'inherit' }}>{t.text}</span>
        <button onClick={() => deleteTodo(t.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.6 }}>×</button>
      </li>
    ));
  };

  return (
    <>
      <Head>
        <title>📊 Dashboard - Dominik</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personal dashboard for Dominik" />
      </Head>
      
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" />
      
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${inter.style.fontFamily}, system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #1a1a2e; min-height: 100vh; }
        .header { background: #1a1a2e; padding: 16px 24px; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .header-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .logo { color: white; font-size: 1.5rem; font-weight: 700; }
        .menu-toggle { display: none; background: none; border: none; color: white; font-size:rem; cursor: 1.5 pointer; }
        .nav { display: flex; gap: 8px; flex-wrap: wrap; }
        .nav-btn { background: transparent; border: none; color: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 500; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; }
        .nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .nav-btn.active { background: #4f46e5; color: white; }
        .main { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .tab-content { display: none; animation: fadeIn 0.3s ease; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 20px; }
        .stat-card h3 { font-size: 0.8rem; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
        .stat-card .value { font-size: 1.8rem; font-weight: 700; }
        .stat-card .value.positive { color: #22C55E; }
        .stat-card .value.negative { color: #EF4444; }
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
        .chart-card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 20px; }
        .chart-card h3 { font-size: 1rem; margin-bottom: 16px; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .category-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; }
        .category-item span:last-child { font-weight: 600; color: #4f46e5; }
        .transactions-table { width: 100%; border-collapse: collapse; }
        .transactions-table th, .transactions-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .transactions-table th { font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 600; }
        .transactions-table tr:hover { background: #f1f5f9; }
        .transactions-table td.amount { font-weight: 600; color: #EF4444; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .project-card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 24px; border-left: 4px solid #4f46e5; }
        .project-card.nordic { border-left-color: #8b5cf6; }
        .project-card h3 { font-size: 1.1rem; margin-bottom: 8px; }
        .project-card p { color: #64748b; font-size: 0.9rem; margin-bottom: 16px; }
        .project-status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
        .project-status.active { background: #dcfce7; color: #166534; }
        .progress-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #8b5cf6); border-radius: 4px; transition: width 0.3s ease; }
        .calendar-section { margin-bottom: 24px; }
        .calendar-section h3 { font-size: 1rem; margin-bottom: 12px; color: #64748b; }
        .event-list { display: grid; gap: 12px; }
        .event-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 3px solid #4f46e5; }
        .event-item.personal { border-left-color: #8b5cf6; }
        .event-time { min-width: 100px; font-size: 0.85rem; color: #64748b; }
        .event-title { flex: 1; font-weight: 500; }
        .event-location { font-size: 0.85rem; color: #64748b; }
        .no-events { color: #64748b; font-style: italic; padding: 20px; text-align: center; }
        .eisenhower-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .quadrant { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 16px; min-height: 200px; }
        .quadrant.q1 { border-top: 4px solid #EF4444; }
        .quadrant.q2 { border-top: 4px solid #4f46e5; }
        .quadrant.q3 { border-top: 4px solid #F59E0B; }
        .quadrant.q4 { border-top: 4px solid #94a3b8; }
        .quadrant h4 { font-size: 0.9rem; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .quadrant.q1 h4 { color: #EF4444; }
        .quadrant.q2 h4 { color: #4f46e5; }
        .quadrant.q3 h4 { color: #F59E0B; }
        .quadrant.q4 h4 { color: #94a3b8; }
        .quadrant .subtitle { font-size: 0.75rem; color: #64748b; margin-bottom: 12px; }
        .todo-list { list-style: none; }
        .add-todo-form { display: flex; gap: 12px; flex-wrap: wrap; background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .add-todo-form input[type="text"] { flex: 1; min-width: 200px; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; font-family: inherit; }
        .add-todo-form input[type="text"]:focus { outline: none; border-color: #4f46e5; }
        .add-todo-form select { padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; font-family: inherit; background: white; cursor: pointer; }
        .add-todo-form button { padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .add-todo-form button:hover { background: #4338ca; }
        @media (max-width: 768px) {
          .menu-toggle { display: block; }
          .nav { display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1a1a2e; flex-direction: column; padding: 16px; gap: 4px; }
          .nav.open { display: flex; }
          .nav-btn { width: 100%; justify-content: flex-start; }
          .charts-grid { grid-template-columns: 1fr; }
          .eisenhower-grid { grid-template-columns: 1fr; }
          .transactions-table { font-size: 0.85rem; }
          .add-todo-form { flex-direction: column; }
          .add-todo-form select, .add-todo-form button { width: 100%; }
        }
      `}</style>
      
      <header className="header">
        <div className="header-content">
          <div className="logo">📊 Dashboard</div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <button className={`nav-btn ${activeTab === 'finanzen' ? 'active' : ''}`} onClick={() => setActiveTab('finanzen')}>💰 Finanzen</button>
            <button className={`nav-btn ${activeTab === 'projekte' ? 'active' : ''}`} onClick={() => setActiveTab('projekte')}>🚀 Projekte</button>
            <button className={`nav-btn ${activeTab === 'termine' ? 'active' : ''}`} onClick={() => setActiveTab('termine')}>📅 Termine</button>
            <button className={`nav-btn ${activeTab === 'todos' ? 'active' : ''}`} onClick={() => setActiveTab('todos')}>✓ Todos</button>
          </nav>
        </div>
      </header>
      
      <main className="main">
        {/* Finanzen Tab */}
        <div className={`tab-content ${activeTab === 'finanzen' ? 'active' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>💰 Finanzen</h2>
            <button onClick={loadFinanceData} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔄 Aktualisieren
            </button>
          </div>
          {lastUpdated && <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString('de-DE')}</p>}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Ausgaben</h3>
              <div className="value">{financeData ? financeData.ausgaben.toLocaleString('de-DE') + '€' : 'Lädt...'}</div>
            </div>
            <div className="stat-card">
              <h3>Einnahmen</h3>
              <div className="value positive">{financeData ? financeData.einnahmen.toLocaleString('de-DE') + '€' : 'Lädt...'}</div>
            </div>
            <div className="stat-card">
              <h3>Netto</h3>
              <div className={`value ${financeData && financeData.netto >= 0 ? 'positive' : 'negative'}`}>
                {financeData ? (financeData.netto >= 0 ? '+' : '') + financeData.netto.toLocaleString('de-DE') + '€' : 'Lädt...'}
              </div>
            </div>
          </div>
          
          <div className="charts-grid">
            <div className="chart-card">
              <h3>📊 Monatliche Ausgaben</h3>
              <canvas id="barChart"></canvas>
            </div>
            <div className="chart-card">
              <h3>📈 Einnahmen vs Ausgaben</h3>
              <canvas id="lineChart"></canvas>
            </div>
            <div className="chart-card">
              <h3>🥧 Ausgaben nach Kategorie</h3>
              <canvas id="pieChart"></canvas>
            </div>
          </div>
          
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>🏷️ Kategorien</h2>
            <div className="category-grid">
              {financeData?.categories?.map((c, i) => (
                <div key={i} className="category-item">
                  <span>{c.name}</span>
                  <span>{c.amount.toLocaleString('de-DE')}€</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>📋 Letzte Transaktionen</h2>
            <table className="transactions-table">
              <thead><tr><th>Datum</th><th>Händler</th><th>Kategorie</th><th>Betrag</th></tr></thead>
              <tbody>
                {financeData?.transactionsList?.map((t, i) => (
                  <tr key={i}><td>{t.d}</td><td>{t.m || '-'}</td><td>{t.c}</td><td className="amount">-{t.a.toLocaleString('de-DE')}€</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Projekte Tab */}
        <div className={`tab-content ${activeTab === 'projekte' ? 'active' : ''}`}>
          <div className="projects-grid">
            <div className="project-card">
              <span className="project-status active">Aktiv</span>
              <h3>🎬 Buschkamp Bros Event-Manager</h3>
              <p>Event-Management System für Buschkamp Bros Veranstaltungen</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '65%' }}></div></div>
              <small style={{ color: '#64748b' }}>Fortschritt: 65%</small>
            </div>
            <div className="project-card nordic">
              <span className="project-status active">Aktiv</span>
              <h3>🚛 Nordic Trailer</h3>
              <p>Vermietung und Verwaltung von Anhängern</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '80%' }}></div></div>
              <small style={{ color: '#64748b' }}>Fortschritt: 80%</small>
            </div>
          </div>
        </div>
        
        {/* Termine Tab */}
        <div className={`tab-content ${activeTab === 'termine' ? 'active' : ''}`}>
          <div className="calendar-section">
            <h3>📅 Heute</h3>
            <div className="event-list">
              {calendarData?.today?.length > 0 ? calendarData.today.map((e, i) => (
                <div key={i} className={`event-item ${e.type || ''}`}>
                  <div className="event-time">{e.time}</div>
                  <div className="event-title">{e.title}</div>
                  <div className="event-location">{e.location}</div>
                </div>
              )) : <div className="no-events">Keine Termine heute</div>}
            </div>
          </div>
          <div className="calendar-section">
            <h3>📆 Diese Woche</h3>
            <div className="event-list">
              {calendarData?.thisWeek?.length > 0 ? calendarData.thisWeek.map((e, i) => (
                <div key={i} className={`event-item ${e.type || ''}`}>
                  <div className="event-time">{e.day} {e.time}</div>
                  <div className="event-title">{e.title}</div>
                  <div className="event-location">{e.location}</div>
                </div>
              )) : <div className="no-events">Keine Termine diese Woche</div>}
            </div>
          </div>
        </div>
        
        {/* Todos Tab */}
        <div className={`tab-content ${activeTab === 'todos' ? 'active' : ''}`}>
          <div className="eisenhower-grid">
            <div className="quadrant q1">
              <h4>🔴 Sofort erledigen</h4>
              <div className="subtitle">Dringend & Wichtig</div>
              <ul className="todo-list">{renderTodos('q1')}</ul>
            </div>
            <div className="quadrant q2">
              <h4>🔵 Terminieren</h4>
              <div className="subtitle">Nicht dringend & Wichtig</div>
              <ul className="todo-list">{renderTodos('q2')}</ul>
            </div>
            <div className="quadrant q3">
              <h4>🟡 Delegieren</h4>
              <div className="subtitle">Dringend & Nicht wichtig</div>
              <ul className="todo-list">{renderTodos('q3')}</ul>
            </div>
            <div className="quadrant q4">
              <h4>⚫ Eliminieren</h4>
              <div className="subtitle">Nicht dringend & Nicht wichtig</div>
              <ul className="todo-list">{renderTodos('q4')}</ul>
            </div>
          </div>
          
          <form className="add-todo-form" onSubmit={addTodo}>
            <input type="text" id="new-todo-text" placeholder="Neue Aufgabe..." required />
            <select id="new-todo-quadrant">
              <option value="q1">🔴 Sofort erledigen</option>
              <option value="q2">🔵 Terminieren</option>
              <option value="q3">🟡 Delegieren</option>
              <option value="q4">⚫ Eliminieren</option>
            </select>
            <button type="submit">+ Hinzufügen</button>
          </form>
        </div>
      </main>

      {/* Load Chart.js */}
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
    </>
  );
}
