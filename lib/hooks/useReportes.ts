import { useQuery } from "@tanstack/react-query";
import { getReporteResultado } from "@/lib/api/reportes";
import type { ReporteResultadoParams } from "@/lib/types/reporte";

export function useReporteResultado(
  params: ReporteResultadoParams | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["reporte-resultado", params],
    queryFn: () => getReporteResultado(params!),
    enabled: enabled && !!params?.procesoId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
