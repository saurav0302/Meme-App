const axios = require('axios');
const { memeSubreddits } = require('./../config/config'); // Assuming you have this list in your config

// Reddit OAuth configuration
const REDDIT_CLIENT_ID = process.env.YOUR_CLIENT_ID; // Replace with your Reddit app's client ID
const REDDIT_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET; // Replace with your Reddit app's client secret
const REDDIT_USER_AGENT = 'NodeJS:MemeApp:v1.0.0 (by /u/CorgiBeginning3298)';  // Replace with your actual Reddit username

// Function to get Reddit OAuth access token
async function getRedditAccessToken() {
    try {
        const response = await axios.post(
            'https://www.reddit.com/api/v1/access_token',
            'grant_type=client_credentials', // client credentials flow
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
        // console.log('Reddit Access Token:', response.data.access_token);  // Log token for debugging
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Reddit access token:', error.message);
        throw error;
    }
}

// Function to fetch memes from Reddit
async function fetchRedditMeme() {
    try {
        // Get access token
        const accessToken = await getRedditAccessToken();
        
        // Randomly pick a subreddit from your memeSubreddits array
        const randomSubreddit = memeSubreddits[Math.floor(Math.random() * memeSubreddits.length)];
        console.log(`Requesting: https://oauth.reddit.com/r/${randomSubreddit}/random`);
        
        // Fetch random meme post from the chosen subreddit
        const response = await axios.get(
            `https://oauth.reddit.com/r/${randomSubreddit}/random`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // Bearer token authentication
                    'User-Agent': REDDIT_USER_AGENT // User-Agent header is required by Reddit API
                },
                timeout: 5000 // 10 seconds timeout to avoid hanging requests
            },
            console.log('Response status:', response.status)
        );

        // Handle 403 Forbidden errors
        if (response.status === 403) {
            console.error(`Forbidden: Reddit API returned 403 for subreddit ${randomSubreddit}`);
            return getErrorResponse(`403 Forbidden on subreddit ${randomSubreddit}`);
        }

        // Check the response data structure
        if (!response.data?.[0]?.data?.children?.[0]?.data) {
            throw new Error('Invalid response structure from Reddit');
        }

        // Extract the post data
        const post = response.data[0].data.children[0].data;

        // If the post is an image, return the meme data
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

        // Retry fetching if the post is not an image
        return await fetchRedditMeme();

    } catch (error) {
        // Handle errors that occur during the API request
        console.error('Error fetching Reddit meme:', error.message);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        return getErrorResponse(error.message);
    }
}

// Helper function to return a default error response if something goes wrong
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

// Export the function so it can be used in other parts of the app
module.exports = { fetchRedditMeme };
