const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function toJson(response) {
  const data = await response.json();
  return data;
}

export async function getStatus() {
  const url = new URL(`${BASE_URL}/api/status`);
  const res = await fetch(url.toString(), { method: "GET" });
  return await toJson(res);
}

export async function bookSlot(scheduledAt) {
  const url = new URL(`${BASE_URL}/api/book-slot`);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schedule_at: scheduledAt }),
  });

  return await toJson(res);
}

export async function resetSlot() {
  const url = new URL(`${BASE_URL}/api/reset-slot`);
  const res = await fetch(url.toString(), { method: "POST" });
  return await toJson(res);
}

