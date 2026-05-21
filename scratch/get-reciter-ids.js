async function getRecitations() {
  const res = await fetch('https://api.quran.com/api/v4/resources/recitations');
  const data = await res.json();
  console.log(data.recitations.slice(0, 20).map(r => ({ id: r.id, name: r.reciter_name, style: r.style })));
}
getRecitations();
