const InstagramPost = require('../models/instagram-posts.model');
const InstagramModel = require('../models/instagram.model');
const TwitterTweet = require('../models/twitter-tweets.model');
const TwitterModel = require('../models/twitter.model');
const ReportModel = require('../models/report.model');
const {now} = require('mongoose');
const {getLatestInstagramInfo} = require("./dashboard.service");

exports.report = async (user) => {
    let lastInstagramReport = null, beforeLastInstagramReport = null,
        lastTwitterReport = null, beforeLastTwitterReport = null;

    const instagramReports = await ReportModel.find({
        userId: user.id,
        platform: 'instagram'
    }).sort({month: -1}) // Sort by the most recent month
        .limit(2) // Limit the result to the two most recent reports
        .exec();

    if (instagramReports.length > 0) {
        // Extract the last report and the one before it
        lastInstagramReport = instagramReports[0];
        beforeLastInstagramReport = instagramReports[1];
    }

    const twitterReports = await ReportModel.find({
        userId: user.id,
        platform: 'x'
    }).sort({month: -1}) // Sort by the most recent month
        .limit(2) // Limit the result to the two most recent reports
        .exec();

    if (twitterReports.length > 0) {
        // Extract the last report and the one before it
        lastTwitterReport = twitterReports[0];
        beforeLastTwitterReport = twitterReports[1];
    }

    return {
        lastInstagramReport: lastInstagramReport,
        beforeLastInstagramReport: beforeLastInstagramReport,
        lastTwitterReport: lastTwitterReport,
        beforeLastTwitterReport: beforeLastTwitterReport
    }
};

exports.getCurrentMonthPosts = async (user, platformAccountId) => {
    try {
        // Get the first and last dates of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Query to find posts within the current month
        const posts = await InstagramPost.find({
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            },
            userId: user.id,
            platformAccountId: platformAccountId
        }).sort({createdAt: -1}) // Sort by the most recent _id
            .exec();

        // console.log('Posts from the current month:', posts);
        return posts;
    } catch (error) {
        console.error('Error retrieving posts:', error);
        throw error;
    }
};

exports.getCurrentMonthTweets = async (user, platformAccountId) => {
    try {
        // Get the first and last dates of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Query to find posts within the current month
        const tweets = await TwitterTweet.find({
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            },
            userId: user.id,
            platformAccountId: platformAccountId
        }).sort({_id: -1}) // Sort by the most recent _id
            .exec();

        // console.log('Tweets from the current month:', tweets);
        return tweets;
    } catch (error) {
        console.error('Error retrieving posts:', error);
        throw error;
    }
};

exports.getInstagramReport = async (user) => {
    /*
    * Report:
    * - get tweets/posts of the current month
    * - totalLikes of the fetched posts 
    * - totalViews of the fetched posts
    * - totalComments of the fetched posts
    * - followers of the month
    * - followings of the month
    * */

    // Get the posts of this month
    const instagramUser = await InstagramModel.findOne({userId: user.id, username: user.instagramUsername})
        .sort({_id: -1}) // Sort by the most recent _id
        .exec();

    if (instagramUser) {
        // throw new Error(`Instagram user with ID ${user.id} not found.`);
        const posts = await this.getCurrentMonthPosts(user, instagramUser.accountId);

        if (posts.length === 0) {
            console.log('No posts found for the current month.');
        } else {
            console.log(`Found ${posts.length} posts for the current month.`);

            // Calculate totals
            let accumulator = {likes: 0, comments: 0, views: 0}; // Default totals
            accumulator = posts.reduce(
                (acc, post) => {
                    acc.likes += post.likes;
                    acc.comments += post.comments;
                    acc.views += post.views;
                    return acc;
                },
                {likes: 0, comments: 0, views: 0} // Initial accumulator values
            );

            const newReport = await ReportModel.create({
                userId: instagramUser.userId,
                totalLikes: accumulator.likes,
                totalComments: accumulator.comments,
                totalViews: accumulator.views,
                platform: 'instagram',
                followers: instagramUser.followers || 0,
                following: instagramUser.followings || 0
            });

            return newReport;
        }
    }

    return null;
};

exports.getTwitterReport = async (user) => {
    /*
     * Report:
     * - get tweets/posts of the current month
     * - totalLikes of the fetched posts
     * - totalViews of the fetched posts
     * - totalComments of the fetched posts
     * - followers of the month
     * - followings of the month
     */
    try {
        // Get the tweets of this month
        const twitterUser = await TwitterModel.findOne({userId: user.user._id, username: user.user.twitterUsername})
            .sort({_id: -1}) // Sort by the most recent _id
            .exec();
        
        console.log(`twitter user ${twitterUser}`);
        if (twitterUser) {
            // throw new Error(`Twitter user with ID ${user.id} not found.`);
            const tweets = await this.getCurrentMonthTweets(user.user, twitterUser.accountId);
            
            if (tweets.length === 0) {
                console.log('No tweets found for the current month.');
            } else {
                console.log(`Found ${tweets.length} posts for the current month.`);

                // Calculate totals
                let accumulator = {likes: 0, comments: 0, views: 0}; // Default totals
                accumulator = tweets.reduce(
                    (acc, post) => {
                        acc.likes += post.likes || 0;
                        acc.comments += post.replies || 0;
                        acc.views += post.impressions || 0;
                        return acc;
                    },
                    {likes: 0, comments: 0, views: 0} // Initial accumulator values
                );

                // Create a new report
                const newReport = await ReportModel.create({
                    userId: twitterUser.userId,
                    totalLikes: accumulator.likes,
                    totalComments: accumulator.comments,
                    totalViews: accumulator.views,
                    platform: 'x',
                    followers: twitterUser.followers || 0,
                    following: twitterUser.followings || 0
                });

                return newReport;
            }
        }

        return null;

    } catch (err) {
        console.error('get Twitter report error:', err);
        throw err; // Re-throw the error for higher-level handling
    }
};