import { StudentFormState } from '../../../shared/types/studentTypes';

export const SELECT_OPTIONS = {
  document: [
    { value: '', label: 'Seleccione tipo de documento' },
    { value: 'RC', label: 'Registro Civil' },
    { value: 'TI', label: 'Tarjeta de Identidad' }
  ],
  classRoom: [
    { value: '', label: 'Seleccione nivel académico' },
    { value: 'Preescolar', label: 'Preescolar' },
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Básica Secundaria', label: 'Básica Secundaria' }
  ],
  className: [
    { value: '', label: 'Seleccione salón' },
    { value: 'primeroA', label: 'Primero A' },
    { value: 'primeroB', label: 'Primero B' },
    // ... opciones de salones
  ],
  caracter: [
    { value: '', label: 'Seleccione modo de evaluación' },
    { value: 'normal', label: 'Normal' },
    { value: 'especial', label: 'Especial' }
  ]
};

export const TEXT_FIELDS = [
  { name: 'id', type: 'number', placeholder: 'Número de identificación' },
  { name: 'name', type: 'text', placeholder: 'Nombres completos' },
  { name: 'lastName', type: 'text', placeholder: 'Apellidos completos' }
];

export const SELECT_FIELDS = [
  { name: 'document', options: SELECT_OPTIONS.document },
  { name: 'classRoom', options: SELECT_OPTIONS.classRoom },
  { name: 'className', options: SELECT_OPTIONS.className },
  { name: 'caracter', options: SELECT_OPTIONS.caracter }
];

export const validationsForm = (form: StudentFormState) => {
  const errors: Record<string, string> = {};
  
  if (!form.id.trim()) errors.id = 'Campo requerido';
  if (!form.document.trim()) errors.document = 'Seleccione un tipo de documento';
  if (!form.name.trim()) errors.name = 'Campo requerido';
  if (!form.lastName.trim()) errors.lastName = 'Campo requerido';
  if (!form.classRoom.trim()) errors.classRoom = 'Seleccione un nivel';
  if (!form.className.trim()) errors.className = 'Seleccione un salón';
  if (!form.caracter.trim()) errors.caracter = 'Seleccione modo de evaluación';

  return errors;
};