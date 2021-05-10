//Express
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
//Imports
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

//Load app
app.listen(PORT,
    () => {
        var { name, version } = require('./package.json');
        console.log(`${name}:${version} is alive on port: ${PORT}`);
    }
)

//Parse the youtube link
app.get('/query', (req, res) => {
    //Get link
    const { search } = req.body;
    //If no search query is sent then error
    if (!search) res.status(400).send({ error: 'Could not parse link provided' });
    processGETRequest(req, res, search);
});

//Parse the youtube link with search limit
app.get('/query/:searchLimit', (req, res) => {
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
            ytpl(search, { limit: Infinity }).then((playList) => {
                //Resolve the playlist maped with links to an array
                resolve(playList.items.map(v => v.shortUrl));
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

    //Return new promise
    return new Promise((resolve, reject) => {
        //After promise
        promise.then(async (playList) => {
            //Check if playList contains links
            if (/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g.test(playList[0])) {
                //For each item in the array
                for (const link of playList) {
                    //For each item in the array
                    var songInfo = await ytdl.getBasicInfo(link);

                    //Get song
                    var song = {
                        title: songInfo.videoDetails.title,
                        url: (songInfo.videoDetails.video_url || songInfo.videoDetails.videoId),
                        duration_ms: parseInt(songInfo.videoDetails.lengthSeconds) * 1000
                    };
                    //Add to songMap
                    songMap.push(song);
                }
            } else {
                //Use search query for youtube link
                var searchResults = await ytsr(playList[0], { hl: 'en', pages: 1, requestOptions: { type: 'Video' } });

                //Filter for songs
                var songArray = searchResults.items
                    .filter(vid => vid.type.toLowerCase() == 'video' && !vid.isLive)
                    .map(v => ({
                        title: v.title,
                        url: v.url,
                        duration_ms: convertTimeStamp(v.duration)
                    })).slice(0, searchLimit);

                //Add array to songMap
                songMap = songMap.concat(songArray);
            }
            //Return the songMap
            resolve(songMap);
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
    if (timeParts.length == 1) totalTimeMilli += timeParts[0] * 1000;
    if (timeParts.length == 2) totalTimeMilli += timeParts[1] * (60 * 1000);
    if (timeParts.length == 3) totalTimeMilli += timeParts[2] * (60 * 60 * 1000);
    return totalTimeMilli;
}