
const mongoose = require('mongoose');
const WebsiteSettings = require('../models/websiteSettings');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkKey = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const settings = await WebsiteSettings.getSettings();
        if (!settings.ai || !settings.ai.openai || !settings.ai.openai.apiKey) {
            console.error('No OpenAI API Key found in settings!');
            process.exit(1);
        }

        const apiKey = settings.ai.openai.apiKey;
        console.log('Using API Key (last 4 chars):', apiKey.slice(-4));
        console.log('Testing Key with OpenAI...');

        try {
            // List models - simple GET request to check auth
            const response = await axios.get('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            console.log('Success! OpenAI API returned', response.status);
            console.log('Key is VALID.');
        } catch (apiError) {
            console.error('OpenAI API Error:', apiError.response ? apiError.response.status : apiError.message);
            if (apiError.response && apiError.response.data) {
                console.error('Error Data:', JSON.stringify(apiError.response.data, null, 2));
            }
        }

        process.exit();
    } catch (error) {
        console.error('Script Error:', error);
        process.exit(1);
    }
};

checkKey();
