// Tipado completo con conversión automática de tipos
export interface AreaFormState {
  id?: string;
  orden: string;
  asignatura: string;
  ihs: string;
  area: string;
  nivel: string;
}

// Tipo para el servicio (con números)
export interface AreaServiceData {
  id?: string;
  orden: number;
  asignatura: string;
  ihs: number;
  area: string;
  nivel: string;
}

// Función de conversión segura en el submit
const parseAreaData = (form: AreaFormState): AreaServiceData => ({
  id: form.id,
  orden: Number(form.orden) || 0,
  asignatura: form.asignatura.trim(),
  ihs: Number(form.ihs) || 0,
  area: form.area.trim(),
  nivel: form.nivel
});