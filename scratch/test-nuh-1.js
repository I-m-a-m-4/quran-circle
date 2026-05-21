async function testNuh1() {
  try {
    const urls = [
      'https://api.quran.com/api/v4/quran/tafsirs/169?verse_key=71:1',
      'https://api.quran.com/api/v4/quran/tafsirs/168?verse_key=71:1'
    ];
    for (const url of urls) {
      console.log(`\nTrying: ${url}`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      console.log(`Tafsirs found: ${data.tafsirs?.length}`);
      if (data.tafsirs?.length > 0) {
        console.log(`Snippet: ${data.tafsirs[0].text?.substring(0, 200)}...`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
testNuh1();
