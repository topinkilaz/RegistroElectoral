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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarGroups = [
	{
		title: "General",
		items: [
			{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
			{ title: "Analíticas", href: "/dashboard/analytics", icon: BarChart3 },
			{ title: "Configuración", href: "/dashboard/settings", icon: Settings },
		],
	},
	{
		title: "Páginas",
		items: [
			{ title: "Usuarios", href: "/dashboard/users", icon: Users },
			{ title: "Proyectos", href: "/dashboard/projects", icon: FolderKanban },
			{ title: "Documentos", href: "/dashboard/documents", icon: FileText },
			{ title: "Calendario", href: "/dashboard/calendar", icon: Calendar },
			{ title: "Autenticación", href: "/dashboard/auth", icon: LogIn },
			{ title: "Errores", href: "/dashboard/errors", icon: AlertCircle },
		],
	},
	{
		title: "Otros",
		items: [
			{ title: "Mensajes", href: "/dashboard/messages", icon: MessageSquare },
			{ title: "Base de datos", href: "/dashboard/database", icon: Database },
			{ title: "Seguridad", href: "/dashboard/security", icon: Shield },
			{ title: "Ayuda", href: "/dashboard/help", icon: HelpCircle },
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
						? "bg-primary text-primary-foreground shadow-md"
						: "text-muted-foreground hover:text-foreground hover:bg-muted",
					isCollapsed && "justify-center px-2 py-3"
				)}
			>
				<Icon
					className={cn(
						"shrink-0 transition-all duration-200",
						isCollapsed ? "h-5 w-5" : "h-4 w-4",
						!isActive && "group-hover:scale-110"
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
					isOpen
						? "translate-x-0 w-72"
						: "-translate-x-full lg:translate-x-0"
				)}
			>
				{/* Logo */}
				<div
					className={cn(
						"flex h-16 items-center border-b shrink-0",
						isCollapsed ? "justify-center px-3" : "justify-between px-4"
					)}
				>
					{!isCollapsed ? (
						<>
							<Link
								href="/dashboard"
								className="flex items-center gap-3 group"
								onClick={handleLinkClick}
							>
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shrink-0">
									<LayoutDashboard className="w-5 h-5 text-primary-foreground" />
								</div>
								<div className="flex flex-col min-w-0">
									<span className="text-lg font-bold truncate group-hover:text-primary transition-colors">
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
									className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md"
									onClick={handleLinkClick}
								>
									<LayoutDashboard className="w-5 h-5 text-primary-foreground" />
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
						{sidebarGroups.map((group) => (
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
											<NavItem key={item.href} item={item} isActive={isActive} />
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
							© 2024 Dashboard
						</p>
					</div>
				)}
			</aside>
		</TooltipProvider>
	);
}
