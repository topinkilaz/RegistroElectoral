export interface GrupoRecinto {
  _count?: {
    recintos: number;
  };
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado?: "ACTIVO" | "INACTIVO";
  procesoId: number;
  recintos?: RecintoEnGrupo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecintoEnGrupo {
  id: number;
  nombre: string;
  codigo?: string;
  localidad?: {
    nombre: string;
    municipio?: {
      nombre: string;
    };
  };
  distritoMunicipal?: string | null;
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

export interface QuitarRecintosDto {
  recintoIds: number[];
}

export interface GrupoRecintoResponse {
  statusCode: number;
  message: string;
  data: GrupoRecinto[];
}