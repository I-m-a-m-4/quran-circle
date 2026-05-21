async function testTafsirByKey() {
  try {
    const urls = [
      'https://api.quran.com/api/v4/tafsirs/169/by_key/2:255',
      'https://api.quran.com/api/v4/quran/tafsirs/169?verse_key=2:255',
    ];
    for (const url of urls) {
      console.log(`\nTrying: ${url}`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2).substring(0, 600) + '...');
      }
    }
  } catch (err) {
    console.error(err);
  }
}
testTafsirByKey();
