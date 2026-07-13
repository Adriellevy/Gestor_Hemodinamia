# Matriz de Diferencias y Auditoría: `worklistv18` vs. `cliente-web`

Este documento presenta los resultados finales de la auditoría exhaustiva realizada sobre el prototipo monolítico **`worklistv18`** ([worklist-hemodinamia-v18.jsx](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/Test_new_versions/worklist-hemodinamia-v18.jsx)) y la aplicación web modular **`cliente-web`**.

---

## 1. Resumen Ejecutivo

El **`cliente-web`** presenta un alto nivel de madurez y una arquitectura técnica muy superior a la del prototipo monolítico `v18`. Ha migrado exitosamente más del **85%** de la lógica de negocio, reglas clínicas, diccionarios de datos y restricciones por rol (RBAC). 

Sin embargo, la auditoría ha detectado **brechas críticas de integración y divergencias funcionales en flujos operativos** que deben abordarse para alcanzar una paridad del 100% con la experiencia operativa diseñada en `v18`:

* 🔴 **Faltantes Críticos**: Se ha omitido por completo el sistema de alertas sonoras para Código Rojo (`beepEmergencia`) y la integración automática con WhatsApp para notificar a la guardia médica de Hemodinamia (`NUMERO_GUARDIA_HEMO`).
* 🟡 **Divergencias en Flujos**: El ciclo de vida del pedido en el web client añade el estado `traslado_retorno` y modifica el comportamiento de transición rápida (`advance`), además de hardcodear el destino en los mensajes de traslado para camilleros.
* 🟢 **Mejoras Arquitectónicas**: El web client introduce gestión de estado con Zustand (`useStore`), tipado riguroso de TypeScript, persistencia real con backend de API, y mejoras en la reversión de estados basada en historial real.

---

## 2. Matriz Comparativa por Dimensión

