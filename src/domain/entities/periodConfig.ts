export interface PeriodConfig {
  id: string;
  periodId: string;
  year: string;
  fechaEntrega: string; // Formato ISO: "2025-03-15"
  fechaInicio?: string;
  fechaFin?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeriodConfigInput {
  periodId: string;
  year: string;
  fechaEntrega: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: boolean;
}
