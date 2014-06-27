# Installの確認API

## URL
/api/userapps/install/:appid

## Method
GET

### Request
request parameterはなし

### Response
#### インストールされている
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
