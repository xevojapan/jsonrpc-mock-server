# 認証トークンの取得API

## URL
/auth/publishtoken

## Method
POST

## Requirement

ログインが必要

## Request

key | value | example
:---|:------|:-------
pin | PIN番号 | 0000
vid | VIN もしくは HUのID |

## Response

#### HTTP Status Code

200

#### Body

```
{
  "result": true,
  "token": "abcdefghijklmnop"    // 認証トークン
}
```

### エラー発生時

#### HTTP Status Code

400, 401, 500

#### Body

```
{
  "result": false,
  "message": ""    // エラーメッセージ
}
```
