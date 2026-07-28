import { departmentForIssue } from '../data/departments';

const ISSUE_TYPES = [
  'Road Damage',
  'Water Leakage',
  'Garbage Dump',
  'Street Light Issue',
  'Power Outage',
  'Health Hazard',
  'Sewage Overflow',
  'Illegal Parking',
];

// This project has no real vision model behind it, so we simulate one.
// We read the actual pixel data of the uploaded photo and turn its average
// hue/brightness into a deterministic pick, so the same photo always
// produces the same "AI" result instead of a fresh random guess every time.
function hashImageData(imageData) {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4 * 37) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
    count++;
  }
  const r = rSum / count, g = gSum / count, b = bSum / count;
  const brightness = (r + g + b) / 3;
  const hash = Math.floor(r * 31 + g * 17 + b * 7 + brightness);
  return { hash, r, g, b, brightness };
}

function analyzeFromCanvas(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        resolve(hashImageData(imageData));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Fallback used when pixel analysis is unavailable (e.g. HEIC / unreadable file):
// derive a deterministic hash straight from the file name + size instead.
function hashFromFileMeta(file) {
  const str = `${file.name}-${file.size}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return { hash, brightness: hash % 255 };
}

export async function classifyComplaintImage(file) {
  let signal;
  try {
    signal = await analyzeFromCanvas(file);
  } catch {
    signal = hashFromFileMeta(file);
  }

  const idx = signal.hash % ISSUE_TYPES.length;
  const issueType = ISSUE_TYPES[idx];
  const department = departmentForIssue(issueType);

  // Confidence: deterministic but feels organic, 84-98%.
  const confidence = 84 + (signal.hash % 15);

  return { issueType, department, confidence };
}
