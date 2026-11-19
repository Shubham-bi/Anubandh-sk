# Anubandh - Leva Shubh Mangal Matrimonial PWA 💍

A modern, offline-first, mobile-friendly **Progressive Web Application (PWA)** built for exploring, filtering, managing, and analyzing matrimonial profiles for the **Leva Patidar (Leva Patil)** community.

---

## 🌟 Key Capabilities & Features

### 1. Dual Dataset Support
- **🌐 Online Portal Profiles (1,224)**: Rich, detailed profiles including horoscope (Kundali), astrological parameters, family tree, employment, and annual income.
- **📖 Melawa Booklet Profiles (84)**: Marathi community booklet profiles with structured contact persons, residence addresses, and clean phone numbers.
- **Direct 1-Click WhatsApp & Calling**: Instant `wa.me` links with pre-composed respectful Marathi introductory messages and `tel:` calling buttons for all 1, 2, or 3 contacts.

### 2. Matchmaking Pipeline (Kanban Board)
- **Track Profiles Through Stages**:
  1. 📥 *नवीन / विचारार्थ (New / Unreviewed)*
  2. ⭐ *शॉर्टलिस्ट केले (Shortlisted)*
  3. 👨‍👩‍👧‍👦 *कौटुंबिक चर्चा (Family Review)*
  4. 📞 *संपर्क झाला (Contacted)*
  5. 🤝 *प्रत्यक्ष भेट ठरली (Meeting Scheduled)*
  6. 💍 *जमले! (Engaged / Matched)* — Triggers celebratory confetti 🎉
  7. ❌ *वगळले (Pass / Not Interested)*
- **Call Log & Conversation History**: Record timestamped notes, conversation summaries, and contact person spoken with.
- **Candidate CRUD**: Form to Add new candidates or Edit existing booklet profiles with real-time IndexedDB synchronization.

### 3. Analytics Dashboard 📊
- Macro KPIs (Total candidates, Shortlist rate, Under review, Contacted, Engaged).
- Visual conversion funnel across matchmaking stages.
- Age demographics breakdown (20–23, 24–26, 27–29, 30–32, 33–35, 36+).
- Top 10 Gotras ranking (*विश्वामित्र, वशिष्ठ, भारद्वाज, काश्यप, अत्री, इ.*).
- Native location & district distributions (*जळगाव, बुलडाणा, पुणे, मुंबई, नाशिक, इ.*).
- Education & career classifications (Engineering/Tech, Medical/Pharma, Commerce/CA, Post-grad, Govt).
- Annual income tier distribution (< ₹3L, ₹3–6L, ₹6–10L, ₹10–15L, ₹15–25L, ₹25L+).

### 4. Family Sharing & A4 PDF Generator 👨‍👩‍👧
- **॥ श्री गणेशाय नमः ॥ कौटुंबिक चर्चा पत्रिका**:
  - Generates a beautifully formatted A4 printable summary sheet for a single candidate or a multi-candidate curated shortlist dossier.
  - Formatted `@media print` layout for saving crisp vector PDFs with zero browser UI clutter.
- **1-Click WhatsApp Family Share**: Formats complete Marathi biodata messages with bold headers, emojis, and phone links ready to post to family WhatsApp groups.

### 5. Advanced Search & Multi-Facet Filters
- Debounced full-text search across candidate name, gotra, mamkul, education, occupation, and native place in both Marathi and English.
- Gotra Include & Exclude filters (avoids sagotra matching).
- Age slider, annual income bracket selector, native district & city filters.
- Side-by-side comparison matrix (compare up to 4 profiles simultaneously).
- UTF-8 BOM CSV export and complete JSON backup/restore.

### 6. Offline-First PWA
- Powered by **Dexie.js IndexedDB** for 100% offline data availability.
- Service Worker precaching via `vite-plugin-pwa` and `workbox-window`.
- Responsive for mobile phones, tablets, and desktop displays with safe-area viewport support.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS + Lucide Icons + Canvas Confetti
- **Storage**: IndexedDB via Dexie.js (Schema versioned with reactive `useLiveQuery` hooks)
- **PWA**: `vite-plugin-pwa` with Workbox Service Worker caching
- **Quality**: Strict TypeScript checking (`tsc`) + ESLint 9

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- pnpm or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Shubham-bi/Anubandh-sk.git
cd Anubandh-sk

# Install dependencies
pnpm install
# or
npm install
```

### Development Server
```bash
# Start Vite dev server on local network
pnpm run dev --host
# or
npm run dev -- --host
```
Open `http://localhost:5173` or access on your mobile device via your local network IP (e.g. `http://192.168.x.x:5173`).

### Production Build
```bash
pnpm run build
# or
npm run build
```

---

## ☁️ Deploying to Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build` or `pnpm run build`.
4. Output Directory: `dist`.
5. Deploy!
