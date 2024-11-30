const { fetchRedditMeme } = require('../services/memeServices');

// Get Meme 
const getMeme = async (req, res) => {
    try {
        const meme = await fetchRedditMeme();
        res.render('index', { meme });  // Render the meme on the page
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading the page');
    }
};

// Get New Meme 
const getNewMeme = async (req, res) => {
    try {
        const meme = await fetchRedditMeme();

        // increment user count 
        if (req.user) {
            if (req.session.user) {
                const user = await User.findById(req.session.user._id);
                await user.incrementMemeViews();
                user.save();
            }
        }

        res.json(meme); // Send the meme data as JSON response
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch meme' });
    }
};

module.exports = { getMeme, getNewMeme };
