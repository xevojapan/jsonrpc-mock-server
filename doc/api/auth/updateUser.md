# ユーザ情報更新API

## URL
/auth/updateuser

## Method
POST

## Request

key | value | example
:---|:------|:-------
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

400, 401, 500

#### Body

```
{
  "result": false,
  "message": ""    // エラーメッセージ
}
```
