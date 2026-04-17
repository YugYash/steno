import type { FlashKind, SearchParams } from "@/lib/types";

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function readFlash(searchParams: SearchParams) {
  return {
    success: getSingleValue(searchParams.success),
    error: getSingleValue(searchParams.error),
    info: getSingleValue(searchParams.info),
  };
}

export function withFlash(path: string, kind: FlashKind, message: string) {
  const url = new URL(path, "http://steno.local");
  url.searchParams.set(kind, message);
  return `${url.pathname}${url.search}`;
}
