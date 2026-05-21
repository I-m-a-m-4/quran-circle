async function getTafsirs() {
  const res = await fetch('https://api.quran.com/api/v4/resources/tafsirs');
  const data = await res.json();
  console.log(data.tafsirs.map(t => ({ id: t.id, name: t.name, language: t.language_name })));
}
getTafsirs();
