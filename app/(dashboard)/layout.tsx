"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	return (
		<ProtectedRoute>
			<div className="relative flex h-screen overflow-hidden bg-background">
				<Sidebar
					isOpen={sidebarOpen}
					isCollapsed={sidebarCollapsed}
					onClose={() => setSidebarOpen(false)}
					onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
				/>
				<div className="flex-1 flex flex-col overflow-hidden">
					<Topbar onMenuClick={() => setSidebarOpen(true)} />
					<main
						className={cn(
							"flex-1 overflow-auto p-4 md:p-6 lg:p-8",
							sidebarCollapsed ? "lg:max-w-[calc(100vw-72px)]" : "lg:max-w-[calc(100vw-18rem)]"
						)}
					>
						<div className="min-h-[calc(100vh-8rem)]">{children}</div>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
