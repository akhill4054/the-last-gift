// utils/specialDates.js
import config from "../config/local.config.json";

export function getTodaySpecial() {
  const now = new Date();

  const todayDM = `${String(now.getDate()).padStart(2, "0")}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const entries = Object.values(config.SPECIAL_DATES || {});

  for (const value of entries) {
    if (value.date === todayDM) {
      return value;
    }
  }

  return null;
}

export function getMessage(entry) {
  if (!entry) return null;

  let title = "";

  switch (entry.type) {
    case "birthday":
      title = `Happy Birthday, ${entry.name}! 🎉`;
      break;
    case "anniversary":
      title = `Happy Anniversary ✨\n${entry.name} ❤️`;
      break;
    case "engagement":
      title = `Engaged Today ✨\n${entry.name} 💍`;
      break;
    default:
      return null;
  }

  return {
    title,
    sub: entry.message_hi || entry.message || ""
  };
}

export function parseDM(dateStr) {
  const [dd, mm] = dateStr.split("-").map(Number);
  return { dd, mm };
}

export function formatWithYear(dateStr) {
  const { dd, mm } = parseDM(dateStr);
  const year = new Date().getFullYear();

  const d = String(dd).padStart(2, "0");
  const m = String(mm).padStart(2, "0");

  return `${d}-${m}-${year}`;
}

export function isPast(dateStr) {
  const { dd, mm } = parseDM(dateStr);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(now.getFullYear(), mm - 1, dd);

  return target < today;
}
