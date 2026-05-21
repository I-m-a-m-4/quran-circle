import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const AUTH_URL = process.env.QF_ENV === 'production'
  ? 'https://oauth2.quran.foundation'
  : 'https://prelive-oauth2.quran.foundation';

const BASE_URL = process.env.QF_ENV === 'production'
  ? 'https://apis.quran.foundation/content/api/v4'
  : 'https://apis-prelive.quran.foundation/content/api/v4';

async function getToken() {
  const clientId = process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${AUTH_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'content' }),
  });
  const data = await res.json();
  return data.access_token;
}

async function testTafsir() {
  try {
    const token = await getToken();
    console.log('Token obtained. Testing tafsir endpoints...\n');

    // Try different endpoint formats
    const endpoints = [
      `${BASE_URL}/tafsirs/169/by_ayah/2/255`,
      `${BASE_URL}/tafsirs/169/by_key/2:255`,
      `${BASE_URL}/verses/by_key/2:255?tafsirs=169&fields=text_uthmani`,
    ];

    for (const url of endpoints) {
      console.log(`Trying: ${url}`);
      const res = await fetch(url, {
        headers: { 'x-auth-token': token, 'x-client-id': process.env.QF_CLIENT_ID }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '\n---');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

testTafsir();
