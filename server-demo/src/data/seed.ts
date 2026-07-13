import { Paciente, Internacion, Usuario, Pedido } from './types';

const minsAgo = (m: number) => Date.now() - m * 60000;
const uid = (p = '') => p + Math.random().toString(36).slice(2, 9);
const today = (y: number, mo: number, d: number) => new Date(y, mo - 1, d).toISOString();

export const USUARIOS: Usuario[] = [
  { id: "u1", nombre: "Dra. Acosta", rol: "medico",         servicio: "Clínica médica (7mo piso A)" },
  { id: "u2", nombre: "Dr. Benítez", rol: "medico",         servicio: "UCO" },
  { id: "u3", nombre: "Téc. Ríos",   rol: "tecnico",        sectores: [] },
  { id: "u4", nombre: "Téc. Molina", rol: "tecnico",        sectores: [] },
  { id: "u5", nombre: "Adm. Torres", rol: "administrativo" },
  { id: "u6", nombre: "Sistemas",    rol: "admin" },
];

export const PADRON_HOSPITAL = [
  { hc: "1042318", apellido: "González",  nombre: "Marta",        dni: "28.945.110", fechaNacimiento: today(1958, 4, 12),  sexo: "F", servicio: "UCO",                         sector: "UCO",                         cama: "UCO 2", obraSocial: "OSDE" },
  { hc: "1038945", apellido: "Pereyra",   nombre: "Jorge",        dni: "20.114.876", fechaNacimiento: today(1953, 9, 3),   sexo: "M", servicio: "UTI 1 (5to piso)",            sector: "UTI 1 (5to piso)",            cama: "UTI1 3", obraSocial: "PAMI" },
  { hc: "1095102", apellido: "Fernández", nombre: "Lucía",        dni: "41.302.559", fechaNacimiento: today(2017, 6, 21),  sexo: "F", servicio: "Clínica médica (9no piso B)", sector: "Clínica médica (9no piso B)", cama: "Cama 905", obraSocial: "Swiss Medical" },
  { hc: "1051877", apellido: "Sosa",      nombre: "Roberto",      dni: "16.778.234", fechaNacimiento: today(1967, 1, 30),  sexo: "M", servicio: "Telemetría",                  sector: "Telemetría",                  cama: "Tele 4", obraSocial: "Galeno" },
  { hc: "1063340", apellido: "Díaz",      nombre: "Ana Beatriz",  dni: "33.567.901", fechaNacimiento: today(1980, 11, 8),  sexo: "F", servicio: "Clínica médica (8vo piso A)", sector: "Clínica médica (8vo piso A)", cama: "Cama 818", obraSocial: "Swiss Medical" },
  { hc: "1009921", apellido: "Ramírez",   nombre: "Héctor",       dni: "12.090.443", fechaNacimiento: today(1945, 3, 17),  sexo: "M", servicio: "Clínica médica (7mo piso A)", sector: "Clínica médica (7mo piso A)", cama: "Cama 707", obraSocial: "PAMI" },
  { hc: "1087654", apellido: "Castro",    nombre: "Sofía",        dni: "39.811.276", fechaNacimiento: today(1991, 7, 2),   sexo: "F", servicio: "Recuperación cardiovascular", sector: "Recuperación cardiovascular", cama: "RCV 1", obraSocial: "OSDE" },
  { hc: "1029013", apellido: "Ibáñez",    nombre: "Daniel",       dni: "25.443.668", fechaNacimiento: today(1964, 12, 19), sexo: "M", servicio: "UTI 2 (6to piso)",            sector: "UTI 2 (6to piso)",            cama: "UTI2 2", obraSocial: "OSECAC" },
  { hc: "1071266", apellido: "Núñez",     nombre: "Valeria",      dni: "30.225.187", fechaNacimiento: today(1996, 5, 27),  sexo: "F", servicio: "Guardia",                     sector: "Guardia",                     cama: "Guardia 2", obraSocial: "Particular" },
  { hc: "1014488", apellido: "Paz",       nombre: "Miguel Ángel", dni: "14.556.029", fechaNacimiento: today(1949, 8, 14),  sexo: "M", servicio: "Clínica médica (8vo piso B)", sector: "Clínica médica (8vo piso B)", cama: "Cama 809", obraSocial: "PAMI" },
  { hc: "1080557", apellido: "Medina",    nombre: "Carla",        dni: "37.901.554", fechaNacimiento: today(1973, 2, 9),   sexo: "F", servicio: "Telemetría",                  sector: "Telemetría",                  cama: "Tele 2", obraSocial: "IOMA" },
];

