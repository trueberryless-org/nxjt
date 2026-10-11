import { defineMiddleware } from "astro:middleware";

import { getRedirectUrl } from "./libs/redirect";

export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname !== "/") {
    return next();
  }

  const destination = getRedirectUrl(context.url.searchParams.get("q"));

  if (!destination) {
    return next();
  }

  return new Response(null, {
    headers: { Location: destination.toString() },
    status: 302,
  });
});
