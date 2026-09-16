#!/usr/bin/env node
import { Command } from "commander";
import { createInterface } from "node:readline";

const program = new Command();

program
  .name("mylogfilter")
  .description("パイプで渡されたログをフィルタするCLI")
  .version("1.0.0")
  .option("-p, --pattern <regex>", "指定した正規表現にマッチする行だけを出力")
  .option("-i, --ignore-case", "パターンまっちを大文字小文字無視で行う")
  .option("-v, --invert-match", "マッチしなかったら行を出力する（grepの-vと同じ）")
  .option("--status <code>", "combined log format のステータスコードでフィルタ")
  .option("--level <level>", "ログレベル（[ERROR]やlevel=error形式)でフィルタ");

program.parse();

const { pattern, ignoreCase, invertMatch, status, level } = program.opts();
const re = pattern ? new RegExp(pattern, ignoreCase ? "i" : undefined) : undefined;

const statusRe = /"[^"]*"\s+(\d{3})/;

function extractStatus(line: string): string | undefined {
  return statusRe.exec(line)?.[1];
}

const levelKvRe = /level=(\S+)/i;
const levelBracketRe = /\[(\w+)\]/;

function extractLevel(line: string): string | undefined {
  return levelKvRe.exec(line)?.[1] || levelBracketRe.exec(line)?.[1];
}

const rl = createInterface({ input: process.stdin });

rl.on("line", (line) => {
  const patternMatched = !re || re.test(line) !== !!invertMatch;
  const statusMatched = !status || extractStatus(line) === status;
  const levelMatched = !level || extractLevel(line)?.toLowerCase() === level.toLowerCase();
  if (patternMatched && statusMatched && levelMatched) {
    console.log(line);
  }
});
