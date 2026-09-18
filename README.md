# mylogfilter

## Overview
パイプで渡されたログを1行ずつストリーム処理でフィルタするCLI<br />
`grep`のようにパイプで繋げて使用

## Install
```sh
npm install
npm run build
npm link
```

`npm link`後は`mylogfilter`コマンドとして実行可能<br />
ビルドせずに動作確認をしたい場合、`npx tsx src/index.ts`でも実行可

## Usage
```sh
mylogfilter [options] [file]
```

`file`を省略した場合、標準入力を読む

```sh
cat access.log | mylogfilter --status 500
mylogfilter --status 500 access.log
```

## Options
| オプション | 説明 |
| --- | --- |
| `-p, --pattern <regex>` | 指定した正規表現にマッチする行だけを出力 |
| `-i, --ignore-case` | `-p`のパターンマッチを大文字小文字無視で行う |
| `-v, --invert-match` | マッチしなかった行を出力（grepの`-v`と同様） |
| `--status <code>` | combined log format のステータスコード（例：`200`, `404`, `500`）でフィルタ |
| `--level <level>` | ログレベル（`[ERROR]`や`level=error`形式）を大文字小文字無視でフィルタ |
| `-c, --count` | マッチした行そのものでなく、件数を出力 |

複数オプションは組み合わせ可能（AND条件）

## Example
```sh
# ステータス500のアクセスログだけ出力
cat access.log | mylogfilter --status 500

# エラーログの件数をカウント
cat app.log | mylogfilter --level error -c

# "timeout"を含む行以外を出力
cat app.log | mylogfilter -p timeout -v

# ファイルを指定
mylogfilter --level error app.log
```

## Exit code
grep準拠
- `0`: マッチした行あり
- `1`: マッチした行なし
- `2`: 実行時エラー（不正な正規表現、存在しないファイルなど）

## Test
```sh
npm test
```

`node:test`によるユニットテスト（抽出ロジック）と統合テスト（CLI全体を入出力・終了コード）を実行

