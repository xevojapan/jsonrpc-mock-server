# CSRF対策について

サーバに対して、POST/PUT/DELETE の各METHODを呼び出す際には CSRF対策のために以下の2つの設定が必要になります。
GETに関しては不要です。

## Cookie

サーバのセッションを管理するためのCookieを送る必要があります。
そのため、POSTをする前にGETを1回呼び出す必要があります。

## HTTP Header

Cookieと別に以下の HTTPヘッダが必要です。

    X-XSRF-TOKEN

値には Cookieにある「XSRF-TOKEN」の値を渡す必要があります。

