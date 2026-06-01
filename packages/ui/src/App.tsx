import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { getWelcomeMessage } from '@mnemo/core';
import NotesPage from './pages/notes-page';
import WorkingPage from './pages/working-page';
import RecallPage from './pages/recall-page';
import NotFoundPage from './pages/not-found-page';
import './index.css';

export default function App() {
  const status = getWelcomeMessage();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-nav">
          <h1>Mnemo UI</h1>
          <nav>
            <NavLink to="/notes" className={({ isActive }) => (isActive ? 'active' : '')}>
              Notes
            </NavLink>
            <NavLink to="/working" className={({ isActive }) => (isActive ? 'active' : '')}>
              Working
            </NavLink>
            <NavLink to="/recall" className={({ isActive }) => (isActive ? 'active' : '')}>
              Recall
            </NavLink>
          </nav>
        </header>

        <main>
          <section className="welcome-card">
            <p>{status.message}</p>
            <p>Loaded at: {status.timestamp}</p>
            <p>Use the API at <code>/api/health</code>.</p>
          </section>

          <Routes>
            <Route path="/" element={<section><h2>Home</h2><p>Select an archetype from the navigation bar above.</p></section>} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/working" element={<WorkingPage />} />
            <Route path="/recall" element={<RecallPage />} />
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
