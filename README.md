# Ruxsatnoma — Davlat Portali Landing Sahifasi

Oʻzbekiston Respublikasi Oʻrmon xoʻjaligi agentligining oʻrmon fondi yerlaridan foydalanish boʻyicha elektron ruxsatnomalar berish yagona davlat axborot portali bosh sahifasi (Landing Page).

## 🌲 Loyihaning asosiy boʻlimlari

- **Bosh sahifa (Landing)**:
  - Real-vaqt monitoringi va asosiy koʻrsatkichlar statistikasi
  - Ruxsatnomalar taqsimoti diagrammasi
  - Ruxsatnomani tezkor tekshirish (QR-kod va seriya raqami boʻyicha)
  - 6 ta asosiy foydalanish faoliyat turlari
  - Ariza topshirish bosqichlari (4 qadam)
  - Yangiliklar va eʼlonlar
  - Portal xizmati sifatini baholash
- **Xizmatlar (`/services`)**: Oʻrmon fondidan foydalanish yoʻnalishlari va muddatlari
- **Tariflar (`/tariffs`)**: BHM koeffitsiyentlari va avtomatlashtirilgan narx kalkulyatori
- **Hujjatlar (`/documents`)**: Oʻzbekiston Respublikasi qonunlari va normativ-huquqiy hujjatlar
- **Ochiq maʼlumotlar (`/opendata`)**: Anonimlashtirilgan davlat statistikasi va yuklab olish (CSV, JSON, API)
- **Savol-javob (`/faq`)**: Koʻp beriladigan savollar va toifalangan yoʻriqnomalar
- **Haqiqiylikni tekshirish (`/verify`)**: Berilgan elektron ruxsatnoma va E-IMZO QR-kodini tekshirish

## 🚀 Texnologiyalar

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS 4**
- **Lucide Icons**

## 🛠️ Oʻrnatish va ishga tushirish

```bash
# Bogʻliqliklarni oʻrnatish
npm install
# yoki
yarn

# Dasturchi rejimida ishga tushirish
npm run dev
# yoki
yarn dev

# Loyihani yigʻish (Build)
npm run build
```

## 🔧 Muhit oʻzgaruvchilari

`.env.example` faylidan nusxa oling (`.env`) va quyidagilarni toʻldiring:

- `VITE_API_BASE_URL` — backend manzili, oxirida `/` boʻlmasin. Masalan: `http://localhost:8000`
- `VITE_ADMIN_BASE_URL` — kabinet (adminka) manzili. Saytdagi barcha "Kirish" va "Ariza
  topshirish" havolalari shu manzilga oʻtadi — foydalanuvchi tizimga kirganmi yoki yoʻqmi,
  buni adminka oʻzi hal qiladi. Majburiy: qiymatsiz build muvaffaqiyatli oʻtadi, lekin
  sahifadagi hech bir havola hech qayerga olib bormaydi.

Ikkalasi ham Vite tomonidan BUILD vaqtida ichiga qadaladi (`import.meta.env`), shuning
uchun ishlab chiqarishga chiqarishdan oldin toʻgʻri qiymat bilan yigʻish kerak.
