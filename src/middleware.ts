import { defineMiddleware } from "astro:middleware";

import { parseCommandStr } from "./libs/commands";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.url);
  if (url.pathname !== "/") return next();

  const query = url.searchParams.get("q");
  if (!query) return next();

  const command = parseCommandStr(query);
  if (command.type === "invalid" || !command.redirect) return next();

  const destination = new URL(command.redirect);

  // If no query exists, add a clean reference to stop Netlify passthrough
  if (!destination.search) {
    destination.searchParams.set("ref", "nxjt");
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
    },
  });
});
