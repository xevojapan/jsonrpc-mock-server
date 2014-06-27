# ユーザ登録API

## URL
/auth/register

## Method
POST

## Request

key | value | example
:---|:------|:-------
email | メールアドレス | uie@example.com
password | パスワード | abcd1234
username | 表示名 | uie bento
imageurl | 画像URL | 

## Response

#### HTTP Status Code

200

#### Body

```
{
  "result": true,
}
```

### エラー発生時

#### HTTP Status Code

400, 500

#### Body

```
{
  "result": false,
  "message": ""    // エラーメッセージ
}
```
