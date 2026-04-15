export type TipoPersonal = "titular" | "reserva";

export interface JefeRecinto {
  id: number;
  nombres: string;
  apellidos: string;
  numDocumento: string;
  celular: string;
  tipo: TipoPersonal;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  procesoId: number;
  recintoId: number;
  agrupacionId?: number | null;
  agrupacion?: {
    id: number;
    nombre: string;
    sigla: string;
  } | null;
  createdAt?: string;
}

export interface CreateJefeRecintoDto {
  nombres: string;
  apellidos: string;
  numDocumento: string;
  celular: string;
  procesoId: number;
  recintoId: number;
  tipo: TipoPersonal;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  agrupacionId?: number| null;
}

export interface UpdateJefeRecintoDto {
  usuarioId?: number;
  tipo?: TipoPersonal;
  enGrupoWhatsapp?: boolean;
  tieneFotocopiaCarnet?: boolean;
  agrupacionId?: number| null;
}

// Tipos para mis-datos endpoint
export interface LocalidadInfo {
  id: number;
  nombre: string;
  municipio?: {
    id: number;
    nombre: string;
    provincia?: {
      id: number;
      nombre: string;
    };
  };
}

export interface RecintoInfo {
  id: number;
  nombre: string;
  codigo: string;
  direccion?: string | null;
  localidad?: LocalidadInfo;
  distritoMunicipal?: {
    id: number;
    nombre: string;
  } | null;
}

export interface DelegadoMesaEnJefe {
  id: number;
  tipo: string;
  estado: string;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  agrupacionId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  eliminado: boolean;
  createdBy: number;
  usuarioId: number;
  procesoId: number;
  recintoId: number;
  mesaId: number | null;
  jefeRecintoId: number;
  usuario?: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
  mesa?: {
    id: number;
    numero: string;
    codigo: string;
  } | null;
  agrupacion?: {
    id: number;
    nombre: string;
  } | null;
}

export interface MisDatosJefeRecinto {
  id: number;
  tipo: TipoPersonal;
  estado: string;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  agrupacionId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  eliminado: boolean;
  createdBy: number;
  usuarioId: number;
  procesoId: number;
  recintoId: number;
  proceso?: {
    id: number;
    nombre: string;
  };
  agrupacion?: {
    id: number;
    nombre: string;
  } | null;
  recinto?: RecintoInfo;
  delegadosMesa?: DelegadoMesaEnJefe[];
}
