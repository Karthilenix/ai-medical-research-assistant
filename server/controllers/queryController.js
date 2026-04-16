const axios = require('axios');
const Query = require('../models/Query');
const Cache = require('../models/Cache');

exports.processQuery = async (req, res) => {
    try {
        const { disease, query, location, history, userId } = req.body;
        
        if (!disease || !query) {
            return res.status(400).json({ error: 'Disease and query are required' });
        }

        // Cache Key generation changes: if there is history, we bypass standard caching to ensure personalized multi-turn flow
        const cacheKey = `${disease.toLowerCase()}_${query.toLowerCase()}_${location ? location.toLowerCase() : 'global'}`;
        
        if (!history || history.length === 0) {
            try {
                const cachedData = await Cache.findOne({ cacheKey });
                if (cachedData) {
                    console.log("Serving from MongoDB Cache");
                    return res.json(cachedData.data);
                }
            } catch(e) {
                console.log("DB offline, skipping cache checks");
            }
        }

        // Sanitize the URL to prevent double-slashes causing 307 POST drops in Render
        const fastApiUrl = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
        
        try {
            const response = await axios.post(`${fastApiUrl}/api/analyze`, {
                disease,
                query,
                location,
                history: history || []
            }, { timeout: 35000 }); // Enforce timeout so it doesn't hang forever
            
            const resultData = response.data;
            
            try {
               if (!history || history.length === 0) {
                   await Cache.create({ cacheKey, data: resultData });
               }
               // Optionally assign query to userId if authenticated
               await Query.create({ disease, query, location, user: userId || null });
               
               // Save chat history turn
               if (userId) {
                  const ChatHistory = require('../models/ChatHistory');
                  await ChatHistory.create({ 
                      user: userId, 
                      prompt: query, 
                      response: resultData.insights.join(' ') 
                  });
               }
            } catch(e) {
               console.log("Failed to save to DB:", e.message);
            }
            
            return res.json(resultData);
        } catch (apiError) {
            console.error('FastAPI Connection Error:', apiError.message);
            return res.status(503).json({ error: 'AI engine unavailable' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing query' });
    }
};
