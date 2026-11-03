// Accept only same-origin absolute paths so ?next= cannot redirect off-site.
export function safeNext(value: string | string[] | null | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  return next && /^\/(?![/\\])/.test(next) ? next : "/";
}
