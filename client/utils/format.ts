export function formatCurrency(n: number, currency: string = "USD", locale: string = "es-PE") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function formatDate(d: Date | string, locale: string = "es-ES") {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}
