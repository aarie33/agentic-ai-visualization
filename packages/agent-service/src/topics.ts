import type { Category } from "@virtual-office/shared";

/** Topics Autopilot picks from when nobody has queued one. */
export const dummyTopics: { topic: string; category: Category }[] = [
  { topic: "Agen AI yang bisa memakai komputer sendiri", category: "AI" },
  { topic: "Kenapa model bahasa kecil makin diminati", category: "AI" },
  { topic: "Mengevaluasi chatbot tanpa tebak-tebakan", category: "AI" },
  { topic: "AI generatif untuk membuat konten harian", category: "AI" },
  { topic: "Fine-tuning versus prompt engineering", category: "AI" },
  { topic: "Bahaya halusinasi pada asisten AI", category: "AI" },
  { topic: "Kubernetes untuk tim kecil", category: "IT" },
  { topic: "Keamanan siber dasar untuk developer", category: "IT" },
  { topic: "Kapan database NoSQL benar-benar berguna", category: "IT" },
  { topic: "Praktik terbaik desain API yang awet", category: "IT" },
  { topic: "Mengapa observability lebih dari sekadar log", category: "IT" },
  { topic: "Cloud murah: menekan tagihan tanpa mengorbankan performa", category: "IT" },
  { topic: "Sensor IoT untuk pertanian cerdas", category: "IoT" },
  { topic: "Rumah pintar dengan MQTT dan ESP32", category: "IoT" },
  { topic: "Edge computing untuk pabrik", category: "IoT" },
  { topic: "Keamanan perangkat IoT yang sering terlupa", category: "IoT" },
  { topic: "LoRa untuk memantau kualitas air", category: "IoT" },
  { topic: "Wearable dan data kesehatan sehari-hari", category: "IoT" },
];

/** Keywords per Category. When a Topic matches several, IoT wins over AI, and AI over IT. */
const keywords: [Category, string[]][] = [
  ["IoT", ["iot", "internet of things", "sensor", "rumah pintar", "smart home", "mqtt", "esp32", "arduino", "raspberry pi", "embedded", "wearable", "edge computing", "lora", "industri 4.0", "perangkat pintar"]],
  ["AI", ["ai", "kecerdasan buatan", "machine learning", "deep learning", "llm", "gpt", "chatbot", "neural", "model bahasa", "generatif", "prompt"]],
  ["IT", ["it", "software", "perangkat lunak", "cloud", "database", "basis data", "api", "devops", "kubernetes", "docker", "server", "keamanan siber", "cybersecurity", "jaringan", "pemrograman", "programming", "coding", "developer", "web", "linux", "frontend", "backend", "observability", "git", "aplikasi", "kode"]],
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matchers = keywords.map(([category, words]) => ({
  category,
  pattern: new RegExp(`(?<![a-z0-9])(?:${words.map(escape).join("|")})(?![a-z0-9])`, "i"),
}));

/** The Category a typed-in Topic belongs to, or null when it fits none. */
export function detectCategory(topic: string): Category | null {
  return matchers.find((m) => m.pattern.test(topic))?.category ?? null;
}
