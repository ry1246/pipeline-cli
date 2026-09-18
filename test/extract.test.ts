import { test } from "node:test";
import assert from "node:assert/strict";
import { extractStatus, extractLevel } from "../src/extract.js";

test("extractStatus: combined log formatからステータスコードを抽出する", () => {
  const line = `127.0.0.1 - - [10/Oct/2023:13:55:36 -0700] "GET /a HTTP/1.1" 200 123`;
  assert.equal(extractStatus(line), "200");
});

test("extractStatus: マッチしない行はundefinedを返す", () => {
  assert.equal(extractStatus("no status here"), undefined);
});

test("extractLevel: [LEVEL]形式を抽出する", () => {
  assert.equal(extractLevel("2023-10-10T13:56:10 [ERROR] failed"), "ERROR");
});

test("extractLevel: level=形式を抽出する", () => {
  assert.equal(extractLevel('2023-10-10T13:57:00 level=warn msg="x"'), "warn");
});

test("extractLevel: level=形式が[LEVEL]形式より優先される", () => {
  assert.equal(extractLevel("level=info [ERROR] mixed"), "info");
});

test("extractLevel: マッチしない行はundefinedを返す", () => {
  assert.equal(extractLevel("plain text line"), undefined);
});
