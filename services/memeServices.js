const axios = require('axios');
const { memeSubreddits } = require('../config/config');

// Function to fetch memes from Reddit
async function fetchRedditMeme() {
    try {
        const randomSubreddit = memeSubreddits[Math.floor(Math.random() * memeSubreddits.length)];
        const response = await axios.get(`https://www.reddit.com/r/${randomSubreddit}/random.json`);
        const post = response.data[0].data.children[0].data;

        if (post.post_hint === 'image') {
            return {
                title: post.title,
                url: post.url,
                author: post.author,
                subreddit: post.subreddit_name_prefixed,
                score: post.score,
                sourceLink: `https://reddit.com${post.permalink}`
            };
        }
        return await fetchRedditMeme(); // Retry if it's not an image post
    } catch (error) {
        console.error('Error fetching Reddit meme:', error);
        return {
            title: 'Error loading meme',
            url: 'https://via.placeholder.com/500x500.png?text=Error+Loading+Meme',
            author: 'Unknown',
            subreddit: 'r/unknown',
            score: 0,
            sourceLink: '#'
        };
    }
}

module.exports = { fetchRedditMeme };
