"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Database,
  MessageSquare,
  Shield,
  HelpCircle,
  LogIn,
  AlertCircle,
  X,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/context/auth-context";
import { ROLES, type Role } from "@/lib/config/roles";
import type { LucideIcon } from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    title: "General",
    items: [
      {
        title: "Inicio",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [ROLES.ADMIN, ROLES.EDITOR, ROLES.VISOR],
      },
    ],
  },
  {
    title: "Acciones",
    items: [
      {
        title: "Usuarios",
        href: "/dashboard/users",
        icon: Users,
        roles: [ROLES.ADMIN],
      },
      {
        title: "Mis recintos",
        href: "/dashboard/assignments",
        icon: FolderKanban,
        roles: [ROLES.ADMIN, ROLES.EDITOR],
      },
    ],
  },
  {
    title: "Otros",
    items: [
      {
        title: "Duplicados",
        href: "/dashboard/duplicados",
        icon: AlertCircle,
        roles: [ROLES.ADMIN, ROLES.EDITOR],
      },
      {
        title: "Agrupaciones",
        href: "/dashboard/agrupaciones",
        icon: BarChart3,
        roles: [ROLES.ADMIN, ROLES.EDITOR],
      },
      {
        title: "Distritos",
        href: "/dashboard/distritos",
        icon: Database,
        roles: [ROLES.ADMIN, ROLES.EDITOR],
      },
      {
        title: "Recintos",
        href: "/dashboard/recintos-table",
        icon: MapPin,
        roles: [ROLES.ADMIN, ROLES.EDITOR],
      },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = false,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { userRoles } = useAuth();

  // Filtrar grupos y elementos según los roles del usuario
  const filteredGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.some((role) =>
          userRoles.some((userRole) => userRole.toUpperCase() === role)
        );
      }),
    }))
    .filter((group) => group.items.length > 0);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const NavItem = ({
    item,
    isActive,
  }: {
    item: (typeof sidebarGroups)[0]["items"][0];
    isActive: boolean;
  }) => {
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        onClick={handleLinkClick}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sky-600 text-white shadow-md"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          isCollapsed && "justify-center px-2 py-3",
        )}
      >
        <Icon
          className={cn(
            "shrink-0 transition-all duration-200",
            isCollapsed ? "h-5 w-5" : "h-4 w-4",
            !isActive && "group-hover:scale-110",
          )}
        />
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-card shadow-lg transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-[72px]" : "lg:w-72",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center border-b shrink-0",
            isCollapsed ? "justify-center px-3" : "justify-between px-4",
          )}
        >
          {!isCollapsed ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group"
                onClick={handleLinkClick}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 flex items-center justify-center shadow-md shrink-0">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-bold truncate group-hover:text-sky-500 transition-colors">
                    Dashboard
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Panel Admin
                  </span>
                </div>
              </Link>

              {/* Botón cerrar en móvil */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden shrink-0"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Botón colapsar en desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden lg:flex shrink-0"
                onClick={onToggleCollapse}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 flex items-center justify-center shadow-md"
                  onClick={handleLinkClick}
                >
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Botón expandir cuando está colapsado */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-3 border-b shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleCollapse}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.title}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                    {group.title}
                  </h3>
                )}

                {isCollapsed && <div className="h-px bg-border mx-2 mb-3" />}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <NavItem
                        key={item.href}
                        item={item}
                        isActive={isActive}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t p-4 shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Inicio
            </p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
