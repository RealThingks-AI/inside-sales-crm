import { 
  Home, 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings,
  LogOut,
  Pin,
  PinOff,
  Bell,
  Sun,
  Moon,
  Building2,
  CheckSquare
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useThemePreferences } from "@/hooks/useThemePreferences";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Video } from "lucide-react";

const allMenuItems = [
  { title: "Dashboard", url: "/", route: "/dashboard", icon: Home },
  { title: "Accounts", url: "/accounts", route: "/accounts", icon: Building2 },
  { title: "Contacts", url: "/contacts", route: "/contacts", icon: Users },
  { title: "Leads", url: "/leads", route: "/leads", icon: UserPlus },
  { title: "Meetings", url: "/meetings", route: "/meetings", icon: Video },
  { title: "Deals", url: "/deals", route: "/deals", icon: BarChart3 },
  { title: "Tasks", url: "/tasks", route: "/tasks", icon: CheckSquare },
  { title: "Settings", url: "/settings", route: "/settings", icon: Settings },
];

interface AppSidebarProps {
  isFixed?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

interface PagePermission {
  route: string;
  admin_access: boolean;
  manager_access: boolean;
  user_access: boolean;
}

export function AppSidebar({ isFixed = false, isOpen, onToggle }: AppSidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [userRole, setUserRole] = useState<string>('user');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useThemePreferences();
  const currentPath = location.pathname;

  // Fetch user role and permissions
  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      if (!user) return;

      try {
        // Get user role from user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const role = roleData?.role || user.user_metadata?.role || 'user';
        setUserRole(role);

        // Get all page permissions
        const { data: permData } = await supabase
          .from('page_permissions')
          .select('route, admin_access, manager_access, user_access');

        setPermissions(permData || []);
      } catch (error) {
        console.error('Error fetching role/permissions:', error);
      }
    };

    fetchRoleAndPermissions();
  }, [user]);

  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      const permission = permissions.find(p => p.route === item.route);
      if (!permission) return true; // Allow if no permission record exists

      switch (userRole) {
        case 'admin':
          return permission.admin_access;
        case 'manager':
          return permission.manager_access;
        case 'user':
        default:
          return permission.user_access;
      }
    });
  }, [permissions, userRole]);

  // Use external state if provided (for fixed mode), otherwise use internal state
  const sidebarOpen = isFixed ? (isOpen ?? false) : isPinned;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const handleSignOutClick = () => {
    setShowSignOutDialog(true);
  };

  const handleSignOutConfirm = async () => {
    setShowSignOutDialog(false);
    await signOut();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const getThemeIcon = () => {
    return theme === 'light' ? Sun : Moon;
  };

  const getThemeTooltipText = () => {
    return theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User';
  };

  const togglePin = () => {
    if (isFixed) {
      onToggle?.(!sidebarOpen);
    } else {
      setIsPinned(!isPinned);
    }
  };

  return (
    <div 
      className={`h-screen flex flex-col border-r border-sidebar-border bg-sidebar-background transition-all duration-300 ease-in-out relative ${
        isFixed ? 'relative' : ''
      }`}
      style={{ 
        width: sidebarOpen ? '160px' : '48px',
        minWidth: sidebarOpen ? '160px' : '48px',
        maxWidth: sidebarOpen ? '160px' : '48px'
      }}
    >
      {/* Header */}
      <div className="flex items-center border-b border-sidebar-border relative h-14 px-3">
        <div 
          className="flex items-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            <img 
              src="/lovable-uploads/12bdcc4a-a1c8-4ccf-ba6a-931fd566d3c8.png" 
              alt="Logo" 
              className="w-7 h-7 object-contain"
            />
          </div>
          <div 
            className={`ml-2 text-sidebar-foreground font-semibold text-base whitespace-nowrap transition-all duration-300 overflow-hidden ${
              sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            RealThingks
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
      <nav className={`space-y-2 ${sidebarOpen ? 'px-3' : 'px-2'}`}>
          {menuItems.map((item) => {
            const active = isActive(item.url);
            const menuButton = (
              <NavLink
                to={item.url}
                className={`
                  flex items-center rounded-lg transition-colors duration-200 font-medium
                  ${sidebarOpen ? 'h-10 gap-3' : 'w-10 h-10 justify-center mx-auto'}
                  ${active 
                    ? 'text-sidebar-primary bg-sidebar-accent' 
                    : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {item.title}
                  </span>
                )}
              </NavLink>
            );

            if (!sidebarOpen) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    {menuButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={item.title}>
                {menuButton}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={`border-t border-sidebar-border p-2 space-y-2 ${sidebarOpen ? 'px-3' : 'px-2'}`}>
        {/* Notification Bell */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleNotificationClick}
              className={`
                flex items-center rounded-lg transition-colors font-medium
                ${sidebarOpen ? 'h-10 gap-3' : 'w-10 h-10 justify-center mx-auto'}
                ${currentPath === '/notifications' 
                  ? 'text-sidebar-primary bg-sidebar-accent' 
                  : 'text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/50'
                }
              `}
            >
              <Bell className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Notifications
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleThemeToggle}
              className={`
                flex items-center rounded-lg transition-colors font-medium
                ${sidebarOpen ? 'h-10 gap-3' : 'w-10 h-10 justify-center mx-auto'}
                text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/50
              `}
            >
              {(() => {
                const ThemeIcon = getThemeIcon();
                return <ThemeIcon className="w-5 h-5 flex-shrink-0" />;
              })()}
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Theme
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{getThemeTooltipText()}</p>
          </TooltipContent>
        </Tooltip>

        {/* Pin Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={togglePin}
              className={`
                flex items-center rounded-lg transition-colors font-medium
                ${sidebarOpen ? 'h-10 gap-3' : 'w-10 h-10 justify-center mx-auto'}
                text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/50
              `}
            >
              {sidebarOpen ? <Pin className="w-5 h-5 flex-shrink-0" /> : <PinOff className="w-5 h-5 flex-shrink-0" />}
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Collapse
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}</p>
          </TooltipContent>
        </Tooltip>

        {/* User & Sign Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSignOutClick}
              className={`
                flex items-center rounded-lg transition-colors font-medium
                ${sidebarOpen ? 'h-10 gap-3' : 'w-10 h-10 justify-center mx-auto'}
                text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/50
              `}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {getUserDisplayName()}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Sign Out</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOutConfirm}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
