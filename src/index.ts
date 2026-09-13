#!/usr/bin/env node
import { Command } from "commander";
import { createInterface } from "node:readline";

const program = new Command();

program
  .name("mylogfilter")
  .description("パイプで渡されたログをフィルタするCLI")
  .version("1.0.0");

program.parse();

const rl = createInterface({ input: process.stdin });

rl.on("line", (line) => {
  console.log(line)
});
