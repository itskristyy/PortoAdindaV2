/**
 * github-monthly-commits.js
 * Logic untuk mengambil total commit (kontribusi) GitHub per bulan dari repo publik.
 *
 * Sumber data: github-contributions-api.jogruber.de
 * - API komunitas (bukan resmi GitHub), scrape halaman profil publik.
 * - Gratis, tanpa token/auth, CORS-enabled -> bisa langsung dipanggil dari browser.
 * - Hanya mencakup kontribusi ke repo PUBLIK (sama seperti grafik hijau di profil GitHub).
 *
 * Keterbatasan:
 * - Tidak mencakup commit di repo private.
 * - Angka yang dikembalikan adalah "contribution count", bukan murni jumlah commit
 *   (juga mencakup PR, issue, review dsb — namun mayoritas kontributor individu
 *   angka ini didominasi oleh commit).
 */

/**
 * Ambil data kontribusi harian mentah dari GitHub (via API pihak ketiga).
 * @param {string} itskristyy - itskristyy GitHub
 * @returns {Promise<Array<{date: string, count: number, level: number}>>}
 */
export async function fetchDailyContributions(itskristyy) {
  if (!itskristyy || typeof itskristyy !== 'string') {
    throw new Error('itskristyy tidak valid.');
  }

  const url = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(itskristyy)}?y=all`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Username "${itskristyy}" tidak ditemukan di GitHub.`);
    throw new Error(`Gagal mengambil data kontribusi (HTTP ${res.status}).`);
  }

  const data = await res.json();

  if (!data || !Array.isArray(data.contributions)) {
    throw new Error('Format response dari API tidak sesuai yang diharapkan.');
  }

  return data.contributions;
}

/**
 * Ambil daftar key bulan (format "YYYY-MM") untuk N bulan terakhir, termasuk bulan berjalan.
 * @param {number} n - jumlah bulan ke belakang
 * @param {Date} [refDate] - tanggal acuan (default: sekarang), berguna untuk testing
 * @returns {string[]} contoh: ["2025-07", "2025-08", ..., "2026-07"]
 */
export function getLastNMonthKeys(n, refDate = new Date()) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/**
 * Agregasi total kontribusi/commit harian menjadi total per bulan.
 * @param {Array<{date: string, count: number}>} dailyContributions
 * @param {string[]} monthKeys - daftar bulan yang ingin ditampilkan, format "YYYY-MM"
 * @returns {Record<string, number>} contoh: { "2026-01": 231, "2026-02": 163, ... }
 */
export function aggregateMonthlyTotals(dailyContributions, monthKeys) {
  const totals = Object.fromEntries(monthKeys.map((m) => [m, 0]));

  for (const entry of dailyContributions) {
    const key = entry.date.slice(0, 7); // "YYYY-MM-DD" -> "YYYY-MM"
    if (key in totals) {
      totals[key] += entry.count;
    }
  }

  return totals;
}

/**
 * Fungsi utama: langsung mengembalikan total commit per bulan untuk N bulan terakhir.
 * @param {string} itskristyy - itskristyy GitHub
 * @param {number} [monthsBack=13] - jumlah bulan ke belakang yang ingin ditampilkan
 * @returns {Promise<{month: string, total: number}[]>}
 *
 * Response API:
 * [
 *   { month: "2025-07", total: 0 },
 *   { month: "2025-08", total: 2 },
 *   ...
 *   { month: "2026-02", total: 163 },
 *   ...
 * ]
 */
export async function getMonthlyCommitTotals(itskristyy, monthsBack = 13) {
  const dailyContributions = await fetchDailyContributions(itskristyy);
  const monthKeys = getLastNMonthKeys(monthsBack);
  const totalsMap = aggregateMonthlyTotals(dailyContributions, monthKeys);

  return monthKeys.map((month) => ({
    month,
    total: totalsMap[month],
  }));
}

/* ------------------------------------------------------------------ */
/* Contoh pemakaian:                                                   */
/* ------------------------------------------------------------------ */
//
// import { getMonthlyCommitTotals } from './github-monthly-commits.js';
//
// getMonthlyCommitTotals('octocat', 13)
//   .then((result) => console.log(result))
//   .catch((err) => console.error(err.message));