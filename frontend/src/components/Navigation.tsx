import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/email-templates', label: 'Template Email', icon: '📧' },
    { path: '/leads', label: 'Leads', icon: '👥' },
    { path: '/campaigns', label: 'Campagne', icon: '🚀' },
    { path: '/settings', label: 'Impostazioni', icon: '⚙️' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    // Close mobile menu when link is clicked
    onClose();
  };

  return (
    <div className={`modern-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
          <div className="modern-sidebar-header">
            <Link to="/dashboard" className="flex justify-center" onClick={handleLinkClick}>
              <img 
                src="https://www.ipermoney.com/_next/static/media/logod.9f2fba9f.svg" 
                alt="IperMoney Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

      {/* Menu Items */}
      <nav className="modern-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`modern-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
