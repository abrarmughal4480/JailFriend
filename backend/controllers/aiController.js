const WebsiteSettings = require('../models/websiteSettings');
const axios = require('axios');

// Helper to get OpenAI API key
const getOpenAIKey = async () => {
    const settings = await WebsiteSettings.getSettings();
    if (!settings.ai || !settings.ai.openai || !settings.ai.openai.enabled || !settings.ai.openai.apiKey) {
        throw new Error('OpenAI is not configured or enabled');
    }
    return settings.ai.openai.apiKey;
};

// Generate Text
const generateText = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const apiKey = await getOpenAIKey();

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedText = response.data.choices[0].message.content;

        res.json({
            success: true,
            data: { text: generatedText }
        });

    } catch (error) {
        console.error('AI Text Generation Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate text'
        });
    }
};

// Generate Image
const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const apiKey = await getOpenAIKey();

        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                prompt: prompt,
                n: 1,
                size: "512x512"
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const imageUrl = response.data.data[0].url;

        res.json({
            success: true,
            data: { imageUrl: imageUrl }
        });

    } catch (error) {
        console.error('AI Image Generation Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate image'
        });
    }
};

module.exports = {
    generateText,
    generateImage
};
