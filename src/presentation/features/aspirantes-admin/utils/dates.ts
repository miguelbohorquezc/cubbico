// Convierte Firestore Timestamp | number | Date a Date (o null si no es válido).
export function coerceDate(v: any): Date | null {
  try {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    if (typeof v?.toDate === "function") {
      const d = v.toDate();
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof v === "number") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  } catch {
    return null;
  }
}

// Retorna el año UTC de un valor de fecha compatible.
export function getUTCYear(v: any): number | null {
  const d = coerceDate(v);
  return d ? d.getUTCFullYear() : null;
}
