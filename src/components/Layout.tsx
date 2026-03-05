import { ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Leaf, ChevronRight, Home } from 'lucide-react';

const Layout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const crumbs = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Farm Inspector</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {crumbs.length > 0 && (
        <div className="container py-2">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => navigate('/')} className="hover:text-foreground flex items-center gap-1">
              <Home className="h-3.5 w-3.5" /> Home
            </button>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="capitalize">{decodeURIComponent(crumb).replace(/-/g, ' ')}</span>
              </span>
            ))}
          </nav>
        </div>
      )}

      <main className="container py-6">{children}</main>
    </div>
  );
};

export default Layout;
