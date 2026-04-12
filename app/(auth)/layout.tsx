"use client";

import { Toaster } from "@/components/ui/sonner";
import { PublicRoute } from "@/components/auth/public-route";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PublicRoute>
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				{children}
				<Toaster />
			</div>
		</PublicRoute>
	);
}
