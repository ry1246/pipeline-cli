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
  .option("-v, --invert-match", "マッチしなかったら行を出力する（grepの-vと同じ）");

program.parse();

const { pattern, ignoreCase, invertMatch } = program.opts();
const re = pattern ? new RegExp(pattern, ignoreCase ? "i" : undefined) : undefined;

const rl = createInterface({ input: process.stdin });

rl.on("line", (line) => {
  const matched = !re || re.test(line);
  if (matched !== !!invertMatch) {
    console.log(line);
  }
});
