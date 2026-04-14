export interface GrupoRecinto {
  id: number;
  nombre: string;
  descripcion?: string;
  procesoId: number;
  recintos?: RecintoEnGrupo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecintoEnGrupo {
  id: number;
  nombre: string;
  codigo?: string;
}

export interface CreateGrupoRecintoDto {
  nombre: string;
  descripcion?: string;
  procesoId: number;
}

export interface UpdateGrupoRecintoDto {
  nombre?: string;
  descripcion?: string;
}

export interface AsignarRecintosDto {
  recintoIds: number[];
}

export interface GrupoRecintoResponse {
  statusCode: number;
  message: string;
  data: GrupoRecinto[];
}
