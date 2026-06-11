export interface Paciente {
  id: string;
  hc: string;
  documento: { tipo: string; numero: string };
  apellido: string;
  nombre: string;
  fechaNacimiento: string;
  sexo: string;
  obraSocial?: string;
}

export interface Internacion {
  id: string;
  pacienteId: string;
  servicioId: string;
  ubicacion: { sector: string; habitacion: string; cama: string };
  fechaIngreso: number;
  fechaAlta: number | null;
  estado: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: string;
  servicio?: string;
  sectores?: string[];
}

export interface Pedido {
  id: string;
  internacionId: string;
  servicioSolicitanteId: string;
  creadoPor?: string;
  modalidad: string;
  descripcion: string;
  tipoTraslado: string;
  conContraste: boolean;
  prioridad: string;
  aislamiento?: boolean;
  estado: string;
  motivo: string;
  fechaSolicitud: number;
  historial?: any[];
  avisoPendiente?: string;
  recetaDigitalUrl?: string;
}
