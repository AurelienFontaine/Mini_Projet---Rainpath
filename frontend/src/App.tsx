import { Link, Outlet, useLocation } from 'react-router-dom';

export function App() {
  const location = useLocation();
  const isCases = location.pathname === '/' || location.pathname.startsWith('/cases');
  const isCreate = location.pathname.startsWith('/create');
  return (
    <>
      <div className="navbar">
        <div className="container">
          <nav className="nav">
            <Link to="/cases" className={`nav-link ${isCases ? 'active' : ''}`}>Dossiers</Link>
            <Link to="/create" className={`nav-link ${isCreate ? 'active' : ''}`}>Créer un dossier</Link>
          </nav>
        </div>
      </div>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}


