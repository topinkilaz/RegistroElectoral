import { useQuery } from "@tanstack/react-query";
import { getReporteDuplicados } from "@/lib/api/reportesDuplicados";
import type { ReporteDuplicadosParams } from "@/lib/types/reporteDuplicados";

export function useReporteDuplicados(params: ReporteDuplicadosParams | null) {
  return useQuery({
    queryKey: ["reporte-duplicados", params],
    queryFn: () => getReporteDuplicados(params!),
    enabled: !!params && !!params.procesoId,
    staleTime: 1000 * 60 * 2,
  });
}