import { PeriodConfig } from './periodConfig';

/**
 * Representa una notificación de fecha de entrega de informes
 */
export interface DeliveryNotification {
  /** ID único: formato {year}_{periodId} */
  id: string;
  /** ID del período académico (1, 2, 3, 4) */
  periodId: string;
  /** Año académico */
  year: string;
  /** Fecha de entrega parseada */
  deliveryDate: Date;
  /** Días hasta la fecha de entrega (negativo si ya pasó) */
  daysUntilDelivery: number;
  /** Indica si la fecha ya pasó */
  isPast: boolean;
  /** Indica si es urgente (7 días o menos) */
  isUrgent: boolean;
}

/**
 * Calcula los días entre dos fechas
 */
function calculateDaysUntil(targetDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalizar a medianoche

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Convierte un array de PeriodConfig a DeliveryNotification[]
 *
 * @param periods - Períodos académicos configurados
 * @returns Array de notificaciones calculadas
 */
export function computeNotificationsFromPeriods(
  periods: PeriodConfig[]
): DeliveryNotification[] {
  return periods
    .filter(period => period.fechaEntrega) // Solo períodos con fecha definida
    .map(period => {
      const deliveryDate = new Date(period.fechaEntrega);
      const daysUntilDelivery = calculateDaysUntil(deliveryDate);
      const isPast = daysUntilDelivery < 0;
      const isUrgent = !isPast && daysUntilDelivery <= 7;

      return {
        id: `${period.year}_${period.periodId}`,
        periodId: period.periodId,
        year: period.year,
        deliveryDate,
        daysUntilDelivery,
        isPast,
        isUrgent,
      };
    })
    .sort((a, b) => {
      // Ordenar por fecha de entrega (próxima primero)
      return a.deliveryDate.getTime() - b.deliveryDate.getTime();
    });
}
