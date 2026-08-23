import "server-only";
import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  getDirection,
  normalizeLocale,
  type Locale,
} from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Reads the locale from the cookie (Arabic is the default). */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())];
}

export { getDirection };
