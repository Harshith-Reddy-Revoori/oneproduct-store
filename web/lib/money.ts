// Convert "499" (rupees) or "499.50" to paise (int)
export function rupeesToPaise(input: string): number {
    const n = Number(input.replace(/[^\d.]/g, ""));
    if (Number.isNaN(n)) return 0;
    return Math.round(n * 100);
  }
  
  // Format paise back to "₹499.00"
  export function formatPaise(paise: bigint | number | null | undefined): string {
    if (paise === null || paise === undefined) return "₹0.00";
    const p = typeof paise === "bigint" ? Number(paise) : paise;
    return `₹${(p / 100).toFixed(2)}`;
  }
  