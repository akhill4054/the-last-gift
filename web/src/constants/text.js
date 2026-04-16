// web/src/constants/text.base.js
import LOCAL_TEXT from "../config/local.text.json"; // 🔥 static import

// Create a new file as - {root}/config/local.text.json
// to personalize messages.

const BASE_TEXT = {
  APP_TITLE: "the-last-gift ♥",

  INTRO_TITLE: "Ready for a small surprise?",
  INTRO_BUTTON: "Start",

  DATE_TITLE: "Pick a date",
  DATE_LABEL: "Date",
  NEXT_BUTTON: "Next",
  BACK_BUTTON: "Back",

  SLOT_TITLE: "Pick a time slot",
  SLOT_5PM: "5pm",
  SLOT_6PM: "6pm",
  SLOT_7PM: "7pm",
  SLOT_8PM: "8pm",
  CONFIRM_BUTTON: "Confirm",

  LOCKED_TITLE: "Locked",
  MANUAL_REFRESH: "Refresh 🕝",
  LOCATION_TITLE: "Location",
  LOCATION_HINT_TITLE: "Hint",
  OPEN_MAPS: "📍 Open in Google Maps",

  FALLBACK_SCHEDULED: "Scheduled time not available",
  FALLBACK_LOCATION: "Location details not available yet",

  REFRESHING: "Refreshing...",
};

export const TEXT = {
  ...LOCAL_TEXT,
  ...BASE_TEXT,
};
