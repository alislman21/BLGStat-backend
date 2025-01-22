const InstagramInfo = require('../models/instagram.model');
const InstagramPost = require('../models/instagram-posts.model');
const fs = require('fs');
const path = require('path');


/*
    1- info: info about the user and store it in the database
    2- posts: get the posts of the user and sotre them in database
*/

exports.info = async (user) => {
    const https = require('https');

    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: 'instagram-scraper-api2.p.rapidapi.com',
            port: null,
            path: `/v1/info?username_or_id_or_url=${user.instagramUsername}`,
            headers: {
                'x-rapidapi-key': '5d222c192amshb1c67aa8e349a9ep11788bjsn4507da54e969',
                'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
            },
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            // Collecting data chunks
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            // Processing the response when all data is received
            res.on('end', async () => {
                try {
                    const body = JSON.parse(Buffer.concat(chunks).toString());

                    // Get the profile picture URL
                    const profilePicUrl = body.data.profile_pic_url_hd;

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

                    const profilePicPath = path.join('src', 'public', 'profile_pics', `${user.instagramUsername}.jpg`);

                    // Ensure the directory exists
                    fs.mkdirSync(path.dirname(profilePicPath), { recursive: true });

                    // Download the profile picture
                    await downloadProfilePic(profilePicUrl, profilePicPath);

                    const instagramData = {
                        userId: user.id,
                        accountId: body.data.id,
                        username: body.data.username,
                        full_name: body.data.full_name,
                        followers: body.data.follower_count,
                        followings: body.data.following_count,
                        profile_picture: `${user.instagramUsername}.jpg`,
                        bio: body.data.biography,
                    };

                    // Save the data to the database
                    const savedInfo = await InstagramInfo.create(instagramData);
                    console.log('Data saved successfully:', savedInfo);

                    // Resolve the Promise with the saved information
                    resolve(savedInfo);
                } catch (err) {
                    console.error('Error processing or saving data:', err);
                    reject(err);
                }
            });
        });

        req.on('error', (err) => {
            console.error('API request error:', err);
            reject(err); // Reject the Promise on error
        });

        req.end();
    });
};


exports.posts = async (user) => {
    console.log('start posts')
    console.log(user.instagramUsername)
    const http = require('https');

    const options = {
        method: 'GET',
        hostname: 'instagram-scraper-api2.p.rapidapi.com',
        port: null,
        path: `/v1.2/posts?username_or_id_or_url=${user.instagramUsername}`,
        headers: {
            'x-rapidapi-key': '5d222c192amshb1c67aa8e349a9ep11788bjsn4507da54e969',
            'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
        },
    };

    const req = http.request(options, (res) => {
        const chunks = []; // array of posts 

        res.on('data', (chunk) => {
            chunks.push(chunk); // store each binary chunk
        });

        res.on('end', async () => {
            try {
                console.log('start posts 2')

                const body = JSON.parse(Buffer.concat(chunks).toString());

                const posts = body.data.items;
                console.log(posts)

                // Map posts to the schema fields
                const postsToBeInsert = posts.map((post) => ({
                    userId: user.id,
                    platformAccountId: post.owner.id,
                    postId: post.id,
                    content: post.caption?.text || '',
                    thumbnail: post.thumbnail_url || '',
                    media_type: post.media_name || '',
                    likes: post.like_count || 0,
                    comments: post.comment_count || 0,
                    views: post.play_count || 0,
                    shares: post.share_count || 0,
                    createdAt: new Date(post.taken_at * 1000),
                }));

                // Save the data to the database
                // await InstagramPost.insertMany(postsToBeInsert, {ordered: false});
                // Use upsert for each post
                const operations = postsToBeInsert.map(post => ({
                    updateOne: {
                        filter: { postId: post.postId }, // Check if the post exists
                        update: { $set: post }, // Update the post if it exists
                        upsert: true, // Insert if not found
                    }
                }));

                // Perform bulk upsert operation
                await InstagramPost.bulkWrite(operations);
                console.error('saved data:');
            } catch (err) {
                console.error('Error processing or saving data:', err);
            }
        });
    });

    req.on('error', (err) => {
        console.error('API request error:', err);
    });

    req.end();
};

exports.getInfo = async (req, res) => {
    const username = req.headers['username'];

    try{

        const socialUser = await InstagramInfo.findOne({username: username})
        if(!socialUser) {
            return res.status(404).json({ message: "user not found"});
        }

        return res.status(200).json({ socialUser });
    } catch (err) {
        console.log(err);
    }
}

exports.getLastPost = async (req, res) => {
    try {
        const lastPost = await InstagramPost.findOne({userId: req.id}).sort({createdAt: -1 });
        if(!lastPost) {
            return res.status(404).json({message: 'post not found'});
        }

        return rs.status(200).json({lastPost});

    } catch (err) {
        console.log('fetch last update error');
        return res.status(500).json({message: 'error fetch'});
    }
}