export const PACIENTES: Paciente[] = [
  { id: "p1",  hc: "1042318", documento: { tipo: "DNI", numero: "28.945.110" }, apellido: "González", nombre: "Marta",       fechaNacimiento: today(1958, 4, 12),  sexo: "F", obraSocial: "OSDE" },
  { id: "p2",  hc: "1038945", documento: { tipo: "DNI", numero: "20.114.876" }, apellido: "Pereyra",  nombre: "Jorge",       fechaNacimiento: today(1953, 9, 3),   sexo: "M", obraSocial: "PAMI" },
  { id: "p3",  hc: "1095102", documento: { tipo: "DNI", numero: "41.302.559" }, apellido: "Fernández",nombre: "Lucía",       fechaNacimiento: today(2017, 6, 21),  sexo: "F", obraSocial: "Swiss Medical" },
  { id: "p4",  hc: "1051877", documento: { tipo: "DNI", numero: "16.778.234" }, apellido: "Sosa",     nombre: "Roberto",     fechaNacimiento: today(1967, 1, 30),  sexo: "M", obraSocial: "Galeno" },
  { id: "p5",  hc: "1063340", documento: { tipo: "DNI", numero: "33.567.901" }, apellido: "Díaz",     nombre: "Ana Beatriz", fechaNacimiento: today(1980, 11, 8),  sexo: "F", obraSocial: "Swiss Medical" },
  { id: "p6",  hc: "1009921", documento: { tipo: "DNI", numero: "12.090.443" }, apellido: "Ramírez",  nombre: "Héctor",      fechaNacimiento: today(1945, 3, 17),  sexo: "M", obraSocial: "PAMI" },
  { id: "p7",  hc: "1087654", documento: { tipo: "DNI", numero: "39.811.276" }, apellido: "Castro",   nombre: "Sofía",       fechaNacimiento: today(1991, 7, 2),   sexo: "F", obraSocial: "OSDE" },
  { id: "p8",  hc: "1029013", documento: { tipo: "DNI", numero: "25.443.668" }, apellido: "Ibáñez",   nombre: "Daniel",      fechaNacimiento: today(1964, 12, 19), sexo: "M", obraSocial: "OSECAC" },
  { id: "p9",  hc: "1071266", documento: { tipo: "DNI", numero: "30.225.187" }, apellido: "Núñez",    nombre: "Valeria",     fechaNacimiento: today(1996, 5, 27),  sexo: "F", obraSocial: "Particular" },
  { id: "p10", hc: "1014488", documento: { tipo: "DNI", numero: "14.556.029" }, apellido: "Paz",      nombre: "Miguel Ángel",fechaNacimiento: today(1949, 8, 14),  sexo: "M", obraSocial: "PAMI" },
  { id: "p11", hc: "1080557", documento: { tipo: "DNI", numero: "37.901.554" }, apellido: "Medina",   nombre: "Carla",       fechaNacimiento: today(1973, 2, 9),   sexo: "F", obraSocial: "IOMA" },
];

