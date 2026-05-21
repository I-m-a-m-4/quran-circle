async function testNuhTafsir() {
  try {
    const urls = [
      'https://api.quran.com/api/v4/tafsirs/169/by_ayah/71/4',
      'https://api.quran.com/api/v4/verses/by_key/71:4?tafsirs=169&fields=text_uthmani'
    ];
    for (const url of urls) {
      console.log(`\nTrying: ${url}`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2).substring(0, 1000));
    }
  } catch (err) {
    console.error(err);
  }
}
testNuhTafsir();
