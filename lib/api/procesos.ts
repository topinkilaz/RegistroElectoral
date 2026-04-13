import { api } from "./axios";
import type { ProcesosResponse } from "@/lib/types/proceso";

export const getProcesos = async (): Promise<ProcesosResponse> => {
	const response = await api.get<ProcesosResponse>("/procesos");
	return response.data;
};
