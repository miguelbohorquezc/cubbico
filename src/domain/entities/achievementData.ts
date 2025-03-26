export interface AchievementData {
    id?: string;
    classroomId: string;
    areaId: string;
    period: number;
    logros: {
      logro1: string;
      logro2: string;
      logro3: string;
    };
  }