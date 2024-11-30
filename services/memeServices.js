const axios = require('axios');
const { memeSubreddits } = require('./../config/config');

// Function to fetch memes from Reddit
async function fetchRedditMeme() {
    try {
        // Custom user agent is required by Reddit's API rules
        const customHeaders = {
            'User-Agent': 'Mozilla/5.0 (Node.js Bot) MyApp/1.0.0',
            'Accept': 'application/json'
        };

        const randomSubreddit = memeSubreddits[Math.floor(Math.random() * memeSubreddits.length)];
        const response = await axios.get(
            `https://www.reddit.com/r/${randomSubreddit}/random.json`,
            {
                headers: customHeaders,
                // Adding timeout to prevent hanging requests
                timeout: 5000
            }
        );

        // Handle case where response doesn't contain expected data
        if (!response.data?.[0]?.data?.children?.[0]?.data) {
            throw new Error('Invalid response structure from Reddit');
        }

        const post = response.data[0].data.children[0].data;

        // Check if the post contains an image
        if (post.post_hint === 'image' && post.url) {
            return {
                title: post.title || 'Untitled',
                url: post.url,
                author: post.author || 'Anonymous',
                subreddit: post.subreddit_name_prefixed || `r/${randomSubreddit}`,
                score: post.score || 0,
                sourceLink: `https://reddit.com${post.permalink}`
            };
        }

        // If not an image post, retry
        return await fetchRedditMeme();

    } catch (error) {
        console.error('Error fetching Reddit meme:', error.message);
        
        // Return a more informative fallback object
        return {
            title: 'Error loading meme',
            url: 'https://via.placeholder.com/500x500.png?text=Unable+to+load+meme',
            author: 'System',
            subreddit: 'r/error',
            score: 0,
            sourceLink: '#',
            error: error.message
        };
    }
}

module.exports = { fetchRedditMeme };