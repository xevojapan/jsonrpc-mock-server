# MyAppsの更新API

## URL
/api/userapps/myapps

## Method
PUT

### Request
request body に以下のJSONを指定する。

```
{
  "apps": [
    "com.uievolution.bento.musicplayer",
  ],
}
```

### Response
```
{
  "result": true
}
```
