# AppStoreの情報取得API

## URL
/api/appstore/list

## Method
GET

### Request
request parameterはなし

### Response
```
[
  {
    categoryId: 1,
    name: "Entertainments",
    items: [
      {
        "appid": "com.uievolution.bento.musicplayer",
        "displayName": "Super Music Player",
        "iconUrl": {
          "small": "http://localhost:3000/static/img/apps_icon/appicon_MyMusic_72x72.png",
          "medium": "http://localhost:3000/static/img/apps_icon/appicon_MyMusic_96x96.png",
          "large": "http://localhost:3000/static/img/apps_icon/appicon_MyMusic_192x192.png"
        },
        "fee": "free",
        "review": 4.5,
        "installed": true
      }
    ]
  }
]
```
