import type { AgentRole, Category, Platform } from "@virtual-office/shared";

export type Rng = () => number;

export const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!;
export const between = (min: number, max: number, rng: Rng): number => min + Math.floor(rng() * (max - min + 1));

const sources: Record<Category, string[]> = {
  AI: ["makalah riset", "laporan benchmark", "blog para peneliti"],
  IT: ["dokumentasi resmi", "diskusi forum developer", "laporan insiden"],
  IoT: ["datasheet perangkat", "studi kasus pabrik", "forum para maker"],
};

export const angles: Record<Category, string[]> = {
  AI: ["dampaknya bagi pekerjaan sehari-hari", "hal yang sering disalahpahami orang", "peluang untuk pemula", "risiko yang jarang dibahas"],
  IT: ["praktik terbaik yang bisa langsung dipakai", "kesalahan umum tim developer", "alat yang layak dicoba"],
  IoT: ["penerapannya di rumah dan industri", "tantangan keamanan perangkat", "hitungan biaya dan manfaat"],
};

type Template = (v: { topic: string; angle: string; sources: string; n: number }) => string;

const scoutPool: Template[] = [
  ({ topic }) => `Mencari kabar terbaru soal ${topic}…`,
  ({ n, sources }) => `Membandingkan ${n} sumber: ${sources}…`,
  ({ topic }) => `Mencatat fakta penting tentang ${topic}…`,
  () => `Memeriksa ulang angka dan klaim…`,
  ({ angle }) => `Memilih sudut pandang: ${angle}…`,
];
const scoutLast: Template = () => `Merangkum temuan untuk Karjo…`;

const quillPool: Template[] = [
  ({ topic }) => `Menyusun kerangka tulisan tentang ${topic}…`,
  () => `Menulis pembuka yang menarik…`,
  ({ angle }) => `Mengembangkan poin utama: ${angle}…`,
  () => `Menambahkan contoh nyata…`,
  () => `Memoles gaya bahasa…`,
];
const quillLast: Template = () => `Menyerahkan naskah ke Tejo…`;

/** Keeps the pool's order but drops random entries until `count - 1` remain, then appends the closing Step. */
function subsequence(pool: Template[], last: Template, count: number, rng: Rng): Template[] {
  const keep = [...pool];
  while (keep.length > count - 1) keep.splice(Math.floor(rng() * keep.length), 1);
  return [...keep, last];
}

/** The labelled Steps of Bambang's or Karjo's Task: 3 to 5, in Indonesian, from per-Category templates. */
export function stepLabels(role: Exclude<AgentRole, "herald">, topic: string, category: Category, angle: string, rng: Rng): string[] {
  const values = { topic, angle, sources: pick(sources[category], rng), n: between(6, 14, rng) };
  const templates =
    role === "scout"
      ? subsequence(scoutPool, scoutLast, between(3, 5, rng), rng)
      : subsequence(quillPool, quillLast, between(3, 5, rng), rng);
  return templates.map((t) => t(values));
}

export interface Draft {
  headline: string;
  points: string[];
  closing: string;
}

const pointPool: Record<Category, ((topic: string) => string)[]> = {
  AI: [
    (t) => `Banyak orang menganggap ${t} itu rumit, padahal dasarnya bisa dipahami dalam sepuluh menit.`,
    () => `Hasil yang bagus datang dari data dan evaluasi yang rapi, bukan sekadar model yang besar.`,
    () => `Selalu cek keluaran AI sebelum dipakai; kecepatan tidak menggantikan ketelitian.`,
    (t) => `Mulai dari satu kasus kecil di ${t}, lalu ukur manfaatnya sebelum diperluas.`,
  ],
  IT: [
    (t) => `Soal ${t}, keputusan sederhana di awal sering menghemat berminggu-minggu di belakang.`,
    () => `Otomatiskan hal yang berulang, tetapi tetap tulis alasan di balik setiap pilihan.`,
    () => `Kesalahan paling mahal biasanya bukan di kode, melainkan di asumsi yang tidak pernah dicek.`,
    (t) => `Catat apa yang berhasil dan gagal dari ${t} supaya tim berikutnya tidak mengulang.`,
  ],
  IoT: [
    (t) => `${t} paling terasa manfaatnya ketika datanya benar-benar dipakai untuk mengambil keputusan.`,
    () => `Pilih perangkat yang hemat daya dan mudah diperbarui; biaya perawatan sering lebih besar dari harga beli.`,
    () => `Amankan perangkat sejak awal: kata sandi bawaan adalah pintu masuk yang paling sering dimanfaatkan.`,
    (t) => `Uji di skala kecil dulu; ${t} sering berperilaku berbeda di lapangan.`,
  ],
};

const closings = [
  "Menurutku, mulai dari langkah kecil itu sudah cukup. Kamu setuju?",
  "Itu pandanganku. Kalau kamu punya pengalaman lain, ceritakan di komentar.",
  "Semoga membantu! Simpan kalau menurutmu berguna.",
];

/** Karjo's output: one piece of writing that Tejo later adapts to each Platform. */
export function writeDraft(topic: string, category: Category, angle: string, rng: Rng): Draft {
  const pool = [...pointPool[category]];
  const points: string[] = [];
  while (points.length < 3) points.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!(topic));
  return { headline: `${topic}: ${angle}`, points, closing: pick(closings, rng) };
}

const hashtags: Record<Category, string> = {
  AI: "#AI #KecerdasanBuatan #TeknologiIndonesia",
  IT: "#IT #Developer #TeknologiIndonesia",
  IoT: "#IoT #InternetOfThings #TeknologiIndonesia",
};

/** Tejo's output for one Platform: the Draft shaped the way that Platform likes it, in the Creator's voice. */
export function composePost(platform: Platform, draft: Draft, category: Category): string[] {
  const tags = hashtags[category];
  switch (platform) {
    case "X":
      return [
        `1/ ${draft.headline} 🧵`,
        ...draft.points.map((p, i) => `${i + 2}/ ${p}`),
        `${draft.points.length + 2}/ ${draft.closing} ${tags}`,
      ];
    case "LinkedIn":
      return [
        draft.headline,
        "Belakangan ini aku banyak memikirkan hal ini, dan ada beberapa catatan yang ingin kubagikan.",
        ...draft.points,
        `${draft.closing}\n\n${tags}`,
      ];
    case "Instagram":
      return [
        `Slide 1 — ${draft.headline}`,
        ...draft.points.map((p, i) => `Slide ${i + 2} — ${p}`),
        `Slide ${draft.points.length + 2} — ${draft.closing}\n${tags}`,
      ];
    case "TikTok":
      return [
        `[Hook, 0–3 dtk] "${draft.headline}" — tonton sampai habis!`,
        ...draft.points.map((p) => `[Isi] ${p}`),
        `[Penutup] ${draft.closing} ${tags}`,
      ];
  }
}
