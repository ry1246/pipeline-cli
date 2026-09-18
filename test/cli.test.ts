import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const tsxBin = path.resolve("node_modules/.bin/tsx");
const entry = path.resolve("src/index.ts");

function runCli(args: string[], input?: string) {
  return spawnSync(tsxBin, [entry, ...args], {
    input,
    encoding: "utf8",
  });
}

const accessLog =
  [
    `127.0.0.1 - - [10/Oct/2023:13:55:36 -0700] "GET /a HTTP/1.1" 200 123`,
    `192.168.0.1 - - [10/Oct/2023:13:56:00 -0700] "GET /b HTTP/1.1" 404 0`,
    `10.0.0.5 - - [10/Oct/2023:13:57:12 -0700] "POST /c HTTP/1.1" 500 42`,
    `10.0.0.5 - - [10/Oct/2023:13:58:00 -0700] "POST /d HTTP/1.1" 500 7`,
  ].join("\n") + "\n";

test("--statusでステータスコードによる絞り込みができる", () => {
  const result = runCli(["--status", "500"], accessLog);
  assert.equal(result.stdout.split("\n").filter(Boolean).length, 2);
  assert.match(result.stdout, /"POST \/c HTTP\/1\.1" 500 42/);
  assert.match(result.stdout, /"POST \/d HTTP\/1\.1" 500 7/);
  assert.equal(result.status, 0);
});

test("-p, -iで大文字小文字を無視したパターンマッチができる", () => {
  const result = runCli(["-p", "get", "-i"], accessLog);
  assert.equal(result.stdout.split("\n").filter(Boolean).length, 2);
  assert.equal(result.status, 0);
});

test("-vでマッチ行を反転できる", () => {
  const result = runCli(["-p", "GET"], accessLog);
  const inverted = runCli(["-p", "GET", "-v"], accessLog);
  assert.equal(
    result.stdout.split("\n").filter(Boolean).length +
      inverted.stdout.split("\n").filter(Boolean).length,
    4
  );
});

test("-cでマッチ件数のみを出力する", () => {
  const result = runCli(["--status", "500", "-c"], accessLog);
  assert.equal(result.stdout.trim(), "2");
});

test("位置引数でファイルを指定できる", () => {
  const result = runCli(["--status", "404", "samples/access.log"]);
  assert.match(result.stdout, /404/);
  assert.equal(result.status, 0);
});

test("マッチなしの場合は終了コード1", () => {
  const result = runCli(["--status", "999"], accessLog);
  assert.equal(result.stdout.trim(), "");
  assert.equal(result.status, 1);
});

test("不正な正規表現の場合は終了コード2", () => {
  const result = runCli(["-p", "("], accessLog);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /不正な正規表現/);
});

test("存在しないファイルの場合は終了コード2", () => {
  const result = runCli(["nonexistent.log"]);
  assert.equal(result.status, 2);
});
