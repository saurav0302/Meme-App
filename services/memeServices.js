const axios = require('axios');
const { memeSubreddits } = require('./../config/config');

const REDDIT_CLIENT_ID = process.env.YOUR_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET;
const REDDIT_USER_AGENT = 'NodeJS:MemeApp:v1.0.0 (by /u/CorgiBeginning3298)';

async function getRedditAccessToken() {
    try {
        const response = await axios.post(
            'https://www.reddit.com/api/v1/access_token',
            'grant_type=client_credentials',
            {
                auth: {
                    username: REDDIT_CLIENT_ID,
                    password: REDDIT_CLIENT_SECRET
                },
                headers: {
                    'User-Agent': REDDIT_USER_AGENT,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Reddit access token:', error.message);
        throw error;
    }
}

async function fetchRedditMeme() {
    try {
        const accessToken = await getRedditAccessToken();
        const randomSubreddit = memeSubreddits[Math.floor(Math.random() * memeSubreddits.length)];
        console.log(`Requesting: https://oauth.reddit.com/r/${randomSubreddit}/random`);
        
        try {
            const response = await axios.get(
                `https://oauth.reddit.com/r/${randomSubreddit}/random`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': REDDIT_USER_AGENT
                    },
                    timeout: 5000,
                    validateStatus: function (status) {
                        // Tell axios to not throw on any status code
                        return true;
                    }
                }
            );

            // Now we can properly handle different status codes
            if (response.status === 403) {
                console.error(`Forbidden: Reddit API returned 403 for subreddit ${randomSubreddit}`);
                return getErrorResponse(`403 Forbidden on subreddit ${randomSubreddit}`);
            }

            if (response.status !== 200) {
                throw new Error(`Reddit API returned status ${response.status}`);
            }

            if (!response.data?.[0]?.data?.children?.[0]?.data) {
                throw new Error('Invalid response structure from Reddit');
            }

            const post = response.data[0].data.children[0].data;

            if (post.post_hint === 'image' && post.url) {
                return {
                    title: post.title || 'Untitled',
                    url: post.url,
                    author: post.author || 'Anonymous',
                    subreddit: post.subreddit_name_prefixed || `r/${randomSubreddit}`,
                    score: post.score || 0,
                    sourceLink: `https://reddit.com${post.permalink}`,
                    nsfw: post.over_18 || false
                };
            }

            // If we get here, the post wasn't an image, so try again
            return await fetchRedditMeme();

        } catch (error) {
            // Handle axios-specific errors
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
            }
            throw error; // Re-throw to be caught by outer try-catch
        }
    } catch (error) {
        console.error('Error fetching Reddit meme:', error.message);
        return getErrorResponse(error.message);
    }
}

function getErrorResponse(errorMessage) {
    return {
        title: 'Error loading meme',
        url: 'https://via.placeholder.com/500x500.png?text=Unable+to+load+meme',
        author: 'System',
        subreddit: 'r/error',
        score: 0,
        sourceLink: '#',
        error: errorMessage
    };
}

module.exports = { fetchRedditMeme };