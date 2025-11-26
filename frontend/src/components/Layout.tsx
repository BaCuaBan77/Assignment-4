import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Sensor Monitoring System</h1>
        </div>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/sensors" className={isActive('/sensors') || location.pathname.startsWith('/sensors/') ? 'active' : ''}>
              Sensors
            </Link>
          </li>
          <li>
            <Link to="/owners" className={isActive('/owners') || location.pathname.startsWith('/owners/') ? 'active' : ''}>
              Owners
            </Link>
          </li>
          <li>
            <Link to="/alarms" className={isActive('/alarms') ? 'active' : ''}>
              Alarms
            </Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;

