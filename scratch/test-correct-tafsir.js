async function testCorrectTafsir() {
  try {
    const ids = [169, 168]; // English Tafsir IDs
    for (const id of ids) {
      const url = `https://api.quran.com/api/v4/quran/tafsirs/${id}?verse_key=71:4`;
      console.log(`\nTrying: ${url}`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2).substring(0, 1000));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
testCorrectTafsir();
