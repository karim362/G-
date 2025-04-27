// هذا هو ملف الخادم الرئيسي مع شرح كامل بالعربي
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');

// السماح بالاتصالات بين موقعك والخادم
app.use(cors());
app.use(express.json());

// مفاتيحك الخاصة
const OPENCAGE_API_KEY = "2bae061bcafa45b2a7cfbeb395c52975";
const ASTRONOMY_API_ID = "0674d1a2-abd2-488c-a4f2-fe21743f8a98";
const ASTRONOMY_API_SECRET = "e2d12072585f550def86af89ec5fcfd2a36d88faf72280c68753018f8b2e053062015da957df3c2db9d90d6fa00fd49ba8dcbe58ac574de84bdb96141dbf9c05925f8b93159822e5d446147a30288d90e1f8384b3212259e7fad80b63be8e638932a0a19c487b6e9e13ec91e2ed39304";

// مسار للحصول على إحداثيات المدينة
app.post('/get-coordinates', async (req, res) => {
    const { city } = req.body;
    try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${OPENCAGE_API_KEY}`);
        const { lat, lng } = response.data.results[0].geometry;
        res.json({ lat, lng });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطأ في جلب الإحداثيات' });
    }
});

// مسار للحصول على مواقع الكواكب
app.post('/get-planets', async (req, res) => {
    const { lat, lng, date, time } = req.body;
    try {
        const response = await axios.post(`https://api.astronomyapi.com/api/v2/bodies/positions`, {
            latitude: lat,
            longitude: lng,
            from_date: date,
            to_date: date,
            time: time,
            elevation: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${ASTRONOMY_API_ID}:${ASTRONOMY_API_SECRET}`).toString('base64')}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'خطأ في جلب مواقع الكواكب' });
    }
});

// تحديد البورت في حالة العمل محلياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});