import { HeartPulse, Activity, Stethoscope, Heart, Scan, Zap, Brain, Waves, Gauge, Syringe, Cpu } from 'lucide-react';

export const PROCEDIMIENTOS: any[] = [
  { id: "ccg", label: "Cinecoronariografía", short: "CCG", dicom: "XA", requiereAutorizacion: true, Icon: HeartPulse, badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "atc", label: "Angioplastia coronaria", short: "ATC", dicom: "XA", requiereAutorizacion: true, Icon: Activity, badge: "bg-red-50 text-red-700 border-red-200" },
  { id: "cateterismo", label: "Cateterismo derecho", short: "Cat. D", dicom: "XA", requiereAutorizacion: true, Icon: Stethoscope, badge: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "valvulas", label: "Válvulas", short: "Válvulas", dicom: "XA", requiereAutorizacion: true, Icon: Heart, badge: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "endoprotesis", label: "Endoprótesis", short: "Endopr.", dicom: "XA", requiereAutorizacion: true, Icon: Scan, badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "efa", label: "Estudio electrofisiológico", short: "EEF", dicom: "XA", requiereAutorizacion: true, Icon: Zap, badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "neuro", label: "Neurointervencionismo", short: "Neuro", dicom: "XA", requiereAutorizacion: true, Icon: Brain, badge: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  { id: "flebologia", label: "Flebología", short: "Flebo.", dicom: "XA", requiereAutorizacion: true, Icon: Waves, badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "bcia", label: "Balón de contrapulsación (BCIA)", short: "BCIA", dicom: "XA", requiereAutorizacion: true, soloEmergencia: true, Icon: Gauge, badge: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "pericardiocentesis", label: "Pericardiocentesis", short: "Pericard.", dicom: "XA", requiereAutorizacion: true, soloEmergencia: true, Icon: Syringe, badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "marcapasos", label: "Marcapasos transitorio", short: "MP transit.", dicom: "XA", requiereAutorizacion: true, soloEmergencia: true, Icon: Cpu, badge: "bg-lime-50 text-lime-700 border-lime-200" },
];

export const PERMISOS: Record<string, string> = {
  pedir_estudio: "Solicitar procedimientos",
  cancelar_pedido: "Cancelar pedidos",
  autorizar: "Autorización administrativa",
  iniciar: "Iniciar / dar ingreso",
  finalizar: "Finalizar (realizado)",
  retroceder: "Retroceder estado",
  ver_imagenes: "Ver worklist de hemodinamia",
  ver_servicio: "Ver lista del servicio",
  gestionar_usuarios: "Gestionar usuarios",
  asignar: "Asignar médico, enfermero y sala",
};

export const ROLES: Record<string, any> = {
  medico: { label: "Médico solicitante", color: "#2563eb", permisos: ["pedir_estudio", "cancelar_pedido", "ver_servicio", "ver_imagenes"] },
  tecnico: { label: "Personal de hemodinamia", color: "#0d9488", permisos: ["iniciar", "finalizar", "retroceder", "asignar", "ver_imagenes"] },
  administrativo: { label: "Administrativo", color: "#ea580c", permisos: ["autorizar", "ver_imagenes"] },
  jefe_enfermeria: { label: "Jefe de enfermería", color: "#0891b2", permisos: ["asignar", "ver_imagenes"] },
  invitado: { label: "Solo visualización", color: "#64748b", permisos: ["ver_imagenes"] },
  admin: { label: "Admin general", color: "#7c3aed", permisos: Object.keys(PERMISOS) },
};

export const MEDICOS_HEMO = ["Dr. Álvarez", "Dra. Bianchi", "Dr. Costa", "Dra. Duarte", "Dr. Esposito"];
export const ENFERMEROS_HEMO = ["Enf. Funes", "Enf. Gómez", "Enf. Herrera", "Enf. Ibáñez"];
export const SALAS_HEMO = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala EEF"];

export const SECTORES = [
  "Guardia", "UCO", "Recuperación cardiovascular", "Telemetría",
  "Quirófano 1 (3er piso)", "Quirófano 2 (4to piso)",
  "UTI 1 (5to piso)", "UTI 2 (6to piso)",
  "Clínica médica (7mo piso A)", "Clínica médica (7mo piso B)",
  "Clínica médica (8vo piso A)", "Clínica médica (8vo piso B)",
  "Clínica médica - TMO (9no piso A)", "Clínica médica (9no piso B)",
  "Internación ambulatoria",
];

export const PRIORITIES: Record<string, any> = {
  urgente: { label: "Emergencia", short: "Emergencia", badge: "bg-red-50 text-red-700 border-red-200", bar: "#dc2626", rank: 0, umbralRojo: 90, umbralAlerta: 60 },
  prioritario: { label: "Urgencia", short: "Urgencia", badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "#d97706", rank: 1, umbralRojo: 120, umbralAlerta: 120 },
  normal: { label: "En internación", short: "En internación", badge: "bg-slate-100 text-slate-600 border-slate-200", bar: "#cbd5e1", rank: 2, umbralRojo: null, umbralAlerta: null },
};

export const CASOS_CODIGO_ROJO: any[] = [
  { modalidad: "atc", dx: "IAMCEST (STEMI)", estudio: "CCG + ATC primaria", conContraste: true, tipoTraslado: "camilla" },
  { modalidad: "bcia", dx: "Shock cardiogénico / inestabilidad hemodinámica", estudio: "Colocación de BCIA", conContraste: false, tipoTraslado: "camilla" },
  { modalidad: "pericardiocentesis", dx: "Taponamiento cardíaco", estudio: "Pericardiocentesis", conContraste: false, tipoTraslado: "camilla" },
  { modalidad: "marcapasos", dx: "Bloqueo AV completo", estudio: "Marcapasos transitorio", conContraste: false, tipoTraslado: "camilla" },
  { modalidad: "neuro", dx: "ACV", estudio: "Trombectomía mecánica", conContraste: true, tipoTraslado: "camilla" },
  { modalidad: "cateterismo", dx: "TEP", estudio: "Trombectomía / trombólisis dirigida", conContraste: true, tipoTraslado: "camilla" },
];

export const STATUS: Record<string, any> = {
  autorizacion_pendiente: { label: "Autorización pendiente", badge: "bg-orange-100 text-orange-700", rank: -1, active: true },
  solicitado: { label: "Pendiente", badge: "bg-slate-100 text-slate-600", rank: 0, active: true },
  traslado_solicitado: { label: "Traslado solicitado", badge: "bg-cyan-50 text-cyan-700", rank: 1, active: true },
  en_proceso: { label: "En proceso", badge: "bg-blue-50 text-blue-700", rank: 2, active: true },
  traslado_retorno: { label: "Retorno solicitado", badge: "bg-cyan-50 text-cyan-700", rank: 2.5, active: true },
  realizado: { label: "Realizado", badge: "bg-emerald-50 text-emerald-700", rank: 3, active: false },
  cancelado: { label: "Cancelado", badge: "bg-rose-50 text-rose-700", rank: 9, active: false },
};

export const TRASLADOS: Record<string, any> = {
  silla: { label: "Silla de ruedas", requiereTraslado: true },
  camilla: { label: "Camilla", requiereTraslado: true },
  asistido: { label: "Traslado asistido", requiereTraslado: true },
  habitacion: { label: "En habitación", requiereTraslado: false },
  ambulatorio: { label: "Por sus propios medios", requiereTraslado: false },
};

export const ESTADOS_PRE_TRASLADO = ["autorizacion_pendiente", "solicitado", "traslado_solicitado"];
