// formConfig.ts
import { SalonFormState } from '../../../shared/types/classRoomTypes';

export const SELECT_OPTIONS = {
  identificador: Array.from({ length: 24 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}`
  })),
  nombreSalon: [
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
  nivel: [
    { value: '', label: 'Seleccione nivel' },
    { value: 'Preescolar', label: 'Preescolar' },
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Secundaria', label: 'Secundaria' }
  ]
};

export const validationsForm = (form: SalonFormState): Partial<SalonFormState> => {
  const errors: Partial<SalonFormState> = {};
  
  if (!form.identificador.trim()) {
    errors.identificador = 'Seleccione un identificador numérico';
  }
  
  if (!form.directorGrupo.trim()) {
    errors.directorGrupo = 'Ingrese el director de grupo';
  }
  
  if (!form.nombreSalon.trim()) {
    errors.nombreSalon = 'Seleccione un nombre de salón';
  }
  
  if (!form.nivel.trim()) {
    errors.nivel = 'Seleccione un nivel académico';
  }

  return errors;
};