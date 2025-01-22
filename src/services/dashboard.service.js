const InstagramPost = require('../models/instagram-posts.model');
const InstagramModel = require('../models/instagram.model');
const TwitterTweet = require('../models/twitter-tweets.model');
const TwitterModel = require('../models/twitter.model');
const ReportModel = require('../models/report.model');
const {now} = require('mongoose');
const reportService = require("../services/report.service");
const { downloadFileAndReturnName } = require('./general.service');
const path = require('path');

exports.getLatestInstagramInfo = async (userId, username) => {
    try {
        return await InstagramModel.findOne({userId, username})
            .sort({_id: -1}) // Sort by the most recent _id
            .exec();
    } catch (error) {
        console.error('Error fetching latest Instagram info:', error);
        throw error;
    }
};

exports.getLatestTwitterInfo = async (userId, username) => {
    try {
        return await TwitterModel.findOne({userId, username})
            .sort({_id: -1}) // Sort by the most recent _id
            .exec();
    } catch (error) {
        console.error('Error fetching latest Twitter info:', error);
        throw error;
    }
};

exports.getDashboard = async (user) => {
    try {
        const latestInstagramInfo = await this.getLatestInstagramInfo(user.id, user.instagramUsername);
        const latestTwitterInfo = await this.getLatestTwitterInfo(user.id, user.twitterUsername);

        const posts = await reportService.getCurrentMonthPosts(user, latestInstagramInfo.accountId);
        const tweets = await reportService.getCurrentMonthTweets(user, latestTwitterInfo.accountId);

        let lastTweet = null, lastPost = null;

        let instagramStatistics = {
            likes: {
                lastPost: 0,
                previousPost: 0
            },
            comments: {
                lastPost: 0,
                previousPost: 0
            },
            views: {
                lastPost: 0,
                previousPost: 0
            },
        };

        let twitterStatistics = {
            likes: {
                lastPost: 0,
                previousPost: 0
            },
            comments: {
                lastPost: 0,
                previousPost: 0
            },
            views: {
                lastPost: 0,
                previousPost: 0
            },
        }

        if (posts.length === 0) {
            console.log('No posts found for the current month.');
        } else {
            console.log(`Found ${posts.length} posts for the current month.`);

            lastPost = posts[0];

            // Directory to save the profile pictures
            const destDir = path.join('src', 'public', 'profile_pics');

            // Download the file and get its name
            await downloadFileAndReturnName(`${lastPost.platformAccountId}-${lastPost.postId}.jpg`, lastPost.thumbnail, destDir);

            if (posts.length > 1) {
                const previousPost = posts[1];

                instagramStatistics = {
                    likes: {
                        lastPost: lastPost.likes,
                        previousPost: previousPost.likes
                    },
                    comments: {
                        lastPost: lastPost.comments,
                        previousPost: previousPost.comments
                    },
                    views: {
                        lastPost: lastPost.views,
                        previousPost: previousPost.views
                    },
                }
            }
        }

        if (tweets.length === 0) {
            console.log('No tweets found for the current month.');
        } else {
            console.log(`Found ${tweets.length} tweets for the current month.`);

            lastTweet = tweets[0];

            // Directory to save the profile pictures
            const destDir = path.join('src', 'public', 'profile_pics');

            // Download the file and get its name
            // await downloadFileAndReturnName(`${lastTweet.platformAccountId}-${lastTweet.tweetId}.jpg`, lastTweet.thumbnail, destDir);

            if (tweets.length > 1) {
                const previousTweet = tweets[1];

                twitterStatistics = {
                    likes: {
                        lastTweet: lastTweet.likes,
                        previousTweet: previousTweet.likes
                    },
                    replies: {
                        lastTweet: lastTweet.replies,
                        previousTweet: previousTweet.replies
                    },
                    retweets: {
                        lastTweet: lastTweet.retweets,
                        previousTweet: previousTweet.retweets,
                    },
                    quotes:{
                        lastTweet: lastTweet.quotes,
                        previousTweet: previousTweet.quotes,
                    },
                    bookmarks: {
                        lastTweet: lastTweet.bookmarks,
                        previousTweet: previousTweet.bookmarks,
                    },
                    impressions: {
                        lastTweet: lastTweet.impressions,
                        previousTweet: previousTweet.impressions
                    }
                }
            }
        }
        // console.log(
        //     'latestInstagramInfo', latestInstagramInfo,
        //     'latestTwitterInfo', latestTwitterInfo,
        //     'instagramStatistics', instagramStatistics,
        //     'twitterStatistics', twitterStatistics,
        //     lastPost, lastTweet
        // );

        return {
            latestInstagramInfo: latestInstagramInfo,
            latestTwitterInfo: latestTwitterInfo,
            instagramStatistics: instagramStatistics,
            twitterStatistics: twitterStatistics,
            lastPost: lastPost,
            lastTweet: lastTweet,
        }
    } catch (error) {
        console.error('Error:', error);
    }
};