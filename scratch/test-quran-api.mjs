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

async function testApi() {
  const clientId = process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;

  console.log(`Testing with Client ID: ${clientId}`);
  console.log(`Auth URL: ${AUTH_URL}`);
  console.log(`Base URL: ${BASE_URL}`);

  if (!clientId || !clientSecret) {
    console.error('Missing credentials');
    return;
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    console.log('Fetching token...');
    const response = await fetch(`${AUTH_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'content',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token fetch failed: ${response.status} ${response.statusText}`);
      console.error(errorText);
      return;
    }

    const data = await response.json();
    console.log('Token received successfully!');
    const token = data.access_token;

    console.log('Fetching verse 2:255...');
    const verseResponse = await fetch(`${BASE_URL}/verses/by_key/2:255?translations=131&fields=text_uthmani`, {
      headers: {
        'x-auth-token': token,
        'x-client-id': clientId,
      },
    });

    if (!verseResponse.ok) {
      const errorText = await verseResponse.text();
      console.error(`Verse fetch failed: ${verseResponse.status} ${verseResponse.statusText}`);
      console.error(errorText);
      return;
    }

    const verseData = await verseResponse.json();
    console.log('Verse data received:');
    console.log(JSON.stringify(verseData.verse, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testApi();
