const statusRe = /"[^"]*"\s+(\d{3})/;

export function extractStatus(line: string): string | undefined {
  return statusRe.exec(line)?.[1];
}

const levelKvRe = /level=(\S+)/i;
const levelBracketRe = /\[(\w+)\]/;

export function extractLevel(line: string): string | undefined {
  return levelKvRe.exec(line)?.[1] || levelBracketRe.exec(line)?.[1];
}

