export interface ReporteResultadoParams {
  procesoId: number;
  provinciaId?: number;
  circunscripcionId?: number;
  municipioId?: number;
  distritoId?: number;
  localidadId?: number;
}

export interface ResumenRecintos {
  total: number;
  conJefe: {
    valor: number;
    porcentaje: number;
  };
  sinJefe: {
    valor: number;
    porcentaje: number;
  };
}

export interface ResumenMesas {
  cobertura: {
    valor: string;
    porcentaje: number;
  };
}

export interface ResumenReporte {
  recintos: ResumenRecintos;
  mesas: ResumenMesas;
  reservas: number;
}

export interface RecintoReporte {
  id: number;
  nombre: string;
  jefe: boolean;
  jefeReserva: number;
  mesasTotal: number;
  mesasConDelegado: number;
  mesasSinDelegado: number;
  reservas: number;
}

export interface ReporteResultadoResponse {
  statusCode: number;
  message: string;
  resumen: ResumenReporte;
  totalRecintos: number;
  data: RecintoReporte[];
}
