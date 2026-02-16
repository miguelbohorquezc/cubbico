import { DeliveryNotification, computeNotificationsFromPeriods } from "../domain/entities/notification";
import { fetchPeriodConfigsByYear } from "./periodConfig.service";

/**
 * Obtiene las notificaciones de fechas de entrega activas para un año específico
 *
 * Proceso:
 * 1. Obtiene todos los períodos configurados del año
 * 2. Filtra solo los períodos activos
 * 3. Convierte a notificaciones con cálculos de días y urgencia
 * 4. Retorna ordenadas por fecha de entrega
 *
 * @param year - Año académico (ej: "2025")
 * @returns Array de notificaciones calculadas
 * @throws Error si falla la consulta a Firestore
 */
export async function fetchActiveDeliveryNotifications(
  year: string
): Promise<DeliveryNotification[]> {
  try {
    // Obtener todos los períodos del año desde Firestore
    const periods = await fetchPeriodConfigsByYear(year);

    // Filtrar solo períodos activos
    const activePeriods = periods.filter(period => period.activo === true);

    // Convertir a notificaciones usando la lógica del dominio
    const notifications = computeNotificationsFromPeriods(activePeriods);

    return notifications;
  } catch (error) {
    console.error("Error al cargar notificaciones de entrega:", error);
    throw new Error("No se pudieron cargar las notificaciones de fechas de entrega");
  }
}
