export interface Localidad {
  id: number;
  nombre: string;
}

export interface DistritoMunicipal {
  id: number;
  nombre: string;
}

export interface Recinto {
  id: number;
  nombre: string;
  direccion: string | null;
  coordenadasGps: string | null;
  codigo: string;
  estado: string;
  cantidadMesas: number;
  procesoId: number;
  distritoMunicipalId: number | null;
  localidadId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  eliminado: boolean;
  localidad: Localidad;
  distritoMunicipal?: DistritoMunicipal | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RecintosResponse {
  statusCode: number;
  message: string;
  data: Recinto[];
  pagination: PaginationInfo;
}

export interface RecintosParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRecintoDto {
  nombre: string;
  direccion?: string;
  coordenadasGps?: string;
  codigo: string;
  cantidadMesas: number;
  distritoMunicipalId?: number;
  localidadId: number;
  procesoId?: number;
}

export interface UpdateRecintoDto {
  nombre?: string;
  direccion?: string;
  coordenadasGps?: string;
  codigo?: string;
  cantidadMesas?: number;
  distritoMunicipalId?: number;
  localidadId?: number;
}

export interface CambiarEstadoRecintoDto {
  eliminado: boolean;
}