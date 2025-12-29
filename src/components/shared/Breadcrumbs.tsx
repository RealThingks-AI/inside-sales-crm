import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/contacts": "Contacts",
  "/accounts": "Accounts",
  "/deals": "Deals",
  "/tasks": "Tasks",
  "/meetings": "Meetings",
  "/settings": "Settings",
  "/notifications": "Notifications",
};

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from route if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];

    let currentPath = "";
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = routeLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
      crumbs.push({
        label,
        href: index < pathParts.length - 1 ? currentPath : undefined,
      });
    });

    return crumbs;
  })();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}
    >
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="w-3.5 h-3.5" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
