export interface ReporteDuplicadosParams {
  procesoId: number;
  tipo: "JEFE" | "DELEGADO" | "AMBOS";
  orden: "asc" | "desc";
  campoDuplicado: "WHATSAPP";
}

export interface RegistroDuplicado {
  tipo: string;
  subtipo: string;
  nombre: string;
  ci: string;
  whatsapp: string;
  recinto: string;
  mesa: string | null;
  agrupacion: string;
  grupoWhatsapp: number;
  fotocopiaCarnet: number;
}

export interface GrupoDuplicado {
  campo: string;
  valor: string;
  total: number;
  registros: RegistroDuplicado[];
}

export interface ReporteDuplicadosResponse {
  statusCode: number;
  message: string;
  totalGrupos: number;
  totalRegistros: number;
  campoEvaluado: string;
  data: GrupoDuplicado[];
}