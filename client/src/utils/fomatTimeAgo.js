export default function formatTimeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const intervals = [
    { label: "year ago", secs: 31536000 },
    { label: "month ago", secs: 2592000 },
    { label: "days ago", secs: 86400 },
    { label: "hour ago", secs: 3600 },
    { label: "min ago", secs: 60 },
    { label: "sec ago", secs: 1 },
  ];
  for (let i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label}`;
  }
  return "just now";
}
