import { useMutation } from "@tanstack/react-query";
import {
  getReporteResumen,
  getReportePersonas,
  getReporteRecintos,
  getReporteFaltantes,
  type ReporteParams,
} from "@/lib/api/reportes-distrito";

export function useReporteResumen() {
  return useMutation({
    mutationFn: (params: ReporteParams) => getReporteResumen(params),
  });
}

export function useReportePersonas() {
  return useMutation({
    mutationFn: (params: ReporteParams) => getReportePersonas(params),
  });
}

export function useReporteRecintos() {
  return useMutation({
    mutationFn: (params: ReporteParams) => getReporteRecintos(params),
  });
}

export function useReporteFaltantes() {
  return useMutation({
    mutationFn: (params: ReporteParams) => getReporteFaltantes(params),
  });
}