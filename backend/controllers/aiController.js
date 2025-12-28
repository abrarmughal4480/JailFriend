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
        const status = error.response?.status || 500;
        const message = status === 401
            ? 'OpenAI API key is invalid or not configured correctly in Admin Settings'
            : (error.message || 'Failed to generate text');

        res.status(status).json({
            success: false,
            message: message
        });
    }
};

// Generate Image
const generateImage = async (req, res) => {
    try {
        const { prompt, type = 'square' } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const apiKey = await getOpenAIKey();

        let imageSize = "1024x1024";
        let model = "dall-e-3";

        // Adjust settings based on image type
        if (type === 'cover') {
            // OpenAI API Spec for DALL-E 3: "1024x1024", "1024x1792", "1792x1024"
            imageSize = "1792x1024";
        } else if (type === 'avatar') {
            imageSize = "1024x1024";
        }

        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model: model,
                prompt: prompt,
                n: 1,
                size: imageSize,
                response_format: "b64_json"
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const imageBase64 = response.data.data[0].b64_json;
        // Construct data URL
        const dataUrl = `data:image/png;base64,${imageBase64}`;

        res.json({
            success: true,
            data: { imageUrl: dataUrl } // Keeping key as imageUrl for minimal frontend change, but it is valid for <img src>
        });

    } catch (error) {
        console.error('AI Image Generation Error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = status === 401
            ? 'OpenAI API key is invalid or not configured correctly in Admin Settings'
            : (error.message || 'Failed to generate image');

        res.status(status).json({
            success: false,
            message: message
        });
    }
};

module.exports = {
    generateText,
    generateImage
};
