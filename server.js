// server.js

const express    = require('express');
const axios      = require('axios');
const bodyParser = require('body-parser');
const cors       = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// قراءة المفاتيح من البيئة
const APP_ID     = process.env.ASTRONOMY_APP_ID;
const APP_SECRET = process.env.ASTRONOMY_APP_SECRET;

// رمز المصادقة بصيغة Basic Auth
const authString = Buffer
  .from(`${APP_ID}:${APP_SECRET}`)
  .toString('base64');
const AUTH_HEADER = { 
  Authorization: `Basic ${authString}` 
};

app.post('/get-coordinates', async (req, res) => {
  try {
    const { location } = req.body;
    const response = await axios.get(
      'https://api.opencagedata.com/geocode/v1/json',
      { params: { key: process.env.OPENCAGE_API_KEY, q: location, language: 'ar' } }
    );
    if (!response.data.results.length)
      return res.status(404).json({ error: 'لم يتم العثور على الموقع' });
    const { lat, lng } = response.data.results[0].geometry;
    return res.json({ lat, lng });
  } catch (err) {
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.post('/get-planets', async (req, res) => {
  try {
    const { lat, lng, date, time } = req.body;

    const planetsResponse = await axios.get(
      'https://api.astronomyapi.com/api/v2/studio/planet/positions',
      {
        params: {
          latitude:  lat,
          longitude: lng,
          from_date: date,
          to_date:   date,
          time
        },
        headers: AUTH_HEADER
      }
    );

    return res.json(planetsResponse.data);
  } catch (err) {
    // إذا ردّت Astronomy API برسالة خطأ
    return res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
