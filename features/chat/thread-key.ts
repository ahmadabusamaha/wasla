/** Canonical thread key between two orgs (order-independent). */
export function threadKeyFor(a: string, b: string): string {
  return `org:${[a, b].sort().join(":")}`;
}