export const INTERNACIONES: Internacion[] = [
  { id: "i1",  pacienteId: "p1",  servicioId: "UCO",                         ubicacion: { sector: "UCO",                         habitacion: "—",   cama: "UCO 2" },   fechaIngreso: minsAgo(2880), fechaAlta: null, estado: "activa" },
  { id: "i2",  pacienteId: "p2",  servicioId: "UTI 1 (5to piso)",            ubicacion: { sector: "UTI 1 (5to piso)",            habitacion: "—",   cama: "UTI1 3" },  fechaIngreso: minsAgo(5760), fechaAlta: null, estado: "activa" },
  { id: "i3",  pacienteId: "p3",  servicioId: "Clínica médica (9no piso B)", ubicacion: { sector: "Clínica médica (9no piso B)", habitacion: "905", cama: "Cama 905" }, fechaIngreso: minsAgo(1440), fechaAlta: null, estado: "activa" },
  { id: "i4",  pacienteId: "p4",  servicioId: "Telemetría",                  ubicacion: { sector: "Telemetría",                  habitacion: "—",   cama: "Tele 4" },  fechaIngreso: minsAgo(4320), fechaAlta: null, estado: "activa" },
  { id: "i5",  pacienteId: "p5",  servicioId: "Clínica médica (8vo piso A)", ubicacion: { sector: "Clínica médica (8vo piso A)", habitacion: "818", cama: "Cama 818" }, fechaIngreso: minsAgo(2160), fechaAlta: null, estado: "activa" },
  { id: "i6",  pacienteId: "p6",  servicioId: "Clínica médica (7mo piso A)", ubicacion: { sector: "Clínica médica (7mo piso A)", habitacion: "707", cama: "Cama 707" }, fechaIngreso: minsAgo(7200), fechaAlta: null, estado: "activa" },
  { id: "i7",  pacienteId: "p7",  servicioId: "Recuperación cardiovascular", ubicacion: { sector: "Recuperación cardiovascular", habitacion: "—",   cama: "RCV 1" },   fechaIngreso: minsAgo(720),  fechaAlta: null, estado: "activa" },
  { id: "i8",  pacienteId: "p8",  servicioId: "UTI 2 (6to piso)",            ubicacion: { sector: "UTI 2 (6to piso)",            habitacion: "—",   cama: "UTI2 2" },  fechaIngreso: minsAgo(8640), fechaAlta: null, estado: "activa" },
  { id: "i9",  pacienteId: "p9",  servicioId: "Guardia",                     ubicacion: { sector: "Guardia",                     habitacion: "—",   cama: "Guardia 2" }, fechaIngreso: minsAgo(360),  fechaAlta: null, estado: "activa" },
  { id: "i10", pacienteId: "p10", servicioId: "Clínica médica (8vo piso B)", ubicacion: { sector: "Clínica médica (8vo piso B)", habitacion: "809", cama: "Cama 809" }, fechaIngreso: minsAgo(2520), fechaAlta: null, estado: "activa" },
  { id: "i11", pacienteId: "p11", servicioId: "Telemetría",                  ubicacion: { sector: "Telemetría",                  habitacion: "—",   cama: "Tele 2" },  fechaIngreso: minsAgo(1080), fechaAlta: null, estado: "activa" },
];

const REQUIERE_AUTH: Record<string, boolean> = {
  ccg: true,
  atc: true,
  cateterismo: true,
  valvulas: true,
  endoprotesis: true,
  efa: true,
  neuro: true,
  flebologia: true,
};

const TRASLADOS_REQUIERE: Record<string, boolean> = {
  silla: true,
  camilla: true,
  asistido: true,
  habitacion: false,
  ambulatorio: false,
};

function historialSeed(p: Partial<Pedido>) {
  const requiereT = p.tipoTraslado && TRASLADOS_REQUIERE[p.tipoTraslado];
  const arrancaAuth = p.modalidad && REQUIERE_AUTH[p.modalidad] && p.prioridad !== "urgente";
  const SEC_ESTADO = ["autorizacion_pendiente", "solicitado", "traslado_solicitado", "en_proceso", "realizado"];
  let camino;
  if (p.estado === "cancelado") {
    camino = [arrancaAuth ? "autorizacion_pendiente" : "solicitado", "cancelado"];
  } else {
    camino = SEC_ESTADO.filter((e) => (e !== "autorizacion_pendiente" || arrancaAuth) && (e !== "traslado_solicitado" || requiereT));
    const corte = camino.indexOf(p.estado || '');
    camino = corte >= 0 ? camino.slice(0, corte + 1) : [p.estado];
  }
  const actor: Record<string, string | null> = { autorizacion_pendiente: p.creadoPor ?? null, solicitado: arrancaAuth ? "u5" : (p.creadoPor ?? null), traslado_solicitado: "u3", en_proceso: "u3", realizado: "u3", cancelado: p.creadoPor ?? null };
  return camino.map((e, i) => ({ estado: e, ts: (p.fechaSolicitud || 0) + i * 5 * 60000, por: actor[e as string] ?? null }));
}

