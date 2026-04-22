async function test(label, body) {
  const res = await fetch("http://localhost:3000/api/shipping/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(`\n[${label}]`);
  console.log(`  charge: ৳${data.charge}  source: ${data.source}  zone: ${data.zone}  method: ${data.method ?? "-"}`);
}

async function main() {
  // Core zone tests
  await test("No division (page load)", { country: "Bangladesh", district: "", division: "", subtotal: 500, weight: 0 });
  await test("Dhaka / no weight", { country: "Bangladesh", district: "Dhaka", division: "Dhaka", subtotal: 500, weight: 0 });
  await test("Dhaka / weight 6kg", { country: "Bangladesh", district: "Dhaka", division: "Dhaka", subtotal: 500, weight: 6 });
  await test("Chattogram / weight 3kg / subtotal 500", { country: "Bangladesh", district: "Chattogram", division: "Chattogram", subtotal: 500, weight: 3 });
  await test("Chattogram / weight 3kg / subtotal 1200", { country: "Bangladesh", district: "Chattogram", division: "Chattogram", subtotal: 1200, weight: 3 });
  await test("Chattogram / weight 15kg", { country: "Bangladesh", district: "Chattogram", division: "Chattogram", subtotal: 300, weight: 15 });
  await test("Sylhet / no zone (default fallback)", { country: "Bangladesh", district: "Sylhet", division: "Sylhet", subtotal: 200, weight: 1 });
}

main().catch(console.error);
