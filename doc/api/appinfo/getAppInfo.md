# AppInfoの取得API

## URL
/api/appinfo/:appid

## Method
GET

### Request
request parameterはなし

### Response
```
{
  "id": "com.uievolution.bento.musicplayer",
  "appid": "com.uievolution.bento.musicplayer",
  "displayName": "Super Music Player",
  "iconUrl": {
    "small": "http://localhost:3000/static/img/apps_icon/appicon_MyMusic_72x72.png",
    "medium": "http://localhost:3000/static/img/apps_icon/appicon_MyMusic_96x96.png",
    "large": "http://localhost:3000/static/img/apps_icon/appicon_MyMusic_192x192.png"
  },
  "seller": "UIEvolution K.K.",
  "fee": "free",
  "installed": true,
  "description": "You can lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  "screenShotURLs": [
    "http://localhost:3000/static/img/01_MusicMenu.png",
    "http://localhost:3000/static/img/02_AlbumList.png"
  ],
  "versionHistory": [
    {
      "version": "2.3",
      "description": "You can lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.You can lorem Ipsum is simply dummy text of the printing and typesetting industry."
    }
  ],
  "review": {
    "count": [
      2511,    // count of rate 1
      829,     // count of rate 2
      1626,    // count of rate 3
      2714,    // count of rate 4
      15187    // count of rate 5
    ],
    "latest": [
      {
        "username": "Ammy. K.S",
        "rate": 5,
        "comment": "Cool design! and It’s easy to use!"
      }
    ],
    "comments": []    // same as latest, for old versions
  },
  "categories": []    // unused.
}
```
