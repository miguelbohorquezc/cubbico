export interface CatedraSocioemocional {
  id: string;
  nivel: string;
  grado: string;
  year: string;
  periodo1: string;
  periodo2: string;
  periodo3: string;
  periodo4: string;
}

export interface ProyectosTransversales {
  id: string;
  year: string;
  periodo1: string;
  periodo2: string;
  periodo3: string;
  periodo4: string;
}

/**
 * Construye el ID del documento de cátedra.
 * El `grado` debe coincidir con el `nombreSalon` del salón en Firestore
 * (ej: "1A", "Primero A"). Este contrato debe respetarse tanto en la página
 * de gestión como en el hook de carga de informes.
 */
export const buildCatedraId = (nivel: string, grado: string, year: string): string =>
  `${nivel}_${grado}_${year}`;

export const buildProyectosId = (year: string): string => year;

export const isCatedraSocioemocional = (value: unknown): value is CatedraSocioemocional => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['nivel'] === 'string' &&
    typeof v['grado'] === 'string' &&
    typeof v['year'] === 'string'
  );
};

export const isProyectosTransversales = (value: unknown): value is ProyectosTransversales => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v['id'] === 'string' && typeof v['year'] === 'string';
};
