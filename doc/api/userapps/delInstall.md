# アプリケーションUninstall API

## URL
/api/userapps/install/:appid

## Method
DELETE

### Request
request parameterはなし

### Response
#### アンインストール完了
```
{
  "result": true
}
```

#### インストールされていない
```
{
  "result": false
}
```
