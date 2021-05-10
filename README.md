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
