#!/usr/bin/env node
import { Command } from "commander";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";

const program = new Command();

program
  .name("mylogfilter")
  .description("パイプで渡されたログをフィルタするCLI")
  .version("1.0.0")
  .argument("[file]", "フィルタ対象のファイル（未指定時はstdinを読む）")
  .option("-p, --pattern <regex>", "指定した正規表現にマッチする行だけを出力")
  .option("-i, --ignore-case", "パターンまっちを大文字小文字無視で行う")
  .option("-v, --invert-match", "マッチしなかったら行を出力する（grepの-vと同じ）")
  .option("--status <code>", "combined log format のステータスコードでフィルタ")
  .option("--level <level>", "ログレベル（[ERROR]やlevel=error形式)でフィルタ")
  .option("-c, --count", "マッチした行を出力せず、件数のみを出力する");

program.parse();

const [file] = program.args;
const { pattern, ignoreCase, invertMatch, status, level, count } = program.opts();

let re: RegExp | undefined;
try {
  re = pattern ? new RegExp(pattern, ignoreCase ? "i" : undefined) : undefined;
} catch (err) {
  console.error(`mylogfilter: 不正な正規表現です：${(err as Error).message}`);
  process.exit(2);
}

const statusRe = /"[^"]*"\s+(\d{3})/;

function extractStatus(line: string): string | undefined {
  return statusRe.exec(line)?.[1];
}

const levelKvRe = /level=(\S+)/i;
const levelBracketRe = /\[(\w+)\]/;

function extractLevel(line: string): string | undefined {
  return levelKvRe.exec(line)?.[1] || levelBracketRe.exec(line)?.[1];
}

const input = file ? createReadStream(file) : process.stdin;

if (file) {
    input.on("error", (err: NodeJS.ErrnoException) => {
    const message = err.code === "ENOENT" ? "No such file or directory" : err.message;
    console.error(`mylogfilter: ${file}: ${message}`);
    process.exit(2);
  });
}

const rl = createInterface({ input});

let matchCount = 0;

rl.on("line", (line) => {
  const patternMatched = !re || re.test(line) !== !!invertMatch;
  const statusMatched = !status || extractStatus(line) === status;
  const levelMatched = !level || extractLevel(line)?.toLowerCase() === level.toLowerCase();
  if (patternMatched && statusMatched && levelMatched) {
    matchCount++;
    if (!count) {
      console.log(line);
    }
  }
});

rl.on("close", () => {
  if (count) {
    console.log(matchCount);
  }
  process.exitCode = matchCount > 0 ? 0 : 1;
});
