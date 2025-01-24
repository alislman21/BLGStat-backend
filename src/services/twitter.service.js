const {TwitterApi} = require('twitter-api-v2');
const Tweets = require('../models/twitter-tweets.model');
const TwitterInfo = require("../models/twitter.model");
const fs = require("fs");
const https = require("https");
const path = require("path");
require('dotenv').config();


const callbackURL = 'http://localhost:5000/api/v1/twitter/auth/callback';
 

const client = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const twitterClient = client.readOnly;


// sessions problem
exports.auth = async () => {
    const {url, codeVerifier, state} = twitterClient.generateOAuth2AuthLink(callbackURL, {
        scope: ['tweet.read', 'users.read', 'tweet.write'],
    });

    return {url, codeVerifier, state};
};

exports.authCallback = async (state, code, codeVerifier) => {
    console.log('auth callback')
    // Obtain access and refresh tokens
    const {client: loggedClient, accessToken, refreshToken} =
        await twitterClient.loginWithOAuth2({
            code,
            codeVerifier: codeVerifier,
            redirectUri: callbackURL,
        });

    console.log('auth callback 2')
    // Fetch user information
    const user = await loggedClient.v2.me();

    return {user, accessToken, refreshToken};
};


exports.info = async (user) => {
    try {
        const twitterUser = await twitterClient.v2.userByUsername(user.twitterUsername, {
            'user.fields': 'id,name,username,created_at,description,profile_image_url,public_metrics'
        });

        if (twitterUser) {
            const twitterUserInfo = twitterUser.data;

            // Get the profile picture URL
            const profilePicUrl = twitterUserInfo.profile_image_url;

            // Download the profile picture
            const downloadProfilePic = (url, dest) => {
                return new Promise((resolve, reject) => {
                    const file = fs.createWriteStream(dest);
                    https.get(url, (response) => {
                        response.pipe(file);
                        file.on('finish', () => {
                            file.close(resolve);
                        });
                    }).on('error', (err) => {
                        fs.unlink(dest, () => {}); // Delete the file if error occurs
                        reject(err);
                    });
                });
            };

            const profilePicPath = path.join('src', 'public', 'profile_pics', `${twitterUserInfo.username}.jpg`);

            // Ensure the directory exists
            fs.mkdirSync(path.dirname(profilePicPath), { recursive: true });

            // Download the profile picture
            await downloadProfilePic(profilePicUrl, profilePicPath);

            const twitterData = {
                userId: user.id,
                accountId: twitterUserInfo.id,
                username: twitterUserInfo.username,
                full_name: twitterUserInfo.name,
                followers: twitterUserInfo.public_metrics.followers_count,
                followings: twitterUserInfo.public_metrics.following_count,
                post_count: twitterUserInfo.public_metrics.tweet_count,
                likes_count: twitterUserInfo.public_metrics.like_count,
                profile_picture: `${twitterUserInfo.username}.jpg`,
                bio: twitterUserInfo.description,
            };

            // Save the data to the database
            const submitInfo = await TwitterInfo.create(twitterData);
            console.log("twitter info :", submitInfo);
            return submitInfo;
        }
    } catch (err) {
        console.error('Error fetching tweets', err);
    }
};

const saveTweets = async (tweets, userId, platformAccountId) => {
    const bulkOperations = tweets.map((tweet) => {

        return {
            updateOne: {
                filter: {tweetId: tweet.id}, // Looks for a tweet in the database with the same tweetId
                update: { // Defines the fields to update or insert
                    userId: userId,
                    platformAccountId: platformAccountId,
                    tweetId: tweet.id,
                    content: tweet.text,
                    createdAt: tweet.created_at,
                    retweets: tweet.public_metrics.retweet_count,
                    replies: tweet.public_metrics.reply_count,
                    likes: tweet.public_metrics.like_count,
                    quotes:  tweet.public_metrics.quote_count,
                    bookmarks: tweet.public_metrics.bookmark_count,
                    impressions: tweet.public_metrics.impression_count,
                    text: tweet.text
                   
                },
                upsert: true, // If no matching document is found, a new document is inserted.
            },
        };
    }).filter(Boolean); // Remove null entries

    try {
        await Tweets.bulkWrite(bulkOperations);
        console.log('Tweets saved successfully');
        
    } catch (err) {
        console.log('Error saving tweets', err);
    }
};



exports.tweets = async (user) => {
    try {
        // Get user ID by username
        const twitterUser = await twitterClient.v2.userByUsername(user.twitterUsername);

        // Fetch the user's tweets
        let tweets;
        tweets = await twitterClient.v2.userTimeline(twitterUser.data.id, {
            max_results: 15, // Number of tweets to fetch
        });

        if (tweets && tweets.data.data && tweets.data.data.length > 0) {
            const tweetIds = tweets.data.data.map((tweet) => tweet.id)

            const tweetsInfo = await twitterClient.v2.tweets(tweetIds, {
                'tweet.fields': 'created_at,author_id,text,edit_history_tweet_ids,public_metrics'
            });

            // for (let i = 0; i < tweetsInfo.data.length; i++) {
            //     console.log(tweetsInfo.data[i]); 
            // }

            // Save tweets to the database
            await saveTweets(tweetsInfo.data, user.id, twitterUser.data.id);
        }

    } catch (err) {
        console.error('Error fetching tweets', err);
    }
};

exports.getInfo = async (req, res) => {
    const username = req.headers['username'];

    try{

        const socialUser = await TwitterInfo.findOne({username: username})
        if(!socialUser) {
            return res.status(404).json({ message: "user not found"});
        }

        return res.status(200).json({ socialUser });
    } catch (err) {
        console.log(err);
    }
}