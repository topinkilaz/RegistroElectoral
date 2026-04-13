"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Proceso } from "@/lib/types/proceso";

interface ProcessContextType {
	proceso: Proceso | null;
	procesoId: number | null;
	setProceso: (proceso: Proceso) => void;
	clearProceso: () => void;
	hasSelectedProceso: boolean;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

const PROCESS_STORAGE_KEY = "selected_proceso";

export function ProcessProvider({ children }: { children: ReactNode }) {
	const [proceso, setProcesoState] = useState<Proceso | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(PROCESS_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setProcesoState(parsed);
			} catch {
				localStorage.removeItem(PROCESS_STORAGE_KEY);
			}
		}
		setIsLoaded(true);
	}, []);

	const setProceso = (newProceso: Proceso) => {
		setProcesoState(newProceso);
		localStorage.setItem(PROCESS_STORAGE_KEY, JSON.stringify(newProceso));
	};

	const clearProceso = () => {
		setProcesoState(null);
		localStorage.removeItem(PROCESS_STORAGE_KEY);
	};

	if (!isLoaded) {
		return null;
	}

	return (
		<ProcessContext.Provider
			value={{
				proceso,
				procesoId: proceso?.id ?? null,
				setProceso,
				clearProceso,
				hasSelectedProceso: proceso !== null,
			}}
		>
			{children}
		</ProcessContext.Provider>
	);
}

export function useProcess() {
	const context = useContext(ProcessContext);
	if (context === undefined) {
		throw new Error("useProcess debe usarse dentro de un ProcessProvider");
	}
	return context;
}
