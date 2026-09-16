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
  .option("--status <code>", "combined log format のステータスコードでフィルタ");

program.parse();

const { pattern, ignoreCase, invertMatch, status } = program.opts();
const re = pattern ? new RegExp(pattern, ignoreCase ? "i" : undefined) : undefined;

const statusRe = /"[^"]*"\s+(\d{3})/;

function extractStatus(line: string): string | undefined {
  return statusRe.exec(line)?.[1];
}

const rl = createInterface({ input: process.stdin });

rl.on("line", (line) => {
  const patternMatched = !re || re.test(line) !== !!invertMatch;
  const statusMatched = !status || extractStatus(line) === status;
  if (patternMatched && statusMatched) {
    console.log(line);
  }
});
