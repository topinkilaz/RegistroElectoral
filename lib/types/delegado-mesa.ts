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
