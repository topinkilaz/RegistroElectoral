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

// Reporte de agrupaciones (listado)
export interface AgrupacionReporte {
  id: number;
  nombre: string;
  sigla: string;
  estado: EstadoAgrupacion;
  jefesRecinto: number;
  delegados: {
    titulares: number;
    reservas: number;
    total: number;
  };
  totalPersonas: number;
}

// Reporte detallado de una agrupación
export interface AgrupacionReporteDetalle {
  agrupacion: {
    id: number;
    nombre: string;
    sigla: string;
    estado: EstadoAgrupacion;
    procesoId: number;
  };
  resumen: {
    jefesRecinto: number;
    titulares: number;
    reservas: number;
    totalDelegados: number;
    totalPersonas: number;
    enGrupoWhatsapp: {
      jefes: number;
      delegados: number;
    };
    tieneFotocopiaCarnet: {
      jefes: number;
      delegados: number;
    };
  };
  jefesRecinto: JefeRecintoReporte[];
  delegados: DelegadoReporte[];
}

export interface JefeRecintoReporte {
  id: number;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  estado: string;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
  recinto: {
    id: number;
    nombre: string;
    codigo: string;
    localidad: {
      nombre: string;
      municipio: {
        nombre: string;
      };
    };
  };
}

export interface DelegadoReporte {
  id: number;
  tipo: "titular" | "reserva";
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  estado: string;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
  mesa: {
    numero: string;
    codigo: string;
    recinto: {
      nombre: string;
      codigo: string;
    };
  } | null;
  jefeRecinto: {
    recinto: {
      nombre: string;
    };
    usuario: {
      nombres: string;
      apellidos: string;
    };
  } | null;
}