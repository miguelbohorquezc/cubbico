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
    { value: 'nursery a', label: 'Nursery A' },
    { value: 'nursery b', label: 'Nursery B' },
    { value: 'prekinder a', label: 'Prekinder A' },
    { value: 'prekinder b', label: 'Prekinder B' },
    { value: 'kinder a', label: 'Kinder A' },
    { value: 'kinder b', label: 'Kinder B' },
    { value: 'transition a', label: 'Transition A' },
    { value: 'transition b', label: 'Transition B' },
    { value: 'primero a', label: 'Primero A' },
    { value: 'primero b', label: 'Primero B' },
    { value: 'segundo', label: 'Segundo' },
    { value: 'tercero', label: 'Tercero' },
    { value: 'cuarto', label: 'Cuarto' },
    { value: 'quinto', label: 'Quinto' },
    { value: 'sexto', label: 'Sexto' },
    { value: 'septimo', label: 'Septimo' },
    { value: 'octavo', label: 'Octavo' },
    { value: 'noveno', label: 'Noveno' },
  ],
  caracter: [
    { value: '', label: 'Seleccione modo de evaluación' },
    { value: 'normal', label: 'Normal' },
    { value: 'ajustes', label: 'Ajustes' }
  ]
};

export const TEXT_FIELDS = [
  { name: 'id', type: 'number', placeholder: 'Número de identificación' },
  { name: 'name', type: 'text', placeholder: 'Nombres completos' },
  { name: 'lastName', type: 'text', placeholder: 'Apellidos completos' }
];

export const SELECT_FIELDS = [
  { name: 'document',   options: SELECT_OPTIONS.document },
  { name: 'classRoom',  options: SELECT_OPTIONS.classRoom },
  { name: 'className',  options: SELECT_OPTIONS.className },
  { name: 'caracter',   options: SELECT_OPTIONS.caracter }
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