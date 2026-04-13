export type EstadoAgrupacion = "ACTIVO" | "INACTIVO";

export interface Agrupacion {
  id: number;
  nombre: string;
  sigla: string;
  estado: EstadoAgrupacion;
  procesoId: number;
  createdAt: string;
  updatedAt?: string; // Opcional si no viene
  createdBy?: number; // Opcional si no viene
}

// La respuesta es un array directo, no tiene paginación
export type AgrupacionesResponse = Agrupacion[];

export interface AgrupacionesParams {
  search?: string;
  procesoId: number;
}

export interface CreateAgrupacionDto {
  nombre: string;
  sigla: string;
  procesoId: number;
}

export interface UpdateAgrupacionDto {
  nombre?: string;
  sigla?: string;
  estado?: EstadoAgrupacion;
}