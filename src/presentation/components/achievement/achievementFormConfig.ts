import { AchievementFormState } from "../../../domain/entities/achievementData";

  
  export const validationsForm = (form: AchievementFormState) => {
    const errors: Record<string, string> = {};
    
    if (!form.logro1.trim()) errors.logro1 = 'El logro 1 es requerido';
    if (!form.logro2.trim()) errors.logro2 = 'El logro 2 es requerido';
    if (!form.logro3.trim()) errors.logro3 = 'El logro 3 es requerido';
  
    return errors;
  };
  
  export const TEXTAREA_CONFIG = [
    {
      name: 'logro1',
      placeholder: 'Ej: El estudiante demostró comprensión avanzada en...',
      rows: 4
    },
    {
      name: 'logro2',
      placeholder: 'Ej: Desarrolló habilidades destacadas en...',
      rows: 4
    },
    {
      name: 'logro3',
      placeholder: 'Ej: Mostró mejora significativa en...',
      rows: 4
    }
  ];