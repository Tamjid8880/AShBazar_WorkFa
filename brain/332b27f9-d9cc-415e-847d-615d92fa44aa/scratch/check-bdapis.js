async function check() {
  try {
    const res = await fetch("https://bdapis.com/api/v1.1/divisions");
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
check();
