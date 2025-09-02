import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Terminal, Search, Network, FileText, Wrench, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Comandos', href: '/', icon: Search },
    { name: 'Circuitos', href: '/circuitos', icon: Network },
    { name: 'Chamados Tratados', href: '/notas', icon: FileText },
    { name: 'Troubleshooting', href: '/troubleshooting', icon: Wrench },
    { name: 'Backup', href: '/backup', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Terminal className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-primary">NOC-N2 Terminal</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-card-foreground hover:bg-secondary hover:text-secondary-foreground'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-card-foreground hover:bg-secondary hover:text-secondary-foreground'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Terminal Status Bar */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-primary">●</span>
              <span className="text-muted-foreground">NOC-N2 Terminal Online</span>
            </div>
            <div className="text-muted-foreground">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;