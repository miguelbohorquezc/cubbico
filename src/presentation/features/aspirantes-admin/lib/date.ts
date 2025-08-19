export function formatFechaBonita(v: any) {
  let d: Date | null = null;
  try {
    d = v?.toDate ? v.toDate() : typeof v === "number" ? new Date(v) : null;
  } catch { d = null; }

  if (!d || isNaN(d.getTime())) {
    return { label: "—", dateTime: "" };
  }
  const fecha = d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  const hora  = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return { label: `${fecha} · ${hora}`, dateTime: d.toISOString() };
}
