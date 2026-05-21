async function testAudio() {
  try {
    const res = await fetch('https://api.quran.com/api/v4/recitations/7/by_ayah/2:255', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (!res.ok) {
      console.log(`Failed: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testAudio();
