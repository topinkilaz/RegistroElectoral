export interface Localidad {
  id: number;
  nombre: string;
  municipio: {
    id: number;
    nombre: string;
  };
}

export interface Delegados {
  titulares: number;
  reservas: number;
  total: number;
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
  jefe: string | null;
  delegados: Delegados;
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
}