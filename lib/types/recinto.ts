

export interface Mesa {
  id: number;
  numero: string;
  codigo: string;
  totalHabilitados: number;
  totalInhabilitados: number;
  delegadosMesa: any[];
}

export interface Localidad {
  id: number;
  nombre: string;
  municipio: {
    id: number;
    nombre: string;
  };
}

export interface ResumenDelegados {
  titulares: number;
  reservas: number;
  total: number;
}

export interface JefeRecinto {
  id: number;
  tipo: string;
  estado: string;
  enGrupoWhatsapp?: boolean;
  tieneFotocopiaCarnet?: boolean;
  agrupacionId?: number | null;  
  agrupacion?: {
    id: number;
    nombre: string;
    sigla: string;
  } | null;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
}

export interface DelegadoReserva {
  id: number;
  tipo: string;
  estado: string;
  enGrupoWhatsapp?: boolean;
  tieneFotocopiaCarnet?: boolean;
  agrupacionId?: number | null;  
  agrupacion?: {
    id: number;
    nombre: string;
    sigla: string;
  } | null;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
}

export interface Recinto {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string | null;
  estado: string;
  cantidadMesas: number;
  localidad: Localidad;
  distritoMunicipal: string | null;
  mesas: Mesa[];
  jefes: JefeRecinto[];
  delegadosReserva: DelegadoReserva[];
  resumenDelegados?: ResumenDelegados;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface RecintosResponse {
  data: Recinto[];
  pagination: PaginationInfo;
}

export interface RecintosParams {
  procesoId: number;
  page?: number;
  limit?: number;
  search?: string;
}