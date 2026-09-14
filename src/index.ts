#!/usr/bin/env node
import { Command } from "commander";
import { createInterface } from "node:readline";

const program = new Command();

program
  .name("mylogfilter")
  .description("パイプで渡されたログをフィルタするCLI")
  .version("1.0.0")
  .option("-p, --pattern <regex>", "指定した正規表現にマッチする行だけを出力");

program.parse();

const { pattern } = program.opts();
const re = pattern ? new RegExp(pattern) : undefined;

const rl = createInterface({ input: process.stdin });

rl.on("line", (line) => {
  if (!re || re.test(line)) {
    console.log(line);
  }
});
