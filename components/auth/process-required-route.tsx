"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProcess } from "@/lib/context/process-context";
import { Loader2 } from "lucide-react";

interface ProcessRequiredRouteProps {
	children: React.ReactNode;
}

export function ProcessRequiredRoute({ children }: ProcessRequiredRouteProps) {
	const { hasSelectedProceso } = useProcess();
	const router = useRouter();

	useEffect(() => {
		if (!hasSelectedProceso) {
			router.replace("/seleccionar-proceso");
		}
	}, [hasSelectedProceso, router]);

	if (!hasSelectedProceso) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
