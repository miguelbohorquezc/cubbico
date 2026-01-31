export interface AchievementData {
    id?: string;
    classroomId: string;
    areaId: string;
    period: number;
    year?: string;
    logros: {
      logro1: string;
      logro2: string;
      logro3: string;
    };
  }

  export type AchievementFormState = {
    logro1: string;
    logro2: string;
    logro3: string;
  };