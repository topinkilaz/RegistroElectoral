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
			<div className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden">
				{children}
				<Toaster />
				{/* Soft Backdrop */}
				<div className="fixed inset-0 -z-10 pointer-events-none">
					<div className="absolute left-1/2 top-20 -translate-x-1/2 w-[980px] h-[460px] bg-gradient-to-tr from-blue-500/25 to-transparent rounded-full blur-3xl" />
					<div className="absolute right-12 bottom-10 w-[420px] h-[220px] bg-gradient-to-bl from-sky-400/20 to-transparent rounded-full blur-2xl" />
				</div>
			</div>
		</PublicRoute>
	);
}
