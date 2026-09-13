#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("mylogfilter")
  .description("パイプで渡されたログをフィルタするCLI")
  .version("1.0.0");

program.parse();
