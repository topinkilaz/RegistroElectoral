import { useQuery } from "@tanstack/react-query";
import { getProcesos } from "@/lib/api/procesos";

export const useProcesos = () => {
	return useQuery({
		queryKey: ["procesos"],
		queryFn: getProcesos,
	});
};
