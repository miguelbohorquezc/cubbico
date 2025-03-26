// formConfig.ts
import { SalonFormState } from '../../../shared/types/classRoomTypes';

export const SELECT_OPTIONS = {
  identificador: Array.from({ length: 24 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}`
  })),
  nombreSalon: [
    { value: '', label: 'Seleccione un salón' },
    { value: 'walkers', label: 'Walkers' },
    { value: 'nursery a', label: 'Nursery A' },
    { value: 'primero a', label: 'Primero A' },
    { value: 'septimo', label: 'Septimo' },
    // ... resto de opciones
  ],
  nivel: [
    { value: '', label: 'Seleccione nivel' },
    { value: 'Preescolar', label: 'Preescolar' },
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Básica Secundaria', label: 'Básica Secundaria' }
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