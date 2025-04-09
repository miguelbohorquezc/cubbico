import { AreaFormState } from '../../../shared/types/areaTypes';

// Generación dinámica de opciones numéricas
const generateNumberOptions = (start: number, end: number, placeholder: string) => {
  const options = Array.from({ length: end - start + 1 }, (_, i) => ({
    value: `${i + start}`,
    label: `${i + start}`
  }));
  return [{ value: '', label: placeholder }, ...options];
};

// Configuración común de opciones
const COMMON_SELECT_PROPS = {
  orden: {
    placeholder: 'Seleccione un orden',
    range: [1, 40]
  },
  area: {
    placeholder: 'Seleccione un area',
    options: [
      'Matemáticas',
      'Humanidades, Lengua Castellana e Idioma Extranjero (Inglés)',
      'Ciencias Naturales y Educación Ambiental',
      'Ciencias Sociales',
      'Educación Ética y Valores Humanos',
      'Educación Religiosa',
      'Educación Artística y Cultural',
      'Tecnología e Informática',
      'Educación Física, Recreación y Deportes',
      'Preescolar'
    ]
  },
  nivel: {
    placeholder: 'Seleccione un nivel',
    options: ['primaria', 'secundaria', 'preescolar']
  },
  evaluacion: {
    placeholder: 'Seleccione modo de evaluación',
    options: ['normal', 'ajustes']
  }
};

// Generación de opciones para selects
export const SELECT_OPTIONS = {
  orden: generateNumberOptions(COMMON_SELECT_PROPS.orden.range[0], COMMON_SELECT_PROPS.orden.range[1], COMMON_SELECT_PROPS.orden.placeholder),
  area: [
    { value: '', label: COMMON_SELECT_PROPS.area.placeholder },
    ...COMMON_SELECT_PROPS.area.options.map(option => ({ value: option, label: option }))
  ],
  nivel: [
    { value: '', label: COMMON_SELECT_PROPS.nivel.placeholder },
    ...COMMON_SELECT_PROPS.nivel.options.map(option => ({ value: option, label: option }))
  ],
  evaluacion: [
    { value: '', label: COMMON_SELECT_PROPS.evaluacion.placeholder },
    ...COMMON_SELECT_PROPS.evaluacion.options.map(option => ({ value: option, label: option }))
  ]
};

// Campos de texto con tipo mejorado
type TextFieldConfig = {
  name: keyof AreaFormState;
  type: 'text' | 'number';
  placeholder: string;
};

export const TEXT_FIELDS: TextFieldConfig[] = [
  { 
    name: 'ihs',
    type: 'number',
    placeholder: 'Intensidad Horaria (ejemplo: 4)'
  },
  { 
    name: 'asignatura',
    type: 'text',
    placeholder: 'Nombre de la asignatura'
  }
];

// Campos de selección con tipo mejorado
type SelectFieldConfig = {
  name: keyof AreaFormState;
  options: typeof SELECT_OPTIONS[keyof typeof SELECT_OPTIONS];
};

export const SELECT_FIELDS: SelectFieldConfig[] = [
  { name: 'orden', options: SELECT_OPTIONS.orden },
  { name: 'area', options: SELECT_OPTIONS.area },
  { name: 'nivel', options: SELECT_OPTIONS.nivel }
];

// Validaciones (se mantiene funcionalidad original)
export const validationsForm = (form: AreaFormState) => {
  const errors: Record<string, string> = {};
  
  // Nota: Los nombres de las claves de error parecen no coincidir con los campos
  if (!form.orden.trim()) errors.id = 'Campo requerido';
  if (!form.asignatura.trim()) errors.document = 'Defina un nombre para la asignatura';
  if (!form.ihs.trim()) errors.name = 'Campo requerido';
  if (!form.area.trim()) errors.lastName = 'Campo requerido';
  if (!form.nivel.trim()) errors.classRoom = 'Seleccione un nivel';

  return errors;
};