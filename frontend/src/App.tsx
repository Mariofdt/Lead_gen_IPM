import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HamburgerMenu } from './components/HamburgerMenu';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Don't show navigation on login page or when not authenticated
  const showNavigation = isAuthenticated && location.pathname !== '/login' && location.pathname !== '/';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsMobileMenuOpen(false);
    }
  }, [isAuthenticated]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="modern-layout">
      {showNavigation && (
        <>
          <HamburgerMenu isOpen={isMobileMenuOpen} onToggle={handleMobileMenuToggle} />
          <Navigation isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />
        </>
      )}
      <main className={`modern-main ${!showNavigation ? 'full-width' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
