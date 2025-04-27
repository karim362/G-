// server.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// مفاتيح API من متغيّرات البيئة
const OPENCAGE_API_KEY   = process.env.OPENCAGE_API_KEY;
const ASTRONOMY_APP_ID   = process.env.ASTRONOMY_APP_ID;
const ASTRONOMY_APP_SECRET = process.env.ASTRONOMY_APP_SECRET;

// 1) نقطة نهاية GET للجذر للتأكد من تشغيل السيرفر
app.get('/', (req, res) => {
  res.send('🪐 خادم الفلك جاهز ويعمل بنجاح');
});

// 2) نقطة نهاية لحساب الإحداثيات
app.post('/get-coordinates', async (req, res) => {
  try {
    const { location } = req.body;
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        key: OPENCAGE_API_KEY,
        q: location,
        language: 'ar'
      }
    });
    const { lat, lng } = response.data.results[0].geometry;
    res.json({ lat, lng });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الحصول على الإحداثيات' });
  }
});

// 3) نقطة نهاية لحساب مواقع الكواكب
app.post('/get-planets', async (req, res) => {
  try {
    const { lat, lng, date, time } = req.body;
    // مثال باستخدام Astronomy API وهميّ – عدّل بناءً على المكتبة لديك
    const timestamp = `${date}T${time}:00`;
    const planetsResponse = await axios.get('https://api.astronomyapi.com/api/v2/studio/planet/positions', {
      params: { latitude: lat, longitude: lng, from_date: date, to_date: date, time },
      headers: {
        'x-app-id': ASTRONOMY_APP_ID,
        'x-app-secret': ASTRONOMY_APP_SECRET
      }
    });
    res.json(planetsResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الحصول على مواقع الكواكب' });
  }
});

// 4) استماع على البورت
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
