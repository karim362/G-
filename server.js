// server.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// تأكد من تحميل المتغيرات
console.log('🔑 OPENCAGE_API_KEY =', process.env.OPENCAGE_API_KEY);
console.log('🔑 ASTRONOMY_APP_ID =', process.env.ASTRONOMY_APP_ID);
console.log('🔑 ASTRONOMY_APP_SECRET =', process.env.ASTRONOMY_APP_SECRET);

// 1) نقطة GET للجذر للتأكد من تشغيل السيرفر
app.get('/', (req, res) => {
  res.send('🪐 خادم الفلك جاهز ويعمل بنجاح');
});

// 2) نقطة لحساب الإحداثيات
app.post('/get-coordinates', async (req, res) => {
  console.log('📍 Incoming get-coordinates body:', req.body);
  try {
    const { location } = req.body;
    console.log('📍 Querying OpenCage for location:', location);
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        key: process.env.OPENCAGE_API_KEY,
        q: location,
        language: 'ar'
      }
    });
    console.log('✅ OpenCage response data:', response.data);
    if (!response.data.results || response.data.results.length === 0) {
      console.warn('⚠️ No results found for', location);
      return res.status(404).json({ error: 'لم يتم العثور على الموقع' });
    }
    const { lat, lng } = response.data.results[0].geometry;
    return res.json({ lat, lng });
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('❌ get-coordinates error detail:', detail);
    return res.status(500).json({ error: detail });
  }
});

// 3) نقطة لحساب مواقع الكواكب
app.post('/get-planets', async (req, res) => {
  console.log('📍 Incoming get-planets body:', req.body);
  try {
    const { lat, lng, date, time } = req.body;
    console.log(`📍 Querying Astronomy API for lat=${lat}, lng=${lng}, date=${date}, time=${time}`);
    const planetsResponse = await axios.get('https://api.astronomyapi.com/api/v2/studio/planet/positions', {
      params: { latitude: lat, longitude: lng, from_date: date, to_date: date, time },
      headers: {
        'x-app-id': process.env.ASTRONOMY_APP_ID,
        'x-app-secret': process.env.ASTRONOMY_APP_SECRET
      }
    });
    console.log('✅ Astronomy API response data:', planetsResponse.data);
    return res.json(planetsResponse.data);
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('❌ get-planets error detail:', detail);
    return res.status(500).json({ error: detail });
  }
});

// 4) استماع على البورت
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