| Dimensión | Componente / Funcionalidad | Estado | En `worklistv18` (Prototipo) | En `cliente-web` (Aplicación) | Observaciones |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **1. Datos** | Diccionario de Modalidades (`PROCEDIMIENTOS`) | 🟢 **Paridad** | 11 procedimientos con iconos, insignias (badges) y flag `soloEmergencia`. | [constants.ts:L3-L15](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/constants.ts#L3-L15) | Exactamente idénticos en propiedades, insignias y banderas de emergencia. |
| **1. Datos** | Diccionario de Estados (`STATUS`) | 🟡 **Divergente** | 6 estados (`autorizacion_pendiente` a `cancelado`). | [constants.ts:L68-L76](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/constants.ts#L68-L76) | El web client añade el estado operativo `traslado_retorno` (rank 2.5). |
| **1. Datos** | Medios de Traslado (`TRASLADOS`) | 🟡 **Divergente** | 4 opciones (`silla`, `camilla`, `asistido`, `ambulatorio`). | [constants.ts:L78-L84](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/constants.ts#L78-L84) | El web client añade la opción `habitacion` (requiereTraslado: false). |
| **1. Datos** | Personal, Salas y Sectores (`SECTORES`, etc.) | 🟢 **Paridad** | 15 sectores de internación, 5 médicos, 4 enfermeros, 5 salas. | [constants.ts:L39-L51](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/constants.ts#L39-L51) | Mapeo 1 a 1 sin discrepancias. |
| **2. Estado** | Arquitectura y Persistencia | 🟢 **Mejorado** | Estado local de React (`useState`) en un archivo de 1.550 líneas; persistencia en `window.storage`. | [useStore.ts](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/store/useStore.ts) + [api.ts](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/services/api.ts) | Separación en capas modular: tienda global Zustand asincrónica conectada al backend REST. |
| **3. Flujos** | Transición Rápida (`conEvento` / `advance`) | 🟡 **Divergente** | Avanza de `solicitado` → `traslado_solicitado` → `en_proceso` → `realizado`. | [App.tsx:L114-L125](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/App.tsx#L114-L125) | Permite avanzar desde `autorizacion_pendiente` y redirige a `traslado_retorno` antes de finalizar. |
| **3. Flujos** | Reversión de Estado (`revert`) | 🟢 **Mejorado** | Utiliza un diccionario fijo (`FORWARD` / `back`) que no recuerda pasos intermedios. | [App.tsx:L126](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/App.tsx#L126) | Lee el arreglo `historial` real del pedido para volver al estado exacto anterior. |
| **4. UI/UX** | Tablero Aeropuerto (`BoardView`) | 🟢 **Mejorado** | Pantalla mural de solo lectura oscura para el sector de hemodinamia con reloj y filtros. | [BoardView.tsx](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/components/views/BoardView.tsx) | Idéntico diseño, agregando el logotipo oficial de Suma Care en la cabecera. |
| **4. UI/UX** | Formulario de Solicitud (`AddStudyModal`) | 🟢 **Paridad** | Bloquea la prioridad "Emergencia" para que solo se elijan diagnósticos de Código Rojo. | [AddStudyModal.tsx:L180-L200](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/components/studies/AddStudyModal.tsx#L180-L200) | Implementación idéntica y robusta del selector de `CASOS_CODIGO_ROJO`. |
| **5. RBAC** | Roles, Permisos y Alertas de Demora | 🟢 **Paridad** | 6 roles (`medico`, `tecnico`, `administrativo`, `jefe_enfermeria`, `invitado`, `admin`) y umbrales de alerta. | [constants.ts:L17-L37](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/constants.ts#L17-L37) y [helpers.ts:L16](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/helpers.ts#L16) | Coincidencia exacta en matriz de permisos y función `alertaDemora()`. |
| **6. Integr.** | Alarma Sonora Código Rojo (`beepEmergencia`) | 🔴 **Faltante** | Genera tonos de alerta de emergencia con Web Audio API (`window.AudioContext`). | **No implementado** | No se encontró ninguna referencia a `AudioContext` ni alertas sonoras en `cliente-web`. |
| **6. Integr.** | WhatsApp a Guardia Hemodinamia | 🔴 **Faltante** | Al crear una emergencia, abre automáticamente WhatsApp hacia el celular de guardia (`NUMERO_GUARDIA_HEMO`). | **No implementado** | Faltan las constantes `NUMERO_GUARDIA_HEMO`, `mensajeEmergenciaGuardia` y su disparo automático. |
| **6. Integr.** | WhatsApp a Camilleros (`mensajeTraslado`) | 🟡 **Divergente** | Incluye la sala específica en el mensaje de destino (ej. *"Hemodinamia · Sala 2"*). | [helpers.ts:L28](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/helpers.ts#L28) | El destino está hardcodeado estáticamente como *"Sala de hemodinamia"*. |

---

## 3. Análisis Detallado de Brechas Críticas (Gap Analysis)

### Gap 1: Alerta Sonora de Emergencia (`beepEmergencia`) [🔴 FALTANTE]
En el prototipo `v18` ([Líneas 101-118](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/Test_new_versions/worklist-hemodinamia-v18.jsx#L101-L118)), cuando ingresa un pedido con prioridad `urgente` (Código Rojo), el sistema dispara una secuencia de 3 tonos audibles utilizando la API nativa del navegador:
```javascript
// Implementación en v18 que falta en cliente-web:
function beepEmergencia() {
  try {
    const ctx = _emergAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    // Genera 3 pulsos de frecuencia 880Hz y 1245Hz para alertar al personal de la sala
    [[0, 880], [0.28, 880], [0.56, 1245]].forEach(([dt, f]) => { ... });
  } catch (e) { /* manejo de bloqueo por auto-play */ }
}
```
**Impacto Operativo**: En una sala de Hemodinamia real, el personal técnico o médico puede no estar mirando la pantalla constantemente. Sin la alarma sonora, un Código Rojo (STEMI, ACV) podría pasar desapercibido unos minutos vitales.

---

### Gap 2: Notificación Automática por WhatsApp a Guardia Médica [🔴 FALTANTE]
En `v18` ([Líneas 171-182](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/Test_new_versions/worklist-hemodinamia-v18.jsx#L171-L182) y [Línea 1006](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/Test_new_versions/worklist-hemodinamia-v18.jsx#L1006)), al confirmarse la creación de una orden con prioridad "Emergencia", el sistema gatilla automáticamente una nueva pestaña con el mensaje pre-cargado para el médico de guardia de Hemodinamia:
```javascript
const NUMERO_GUARDIA_HEMO = "5491133334444";
function mensajeEmergenciaGuardia({ paciente, hc, servicio, cama, descripcion, motivo }) {
  return [
    "🔴 CÓDIGO ROJO - EMERGENCIA",
    "Activación de hemodinamia.",
    `Paciente: ${paciente} (HC ${hc})`,
    `Ubicación: ${servicio} - ${cama}`,
    `Motivo: ${motivo || "—"}`,
    `Procedimiento: ${descripcion}`,
  ].join("\n");
}
// En addStudy:
window.open(`https://wa.me/${NUMERO_GUARDIA_HEMO}?text=${encodeURIComponent(msg)}`, "_blank");
```
**Impacto Operativo**: En `cliente-web`, solo existe el botón para notificar traslados (`NUMERO_TRASLADOS`). El equipo de hemodinamistas no recibe la alerta por mensajería al activarse un código rojo desde la guardia o UTI.

---

### Gap 3: Destino Hardcodeado en WhatsApp para Camilleros [🟡 DIVERGENTE]
En el generador de mensajes para traslados del web client ([helpers.ts:L28](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/cliente-web/src/utils/helpers.ts#L28)), el destino se define estáticamente:
```typescript
// En cliente-web/src/utils/helpers.ts:
const destino = "Sala de hemodinamia"; // <--- Hardcodeado
```
En contraste, `v18` consulta dinámicamente si el estudio ya tiene una sala asignada ([Línea 184](file:///c:/Users/adrie/OneDrive/Escritorio/Suma%20Care/Gestor_Hemodinamia/Test_new_versions/worklist-hemodinamia-v18.jsx#L184)):
```javascript
// En worklist-hemodinamia-v18.jsx:
const destino = study.sala ? `Hemodinamia · ${study.sala}` : "Hemodinamia · sala a confirmar";
```
**Impacto Operativo**: El hospital cuenta con 5 salas distintas (Sala 1 a 4 y Sala EEF). Si el camillero solo recibe "Sala de hemodinamia", debe preguntar en mostrador a cuál de las 5 salas llevar al paciente.

---

## 4. Hoja de Ruta Sugerida (Roadmap de Alineación)

A continuación, se sugiere un plan de acción priorizado para sincronizar el **`cliente-web`** y solucionar las brechas detectadas:

### Prioridad Alta (Seguridad del Paciente y Flujos de Emergencia)
- [ ] **Integrar Alarma Sonora (`beepEmergencia`)**: Crear una utilidad en `src/utils/audio.ts` con Web Audio API y gatillarla en el componente `App.tsx` o un efecto global cuando se detecte un nuevo pedido activo con prioridad `urgente`.
- [ ] **Restaurar Notificación a Guardia (`mensajeEmergenciaGuardia`)**: Añadir `NUMERO_GUARDIA_HEMO` y las funciones de enlace en `src/utils/helpers.ts`, e invocar `window.open` en `src/components/studies/AddStudyModal.tsx` al crear un estudio de emergencia.
- [ ] **Corregir Destino en Mensaje de Traslado**: Modificar `helpers.ts:L28` para que evalúe `study.sala ? 'Hemodinamia · ' + study.sala : 'Hemodinamia · sala a confirmar'`.

### Prioridad Media (Alineación de Reglas de Flujo)
- [ ] **Auditar el comportamiento de `advance` para `autorizacion_pendiente`**: Confirmar si en la operación del hospital se desea que el botón principal avance directamente una orden sin autorizar (como está hoy en `App.tsx`), o si debe reservarse exclusivamente al botón de "Autorizar" del rol administrativo (como en `v18`).
- [ ] **Confirmar adopción del estado `traslado_retorno`**: Validar con el equipo operativo si la inclusión del estado de retorno en el web client es el estándar definitivo a mantener.
