import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export type Region = "IN" | "UK";

/** Detects the visitor's region from the edge geolocation header. India → IN, everyone else → UK. */
export const getVisitorRegion = createServerFn({ method: "GET" }).handler(async (): Promise<Region> => {
  const code = (getRequestHeader("cf-ipcountry") ?? getRequestHeader("x-vercel-ip-country") ?? "").toUpperCase();
  return code === "IN" ? "IN" : "UK";
});
