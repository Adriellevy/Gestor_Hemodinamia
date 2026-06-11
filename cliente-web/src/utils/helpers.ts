import { PROCEDIMIENTOS, STATUS, PRIORITIES, TRASLADOS } from './constants';
import type { Pedido, Paciente, Internacion } from '../types';

export const typeMeta = (id: string) => PROCEDIMIENTOS.find((t) => t.id === id);
export const requiereAuth = (_modalidad: string) => true; // en hemodinamia, todos requieren auth

export const waitMins = (ts: number, now: number) => Math.max(0, Math.floor((now - ts) / 60000));

export function waitText(ts: number, now: number) {
  const m = waitMins(ts, now);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export function alertaDemora(study: Pedido, now: number) {
  const pr = PRIORITIES[study.prioridad];
  if (!STATUS[study.estado]?.active || pr.umbralAlerta == null) return null;
  return waitMins(study.fechaSolicitud, now) > pr.umbralAlerta ? study.prioridad : null;
}

export const opcionesTraslado = (_modalidad: string, _sector: string) => {
  return ["silla", "camilla", "asistido"]; // la sala de hemodinamia es fija: el paciente siempre se traslada
};

const NUMERO_TRASLADOS = "5491100000000";
export function mensajeTraslado(study: any, tipo = "ida", hermanos?: any[]) {
  const destino = "Sala de hemodinamia";
  const ubic = `${study._servicio} - ${study._paciente?.cama}`;
  const tr = TRASLADOS[study.tipoTraslado]?.label ?? "—";
  const paciente = `Paciente: ${study._paciente?.nombreCompleto} (HC ${study._paciente?.hc})`;
  const vuelta = tipo === "vuelta";
  
  const lineas =
    tipo === "cancel" ? ["TRASLADO CANCELADO", paciente, `Ubicación: ${ubic}`, "Estudio suspendido."] :
    tipo === "sintraslado" ? ["TRASLADO CANCELADO", paciente, `Ubicación: ${ubic}`, "El estudio se realizará sin traslado."] :
    tipo === "modif" ? ["TRASLADO MODIFICADO", paciente, `Ubicación: ${ubic}`, `Nuevo medio: ${tr}`] :
    [
      vuelta ? "Solicitud de traslado (regreso a origen)" : "Solicitud de traslado",
      paciente,
      ...(study.aislamiento ? ["AISLAMIENTO: requiere precauciones (traer EPP)."] : []),
      ...(vuelta ? [`Desde: ${destino}`, `Hacia: ${ubic}`] : [`Origen: ${ubic}`, `Destino: ${destino}`]),
      `Traslado: ${tr}`,
      `Estudio: ${study.descripcion}${vuelta ? " (finalizado)" : ""}`,
      ...(!vuelta && hermanos && hermanos.length ? [`Otros estudios del paciente: ${hermanos.map((h) => `${typeMeta(h.modalidad)?.short} ${h.descripcion}`).join("; ")}`] : []),
      `Prioridad: ${PRIORITIES[study.prioridad]?.label}`,
    ];
  return lineas.join("\n");
}
export const linkWhatsApp = (study: any, tipo = "ida", hermanos?: any[]) => `https://wa.me/${NUMERO_TRASLADOS}?text=${encodeURIComponent(mensajeTraslado(study, tipo, hermanos))}`;

export const fmtHora = (ts: number) => new Date(ts).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

export function edad(fechaNacimiento: string) {
  const d = new Date(fechaNacimiento), n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
}

export function hidratar(pedido: Pedido, internaciones: Internacion[], pacientes: Paciente[]): Pedido {
  const internacion = internaciones.find((i) => i.id === pedido.internacionId);
  const paciente = pacientes.find((p) => p.id === internacion?.pacienteId);
  return {
    ...pedido,
    _paciente: {
      nombreCompleto: paciente ? `${paciente.apellido}, ${paciente.nombre}` : "—",
      apellido: paciente?.apellido ?? "—",
      hc: paciente?.hc ?? "—",
      dni: paciente?.documento.numero ?? "—",
      edad: paciente ? edad(paciente.fechaNacimiento) : "—",
      fechaNacimiento: paciente?.fechaNacimiento ?? undefined,
      cama: internacion?.ubicacion.cama ?? "—",
      obraSocial: paciente?.obraSocial,
    },
    _servicio: internacion?.servicioId ?? pedido.servicioSolicitanteId,
  };
}
