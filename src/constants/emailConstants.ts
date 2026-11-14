export const SUPPORT_EMAIL = "challenge@seedmoney.org";
export const SUPPORT_SUBJECT = "SeedMoney Challenge — support request";
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  SUPPORT_SUBJECT,
)}`;

// Set in sessionStorage after a bulk send so Sent history can show "Email sent!"
export const EMAIL_SENT_FLAG = "seedmoney-admin-email-sent";