const RAW_PEDIDOS_SEED: Omit<Pedido, 'historial'>[] = [
  { id: uid("ped_"), internacionId: "i1",  servicioSolicitanteId: "UCO", creadoPor: "u2", modalidad: "atc", descripcion: "Angioplastia primaria", tipoTraslado: "camilla", conContraste: true, prioridad: "urgente", estado: "solicitado", motivo: "IAM con supradesnivel del ST (STEMI)", fechaSolicitud: minsAgo(42), recetaDigitalUrl: "/uploads/receta-ejemplo-1.pdf" },
  { id: uid("ped_"), internacionId: "i2",  servicioSolicitanteId: "UTI 1 (5to piso)", modalidad: "cateterismo", descripcion: "Cateterismo derecho", tipoTraslado: "camilla", conContraste: false, prioridad: "prioritario", aislamiento: true, estado: "en_proceso", motivo: "Evaluación de hipertensión pulmonar.", fechaSolicitud: minsAgo(36), recetaDigitalUrl: "/uploads/receta-ejemplo-2.pdf" },
  { id: uid("ped_"), internacionId: "i3",  servicioSolicitanteId: "Clínica médica (9no piso B)", modalidad: "ccg", descripcion: "Cinecoronariografía diagnóstica", tipoTraslado: "silla", conContraste: true, prioridad: "prioritario", estado: "solicitado", motivo: "Angina inestable, estratificación.", fechaSolicitud: minsAgo(28) },
  { id: uid("ped_"), internacionId: "i4",  servicioSolicitanteId: "Telemetría", modalidad: "efa", descripcion: "Estudio electrofisiológico + ablación", tipoTraslado: "camilla", conContraste: false, prioridad: "prioritario", estado: "autorizacion_pendiente", motivo: "Taquicardia supraventricular recurrente.", fechaSolicitud: minsAgo(85) },
  { id: uid("ped_"), internacionId: "i5",  servicioSolicitanteId: "Clínica médica (8vo piso A)", modalidad: "valvulas", descripcion: "MitraClip (insuficiencia mitral)", tipoTraslado: "camilla", conContraste: false, prioridad: "prioritario", estado: "autorizacion_pendiente", motivo: "Insuficiencia mitral severa sintomática.", fechaSolicitud: minsAgo(115) },
  { id: uid("ped_"), internacionId: "i6",  servicioSolicitanteId: "Clínica médica (7mo piso A)", creadoPor: "u1", modalidad: "ccg", descripcion: "Cinecoronariografía diagnóstica", tipoTraslado: "silla", conContraste: true, prioridad: "normal", estado: "realizado", motivo: "Cardiopatía isquémica crónica.", fechaSolicitud: minsAgo(175), recetaDigitalUrl: "/uploads/receta-ejemplo-1.pdf" },
  { id: uid("ped_"), internacionId: "i7",  servicioSolicitanteId: "Recuperación cardiovascular", modalidad: "atc", descripcion: "Angioplastia coronaria con stent", tipoTraslado: "camilla", conContraste: true, prioridad: "prioritario", estado: "solicitado", motivo: "Lesión severa de descendente anterior.", fechaSolicitud: minsAgo(20) },
  { id: uid("ped_"), internacionId: "i8",  servicioSolicitanteId: "UTI 2 (6to piso)", modalidad: "atc", descripcion: "Coronariografía + ATC de urgencia", tipoTraslado: "camilla", conContraste: true, prioridad: "urgente", aislamiento: true, estado: "en_proceso", motivo: "Shock cardiogénico", fechaSolicitud: minsAgo(16) },
  { id: uid("ped_"), internacionId: "i9",  servicioSolicitanteId: "Guardia", modalidad: "ccg", descripcion: "Cinecoronariografía", tipoTraslado: "camilla", conContraste: true, prioridad: "prioritario", estado: "solicitado", motivo: "Dolor torácico con troponinas en ascenso.", fechaSolicitud: minsAgo(18) },
  { id: uid("ped_"), internacionId: "i10", servicioSolicitanteId: "Clínica médica (8vo piso B)", modalidad: "valvulas", descripcion: "TAVI - implante valvular aórtico", tipoTraslado: "camilla", conContraste: true, prioridad: "normal", estado: "autorizacion_pendiente", motivo: "Estenosis aórtica severa sintomática.", fechaSolicitud: minsAgo(130) },
  { id: uid("ped_"), internacionId: "i11", servicioSolicitanteId: "Telemetría", modalidad: "endoprotesis", descripcion: "Cierre percutáneo de orejuela izquierda", tipoTraslado: "camilla", conContraste: true, prioridad: "normal", estado: "solicitado", motivo: "FA no valvular con alto riesgo de sangrado.", fechaSolicitud: minsAgo(48) },
  { id: uid("ped_"), internacionId: "i7",  servicioSolicitanteId: "Recuperación cardiovascular", creadoPor: "u1", modalidad: "cateterismo", descripcion: "Cateterismo derecho de control", tipoTraslado: "camilla", conContraste: false, prioridad: "normal", estado: "solicitado", motivo: "Control hemodinámico evolutivo.", fechaSolicitud: minsAgo(62) },
];

export const PEDIDOS_SEED: Pedido[] = [...RAW_PEDIDOS_SEED].map((p) => ({
  ...p,
  historial: historialSeed(p) as any,
}));
