//Express
const express = require('express');
const app = express();
//Imports
const helmet = require('helmet');
const morgan = require('morgan');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');

//Consts
const PORT = process.env.PORT || 8080;
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') require('dotenv').config();

//Use middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
//Timeout catch
app.use((req, res, next) => {
    req.setTimeout(30000, function () {
        //Send error
        res.status(504).send({ error: 'Request Timed Out' });
    });
    next();
});

//Load app
app.listen(PORT,
    () => {
        var { name, version } = require('./package.json');
        console.log(`${name}:${version} is alive on port: ${PORT}`);

        //Ping server constantly to avoid idle
        const minutes = 1, interval = minutes * 60 * 1000;
        //Ping bot
        setInterval(function () {
            console.log('I am currently alive.');
        }, interval);
    }
)

//Parse the youtube link
app.post('/query', (req, res) => {
    //Get link
    const { search } = req.body;
    //If no search query is sent then error
    if (!search) res.status(400).send({ error: 'Could not parse link provided' });
    processGETRequest(req, res, search);
});

//Parse the youtube link with search limit
app.post('/query/:searchLimit', (req, res) => {
    //Get search limit and link
    const { searchLimit } = req.params;
    const { search } = req.body;
    //If no search query is sent then error
    if (!search) res.status(400).send({ error: 'Could not parse link provided' });
    processGETRequest(req, res, search, searchLimit);
})

//Process query
processGETRequest = async (req, res, search, searchLimit = 5) => {
    //Check if the link is a playlist
    const promise = playListPromise(search);

    //process promise
    processPromise(promise, searchLimit).then((songArray) => {
        //Send response
        res.status(200).send({
            response: songArray
        });
    }).catch((error) => {
        //Send error response
        res.status(500).send({ error: error });
    });
}

//Function to check for playlist or link (or other)
playListPromise = (search) => {
    if (ytpl.validateID(search)) {
        //Return a promise for the playlist
        return new Promise((resolve, reject) => {
            ytpl(search, { limit: /*Infinity*/500 }).then((playList) => {
                //Resolve the playlist maped with links to an array
                resolve(playList.items
                    .filter(vid => !vid.isLive)
                    .map(v => ({
                        title: v.title,
                        url: v.shortUrl || v.url,
                        duration_ms: v.durationSec ? v.durationSec * 1000 : v.duration ? convertTimeStamp(v.duration) : 0,
                        thumbnail: bestThumbnail(v.thumbnails)
                    })));
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        //Return a promise for the link as an array
        return new Promise((resolve, reject) => {
            resolve([search]);
        });
    }
}

//Function to process playlist array
processPromise = (promise, searchLimit) => {
    var songMap = new Array();
    var type = '';

    //Return new promise
    return new Promise((resolve, reject) => {
        //After promise
        promise.then(async (playList) => {
            //Check if playList contains links
            if (playList.length > 1 || /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g.test(playList[0])) {
                //Check if it's a single link or array
                if (playList.length == 1) {
                    //For each item in the array
                    var songInfo = await ytdl.getBasicInfo(playList[0]);

                    //Get song
                    var song = {
                        title: songInfo.videoDetails.title,
                        url: (songInfo.videoDetails.video_url || songInfo.videoDetails.videoId),
                        duration_ms: songInfo.videoDetails.lengthSeconds ? parseInt(songInfo.videoDetails.lengthSeconds) * 1000 : 0,
                        thumbnail: bestThumbnail(songInfo.videoDetails.thumbnails)
                    };
                    type = 'song';
                    //Add to songMap
                    songMap.push(song);
                } else {
                    //Playlist data already contains basic info
                    type = 'playlist';
                    //Add to songMap
                    songMap = songMap.concat(playList);
                }
            } else {
                //Use search query for youtube link
                var searchResults = await ytsr(playList[0], { hl: 'en', pages: 1 });

                //Filter for songs
                var songArray = searchResults.items
                    .filter(vid => vid.type.toLowerCase() == 'video' && !vid.isLive)
                    .map(v => ({
                        title: v.title,
                        url: v.url,
                        duration_ms: v.duration ? convertTimeStamp(v.duration) : 0,
                        thumbnail: bestThumbnail(v.thumbnails)
                    })).slice(0, searchLimit);

                //Add array to songMap
                type = 'search';
                songMap = songMap.concat(songArray);
            }
            //Return the songMap
            resolve({ Message: type, Array: songMap });
        }).catch((error) => {
            console.error(error);
            reject(error);
        });
    });
}

//Turn duration time stamp (1:45:20) into milliseconds
convertTimeStamp = (timeStamp) => {
    var timeParts = timeStamp.split(':').reverse();
    var totalTimeMilli = 0;
    //For each part
    if (timeParts.length >= 1) totalTimeMilli += timeParts[0] * 1000;
    if (timeParts.length >= 2) totalTimeMilli += timeParts[1] * (60 * 1000);
    if (timeParts.length >= 3) totalTimeMilli += timeParts[2] * (60 * 60 * 1000);
    return totalTimeMilli;
}

//Biggest thumbnail
bestThumbnail = (array) => {
    if (array.length > 0) {
        return array.sort(function (a, b) {
            if (a['width'] == b['width']) return 0
            else if (parseInt(a['width'] < parseInt(b['width']))) return 1;
            else return -1;
        })[0].url;
    } else
        return null;
}
