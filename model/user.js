const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  

// Define the schema with improvements
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address'] // Email regex
    },
    password: { 
        type: String, 
        required: true 
    },
    memeViews: {  
        type: Number,
        default: 0, 
        required: false
    }
});

// Pre-save hook to hash password before saving it
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);  
        this.password = await bcrypt.hash(this.password, salt);  
        next();
    } catch (error) {
        next(error);  
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);  
    } catch (error) {
        throw new Error(error);
    }
};

// Add method to increment meme views
userSchema.methods.incrementMemeViews = async function() {
    this.memeViews += 1;
    return await this.save();
};

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
