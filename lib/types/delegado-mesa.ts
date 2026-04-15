export type TipoDelegado = "titular" | "reserva";

export interface DelegadoMesa {
  id: number;
  nombres: string;
  apellidos: string;
  numDocumento: string;
  celular: string;
  tipo: TipoDelegado;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  procesoId: number;
  mesaId?: number | null;
  agrupacionId?: number | null;
  agrupacion?: {
    id: number;
    nombre: string;
    sigla: string;
  } | null;
  createdAt?: string;
}

export interface CreateDelegadoMesaDto {
  nombres: string;
  apellidos: string;
  numDocumento: string;
  celular: string;
  procesoId: number;
  tipo: TipoDelegado;
  mesaId?: number;
  recintoId?: number;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  agrupacionId?: number| null;
}

export interface UpdateDelegadoMesaDto {
  usuarioId?: number;
  tipo?: TipoDelegado;
  mesaId?: number| null;
  estado?: string;
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

export interface MesaInfo {
  id: number;
  numero: string;
  codigo: string;
  recinto?: RecintoInfo;
}

export interface JefeRecintoInfo {
  id: number;
  tipo: string;
  usuario?: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
  recinto?: RecintoInfo;
}

export interface MisDatosDelegado {
  id: number;
  tipo: TipoDelegado;
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
  recintoId: number | null;
  mesaId: number | null;
  jefeRecintoId: number | null;
  proceso?: {
    id: number;
    nombre: string;
  };
  mesa?: MesaInfo | null;
  jefeRecinto?: JefeRecintoInfo | null;
  agrupacion?: {
    id: number;
    nombre: string;
  } | null;
}
