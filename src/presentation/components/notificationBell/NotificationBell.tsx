import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '../icons/SidebarIcons';
import { DeliveryNotification } from '../../../domain/entities/notification';
import { fetchActiveDeliveryNotifications } from '../../../infrastructure/notifications.service';
import { formatFechaEntrega } from '../../../infrastructure/periodConfig.service';

/**
 * Componente de notificaciones de fechas de entrega de informes
 * Muestra un icono de campana con badge contador de notificaciones pendientes
 */
export function NotificationBell() {
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener año actual
  const currentYear = new Date().getFullYear().toString();

  // Función para cargar notificaciones (reutilizable para retry)
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const allNotifications = await fetchActiveDeliveryNotifications(currentYear);

      // Filtrar solo notificaciones futuras (no pasadas)
      const futureNotifications = allNotifications.filter(
        notification => !notification.isPast
      );

      setNotifications(futureNotifications);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications();
  }, [currentYear]);

  // Función para reintentar carga
  const handleRetry = () => {
    loadNotifications();
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Contador de notificaciones
  const notificationCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid-blue-50 focus-visible:ring-offset-2 active:bg-gray-10 transition-all duration-200"
        title={
          error
            ? 'Error al cargar notificaciones (click para reintentar)'
            : loading
            ? 'Cargando notificaciones...'
            : notificationCount > 0
            ? `${notificationCount} fecha${notificationCount > 1 ? 's' : ''} de entrega próxima${notificationCount > 1 ? 's' : ''}`
            : 'No hay fechas de entrega pendientes'
        }
        aria-label="Notificaciones de fechas de entrega"
        aria-expanded={isOpen}
      >
        {/* Icono de campana */}
        <BellIcon
          size={24}
          className={error ? 'text-gray-40' : loading ? 'text-gray-40' : 'text-gray-70'}
          stroke={1.5}
        />

        {/* Badge con contador (solo si hay notificaciones) */}
        {!loading && notificationCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-orchid-blue-20 text-orchid-blue-70 rounded-full text-xs font-semibold"
            aria-label={`${notificationCount} notificaciones pendientes`}
          >
            {notificationCount}
          </span>
        )}

        {/* Indicador de carga */}
        {loading && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gray-40 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 top-[calc(100%+0.5rem)] w-[calc(100vw-2rem)] sm:w-80 max-w-md bg-white border border-gray-20 rounded-lg shadow-lg z-[1000] transition-all duration-200 ease-out origin-top-right scale-100 opacity-100">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-20">
            <h3 className="text-sm font-semibold text-gray-90">
              Fechas de Entrega de Informes
            </h3>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              // Estado de carga
              <div className="px-4 py-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-20 border-t-orchid-blue-50 rounded-full animate-spin" />
                <p className="mt-2 text-sm text-gray-60">Cargando...</p>
              </div>
            ) : error ? (
              // Estado de error
              <div className="px-4 py-8 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-magenta-ds/10 flex items-center justify-center mb-3">
                  <span className="text-magenta-ds text-xl font-bold">!</span>
                </div>
                <p className="text-sm text-gray-80 font-medium mb-1">
                  Error al cargar notificaciones
                </p>
                <p className="text-xs text-gray-60 mb-4">
                  No se pudo conectar con el servidor
                </p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-orchid-blue-60 text-white rounded-lg text-sm font-medium hover:bg-orchid-blue-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid-blue-50 focus-visible:ring-offset-2 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : notificationCount === 0 ? (
              // Estado vacío
              <div className="px-4 py-8 text-center">
                <BellIcon size={40} className="mx-auto text-gray-30 mb-3" stroke={1.5} />
                <p className="text-sm text-gray-80 font-medium mb-1">
                  Sin fechas pendientes
                </p>
                <p className="text-xs text-gray-60">
                  No hay fechas de entrega próximas o todas han pasado
                </p>
              </div>
            ) : (
              // Lista de notificaciones (máximo 4)
              <div className="py-2" role="list" aria-label="Lista de fechas de entrega">
                {notifications.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-5 transition-colors cursor-default"
                    role="listitem"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Badge de período */}
                      <span className="flex-shrink-0 px-2 py-1 bg-orchid-blue-10 text-orchid-blue-70 border border-orchid-blue-30 rounded text-xs font-semibold">
                        P{notification.periodId}
                      </span>

                      {/* Información de fecha */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-80 font-medium">
                          Período {notification.periodId}
                        </p>
                        <p className="text-xs text-gray-60 mt-0.5">
                          {formatFechaEntrega(notification.deliveryDate.toISOString().split('T')[0])}
                        </p>

                        {/* Indicador de urgencia */}
                        {notification.isUrgent && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 bg-peach-ds rounded-full" />
                            <span className="text-xs text-peach-cc font-medium">
                              {notification.daysUntilDelivery === 0
                                ? 'Hoy'
                                : notification.daysUntilDelivery === 1
                                ? 'Mañana'
                                : `Quedan ${notification.daysUntilDelivery} días`}
                            </span>
                          </div>
                        )}

                        {/* Días restantes (no urgente) */}
                        {!notification.isUrgent && (
                          <p className="text-xs text-gray-50 mt-1">
                            Quedan {notification.daysUntilDelivery} días
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
