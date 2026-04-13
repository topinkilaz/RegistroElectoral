export interface Localidad {
  id: number;
  nombre: string;
}

export interface Recinto {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  eliminado: boolean;
  procesoId: number;
  localidad: Localidad;
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
  localidadId: number;
  procesoId?: number;
}

export interface UpdateRecintoDto {
  nombre?: string;
  localidadId?: number;
}

export interface CambiarEstadoRecintoDto {
  eliminado: boolean;
}