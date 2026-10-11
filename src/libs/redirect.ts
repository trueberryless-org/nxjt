import { parseCommandStr } from "./commands";

const REFERENCE = "nxjt";

export function getRedirectUrl(query: string | null) {
  if (!query) {
    return;
  }

  const command = parseCommandStr(query);

  if (command.type === "invalid" || !command.redirect) {
    return;
  }

  const destination = new URL(command.redirect);

  if (!destination.search) {
    destination.searchParams.set("ref", REFERENCE);
  }

  return destination;
}
