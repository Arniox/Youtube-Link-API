# Youtube Link API
Parses a Youtube video/playlist link to get details. Or queries a string for a Youtube video Link

## How to use:

**POST**

[https://youtube-link-api.herokuapp.com/query](https://youtube-link-api.herokuapp.com/query)

search: *query string*


## Example with Axios:
```js
const response = await axios.post(`https://youtube-link-api.herokuapp.com/query`, {
    search: query
});
```

### Specific Requests

**POST**

[https://youtube-link-api.herokuapp.com/query/:searchLimit](https://youtube-link-api.herokuapp.com/query/:searchLimit)

search: *query string*

### Example with Axios
```js
const response = await axios.post(`https://youtube-link-api.herokuapp.com/query/50`, {
    search: query
});
```
searchLimit is specifically for limiting the ytsr search limit. How many links are returned on a basic string query search.

# Example Output:
###### Request:
```json
{ "search": "https://youtu.be/RrtkU7i0qD8" }
```
###### Response:
```json
{
  "response": {
    "Message": "song",
    "Array": [
      {
        "title": "Joji - Your Man (Official Video)",
        "url": "https://www.youtube.com/watch?v=RrtkU7i0qD8",
        "duration_ms": 201000
      }
    ]
  }
}
```
# Example Output 2:
###### Request:
```json
{ "search": "Joji in the Dark" }
```
###### Response:
```json
{
  "response": {
    "Message": "search",
    "Array": [
      {
        "title": "Joji - SLOW DANCING IN THE DARK",
        "url": "https://www.youtube.com/watch?v=K3Qzzggn--s",
        "duration_ms": 180000
      },
      {
        "title": "Joji - SLOW DANCING IN THE DARK (Lyrics on screen)",
        "url": "https://www.youtube.com/watch?v=sVDiAoxdR8E",
        "duration_ms": 180000
      },
      {
        "title": "SLOW DANCING IN THE DARK",
        "url": "https://www.youtube.com/watch?v=vzjUs5yR68o",
        "duration_ms": 180000
      },
      {
        "title": "Joji - Slow Dancing in the Dark (Reading + Leeds 2019)",
        "url": "https://www.youtube.com/watch?v=HutRczJw-AM",
        "duration_ms": 180000
      },
      {
        "title": "Joji - SLOW DANCING IN THE DARK (Live at Head In The Clouds Festival 2019)",
        "url": "https://www.youtube.com/watch?v=8Z62y1_9TLA",
        "duration_ms": 360000
      }
    ]
  }
}
```



## TODO
- [x] searchLimit restriction
- [ ] return downloadable files option
- [ ] return detailed video meta data (such as image urls/data streams)


# Packages Used:
- [express](https://expressjs.com/) - API framework
- [helmet](https://www.npmjs.com/package/helmet) - Security made easy
- [morgan](https://www.npmjs.com/package/helmet) - Auto HTTP request logging
- [ytdl-core](https://www.npmjs.com/package/ytdl-core) - Youtube Link meta data downloading (also data stream downloading)
- [ytpl](https://www.npmjs.com/package/ytpl?activeTab=readme) - Youtube Playlist meta data downloading
- [ytsr](https://www.npmjs.com/package/ytsr) - Youtube String searcher/meta data downloading
