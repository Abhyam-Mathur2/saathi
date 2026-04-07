const axios = require('axios');
require('dotenv').config();
const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
(async () => {
  try {
    const res = await axios.post(`${API}/auth/volunteer/register`, {
      name: 'Test Vol',
      email: 'testvol3@example.com',
      password: 'pass123',
      city: 'Chennai'
    });
    console.log('Register response:', res.data);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
})();
