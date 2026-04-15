import { api } from "./axios";

export interface ReporteParams {
  procesoId: number;
  distritoId: number;
}

export async function getReporteResumen(params: ReporteParams) {
  const { data } = await api.post("/reportes/data/distrito/resumen", params);
  return data;
}

export async function getReportePersonas(params: ReporteParams) {
  const { data } = await api.post("/reportes/data/distrito/personas", params);
  return data;
}

export async function getReporteRecintos(params: ReporteParams) {
  const { data } = await api.post("/reportes/data/distrito/recintos", params);
  return data;
}

export async function getReporteFaltantes(params: ReporteParams) {
  const { data } = await api.post("/reportes/data/distrito/faltantes", params);
  return data;
}