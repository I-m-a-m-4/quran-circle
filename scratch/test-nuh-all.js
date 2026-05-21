async function testNuhAll() {
  try {
    // Let's test the verses endpoint which is highly reliable since it parses verse_key directly
    const ids = [169, 168, 16, 91, 14, 15]; // English: 169 (Ibn Kathir), 168 (Ma'arif); Arabic: 16 (Muyassar), 91 (Sa'di)
    for (const id of ids) {
      const url = `https://api.quran.com/api/v4/verses/by_key/71:4?tafsirs=${id}&fields=text_uthmani`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`\nID ${id} status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        const tafsirs = data.verse?.tafsirs || [];
        console.log(`Tafsirs found: ${tafsirs.length}`);
        if (tafsirs.length > 0) {
          console.log(`Text snippet: ${tafsirs[0].text?.substring(0, 150)}...`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
testNuhAll();
