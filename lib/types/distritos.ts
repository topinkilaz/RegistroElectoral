export interface Municipio {
  id: number;
  nombre: string;
}

export interface DistritoMunicipal {
  id: number;
  nombre: string;
  codigo: string;
  municipio: Municipio;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

// La respuesta es un array directo
export type DistritosResponse = DistritoMunicipal[];

export interface CreateDistritoDto {
  nombre: string;
  codigo: string;
  municipioId: number;
  createdBy?: number;
}

export interface UpdateDistritoDto {
  nombre?: string;
  codigo?: string;
  municipioId?: number;
}