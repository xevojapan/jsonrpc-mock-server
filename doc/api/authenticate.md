# 認証について

このサーバでは、以下の認証方法を提供します。

* パスワード認証
* 認証トークン
* OAuth認証
    * Facebook
    * Twitter
    * Google

認証APIのレスポンスについては、別途記載しています。

## パスワード認証

email address と password による一般的な認証方式

### URL

/auth/login

### Method

POST

### Parameter

key | value | example
:---|:------|:-------
email | メールアドレス | hhoriuchi@uievolution.com
password | パスワード | hhoriuchi


## 認証トークン方式

HU用に PIN番号だけを入力する想定の認証方式

### URL

/auth/login

### Method

POST

### Parameter

key | value | example
:---|:------|:-------
token | サーバが発行した認証トークン |
pinNumber | ユーザが決めたPIN番号 | 0000
vid | VIN もしくは HUのID |

## OAuth認証

各OAuth Providerを使った認証方式
それぞれ ProviderのWebへ飛び認証を行います。

### URL

/auth/facebook
/auth/twitter
/auth/google

### Method

GET



## 認証結果

いずれの認証方式でも、以下の3通りのレスポンスが返ります。

### 認証OK

#### HTTP Status Code

200

#### Body

```
{
  "result": true,
  "first": false    // 初めてのログインかどうか
}
```

### 認証NG

#### HTTP Status Code

401

#### Body

```
{
  "result": false
}
```

### エラー発生

#### HTTP Status Code

500

#### Body

エラーメッセージが返る。


## ログアウト

認証情報をリセットします。

### URL

/auth/logout

### Method

POST

### Parameter

request parameterは不要です。

### Response

#### HTTP Status Code

200

#### Body

```
{
  "result": true
}
```
