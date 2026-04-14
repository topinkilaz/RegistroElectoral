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
  agrupacionId?: number;
}
