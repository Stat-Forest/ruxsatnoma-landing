# Ruxsatnoma — Landing Page API Hujjati

Ushbu hujjat **Landing sahifasi (ruxsatnoma-landing)** va **Ommaviy portal** integratsiyasi uchun mo'ljallangan barcha API endpointlarining to'liq spetsifikatsiyasini o'z ichiga oladi.

---

## Umumiy Ma'lumotlar

* **Asosiy API URL:** `https://dev-api.ruxsatnoma-urmon.uz/api/v1` (Lokal: `http://localhost:8000/api/v1`)
* **Protokol:** HTTPS / HTTP (RESTful JSON)
* **Autentifikatsiya:** Quyida keltirilgan Landing endpointlarining barchasi **anonim** (avtorizatsiya talab qilmaydi).
* **Xavfsizlik & Rate Limiting:** Har bir endpoint IP-manzil bo'yicha cheklangan (Token Bucket). Haddan tashqari ko'p so'rov yuborilganda `429 Too Many Requests` (`ERR-SYS-006`) qaytadi.
* **CORS:** Frontend domenlari (`localhost:5173`, `dev.ruxsatnoma-urmon.uz` va h.k.) uchun ruxsat berilgan.
* **Standart xatolik formati:**
  Barcha `4xx` va `5xx` xatoliklar yagona standart formatda qaytadi:
  ```json
  {
    "error": {
      "code": "ERR-VAL-001",
      "message": "Ошибка валидации входных данных",
      "details": {
        "errors": [
          {
            "loc": ["body", "applicant_name"],
            "msg": "Field required",
            "type": "missing"
          }
        ]
      },
      "correlation_id": "c1f207b9-1234-4567-89ab-cdef01234567"
    }
  }
  ```

---

## 1. Ruxsatnomani Tekshirish (QR-kod yoki Seriya/Raqam)

Landing sahifasidagi *"Ruxsatnomani tekshirish"* formasi yoki mobil qurilma orqali ruxsatnomadagi QR-kod skaner qilinganda ishlatiladi.

* **URL:** `GET /public/permits/check`
* **Autentifikatsiya:** Yo'q (Ochiq)
* **Rate Limit:** Alohida bucketlar: `public_check:qr` (kattaroq limit) va `public_check:manual` (torroq limit).

### Frontend nima jo'natadi (Request)
Query parametrlar orqali quyidagi ikki usuldan biri uzatiladi:

**Usul A — QR-kod orqali:**
* `qr` (string, max 64 belgi): QR-kod ichida bo'lgan maxfiy token.
  * *Misol:* `GET /api/v1/public/permits/check?qr=q7X9kLmN2pQ4rS6tU8vW0xY`

**Usul B — Qog'oz nusxadagi seriya va raqam orqali:**
* `series` (string, max 4 belgi): Ruxsatnoma seriyasi (Kirillcha bosh harf, masalan: `А`).
* `number` (integer, >= 1): Ruxsatnoma raqami (masalan: `10042`).
  * *Misol:* `GET /api/v1/public/permits/check?series=А&number=10042`

### Backend nima qabul qiladi va tekshiradi
1. Agar `qr` ham, `series` + `number` ham berilmagan bo'lsa → `422 Unprocessable Entity` (`ERR-VAL-001`).
2. Agar ruxsatnoma topilmasa yoki hali faol holatga kirmagan bo'lsa, xakerlar seriya raqamlarini ketma-ket qidirib chiqmasligi (enumeration oracle) uchun **404 emas, doimo 200 OK va `found: false`** qaytaradi.
3. Shaxsiy ma'lumotlar (JSHSHIR, to'liq pasport) ommaga berilmaydi, arizachining ismi qisman niqoblanadi (`holder`).

### Backend nima qaytaradi (Response)

#### A) Muvaffaqiyatli topilganda (`200 OK`):
```json
{
  "found": true,
  "status": "active",
  "status_label": {
    "uz_latn": "Amalda",
    "uz_cyrl": "Амалда",
    "ru": "Действует",
    "en": "Active"
  },
  "valid_from": "2026-05-01",
  "valid_to": "2026-11-01",
  "organization": "Burchmulla davlat o'rmon xo'jaligi",
  "activity_type": "Chorva mollarini boqish",
  "signatures_valid": true,
  "holder": "A*** V***"
}
```
*Maydonlar tavsifi:*
* `found` (boolean): Doimo `true`.
* `status` (string): Ruxsatnoma statusi (`active`, `suspended`, `revoked`, `expired`).
* `status_label` (object): Statusning ko'p tilli nomlari.
* `valid_from` / `valid_to` (string, YYYY-MM-DD): Amal qilish muddati.
* `organization` (string): Mas'ul davlat o'rmon xo'jaligi nomi.
* `activity_type` (string): Foydalanish faoliyati turi.
* `signatures_valid` (boolean): Barcha 3+1 ERI raqamli imzolarining haqiqiyligi.
* `holder` (string): Ruxsatnoma egasining niqoblangan F.I.Sh/nomi.

#### B) Topilmaganda (`200 OK`):
```json
{
  "found": false
}
```

---

## 2. Onlayn Kalkulyator (Taxminiy To'lovni Hisoblash)

Landing sahifasida fuqarolar arizani topshirishdan oldin qancha to'lov to'lashlarini taxminiy hisoblab ko'rishlari uchun yengil kalkulyator.

---

### 2.1. Faoliyat turlari ro'yxatini olish

Kalkulyatordagi birinchi dropdown (select) uchun.

* **URL:** `GET /public/refs/activity-types`
* **Autentifikatsiya:** Yo'q (Ochiq)

#### Request:
Parametrlar yo'q.

#### Response (`200 OK`):
```json
[
  {
    "id": "019183ab-1234-7000-8000-000000000001",
    "code": "grazing",
    "name": {
      "uz_latn": "Chorva mollarini o'tlatish (boqish)",
      "uz_cyrl": "Чорва молларини ўтлатиш (боқиш)",
      "ru": "Выпас скота"
    }
  },
  {
    "id": "019183ab-1234-7000-8000-000000000002",
    "code": "haymaking",
    "name": {
      "uz_latn": "Pichan o'rish",
      "uz_cyrl": "Пичан ўриш",
      "ru": "Сенокошение"
    }
  },
  {
    "id": "019183ab-1234-7000-8000-000000000003",
    "code": "beekeeping",
    "name": {
      "uz_latn": "Asalari uyalarini joylashtirish",
      "uz_cyrl": "Асалари уяларини жойлаштириш",
      "ru": "Размещение пасек"
    }
  }
]
```
> **Muhim frontend mantiqi:** Agar tanlangan faoliyatning `code == "grazing"` bo'lsa, chorva turlari bo'yicha bosh sonini kiritish bloki ochiladi. Agar boshqa kod bo'lsa, umumiy miqdor (`quantity`: gektar, tonna va b.) kiritiladi.

---

### 2.2. Chorva turlari ro'yxatini olish

Agar foydalanuvchi "Chorva mollarini o'tlatish" (`grazing`) faoliyatini tanlasa, chorva turlari ro'yxati olinadi.

* **URL:** `GET /public/refs/livestock-types`
* **Autentifikatsiya:** Yo'q (Ochiq)

#### Request:
Parametrlar yo'q.

#### Response (`200 OK`):
```json
[
  {
    "id": "019183cd-5678-7000-8000-000000000010",
    "code": "cattle_adult",
    "name": {
      "uz_latn": "Qoramol (katta yoshdagi)",
      "uz_cyrl": "Қорамол (катта ёшдаги)",
      "ru": "Крупный рогатый скот (взрослый)"
    }
  },
  {
    "id": "019183cd-5678-7000-8000-000000000011",
    "code": "sheep_goat",
    "name": {
      "uz_latn": "Qo'y va echkilar",
      "uz_cyrl": "Қўй ва эчкилар",
      "ru": "Овцы и козы"
    }
  },
  {
    "id": "019183cd-5678-7000-8000-000000000012",
    "code": "horses",
    "name": {
      "uz_latn": "Otlar",
      "uz_cyrl": "Отлар",
      "ru": "Лошади"
    }
  }
]
```

---

### 2.3. Taxminiy to'lov miqdorini hisoblash (Estimate)

* **URL:** `POST /public/calculations/estimate`
* **Autentifikatsiya:** Yo'q (Ochiq)
* **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "activity_type_id": "019183ab-1234-7000-8000-000000000001",
  "period_from": "2026-05-01",
  "period_to": "2026-08-01",
  "quantity": null,
  "items": [
    {
      "livestock_type_id": "019183cd-5678-7000-8000-000000000010",
      "head_count": 25
    },
    {
      "livestock_type_id": "019183cd-5678-7000-8000-000000000011",
      "head_count": 100
    }
  ]
}
```
*Agar faoliyat chorvachilik bo'lmasa (masalan, pichan o'rish bo'lsa):*
```json
{
  "activity_type_id": "019183ab-1234-7000-8000-000000000002",
  "period_from": "2026-06-01",
  "period_to": "2026-07-01",
  "quantity": 10.5,
  "items": []
}
```

#### Backend nima tekshiradi:
* `period_to >= period_from` ekanligi.
* Berilgan sanada amalda bo'lgan VMQ 278 stavkalari va BHM (bazaviy hisoblash miqdori) koeffitsientlari.
* Kontur belgilanmagani sababli topologik cheklovlar chetlab o'tiladi va `approximate=true` belgisi qo'yiladi.

#### Response (`200 OK`):
```json
{
  "approximate": true,
  "disclaimer": "Approximate estimate only — not a binding calculation...",
  "checks_skipped": ["norm", "season", "rotation", "fire_ban", "limit"],
  "activity_type_id": "019183ab-1234-7000-8000-000000000001",
  "period_from": "2026-05-01",
  "period_to": "2026-08-01",
  "quantity": null,
  "items": [
    {
      "livestock_type_id": "019183cd-5678-7000-8000-000000000010",
      "head_count": 25
    },
    {
      "livestock_type_id": "019183cd-5678-7000-8000-000000000011",
      "head_count": 100
    }
  ],
  "amount": "4500000.00",
  "used_sb": "35.00",
  "rule_code_version": "norms-1.0.0",
  "breakdown": {
    "days": 92,
    "bhm": "375000",
    "rates": {
      "large_adult": "0.05",
      "small_adult": "0.01"
    }
  }
}
```
*Maydonlar tavsifi:*
* `amount` (string decimal): Hisoblangan taxminiy to'lov summasi (so'mda).
* `used_sb` (string decimal | null): Shartli mollar bosh soni (uslovnaya golova).
* `approximate` (boolean): Doimo `true` (yakuniy hisob-kitob emasligi haqida ogohlantirish uchun).

---

## 3. Fuqarolar Murojaatlari (Appeals)

Fuqarolarga ro'yxatdan o'tmasdan turib Agentlikka savol, ariza yoki shikoyat yuborish va uning javobini bilish imkonini beradi.

---

### 3.1. Yangi murojaat yuborish

* **URL:** `POST /public/appeals`
* **Autentifikatsiya:** Yo'q (Ochiq)
* **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "applicant_name": "Javohir Toshmatov",
  "contact": {
    "phone": "+998901234567",
    "email": "javohir@example.com"
  },
  "subject": "Zomin davlat o'rmon xo'jaligida pichan o'rish ruxsatnomasi bo'yicha",
  "body": "Assalomu alaykum. 15-kontur bo'yicha pichan o'rish mavsumi qachon boshlanishini bilmoqchi edim..."
}
```
*Cheklovlar:*
* `applicant_name`: 1 dan 255 belgigacha.
* `contact`: `phone` yoki `email` dan kamida biri bo'lishi **shart**.
* `subject`: 1 dan 255 belgigacha.
* `body`: 1 dan 5000 belgigacha.

#### Response (`201 Created`):
```json
{
  "number": "MR-2026-000042"
}
```
> Ushbu qaytgan `number` foydalanuvchiga ko'rsatiladi. Keyinchalik murojaat holatini tekshirishda bu raqam kerak bo'ladi.

---

### 3.2. Murojaat holati va javobini tekshirish

* **URL:** `GET /public/appeals/check`
* **Autentifikatsiya:** Yo'q (Ochiq)

#### Request Query parametrlari:
* `number` (string, required): Murojaat raqami (masalan: `MR-2026-000042`).
* `phone` (string, optional): Murojaat qoldirganda kiritilgan telefon raqami.
* `email` (string, optional): Murojaat qoldirganda kiritilgan email manzili.
  *(Xavfsizlik talabi: `number` bilan birga `phone` yoki `email` to'g'ri kiritilishi kerak).*

*Misol:*
`GET /api/v1/public/appeals/check?number=MR-2026-000042&phone=%2B998901234567`

#### Response (`200 OK`):

**A) Murojaat topilganda:**
```json
{
  "found": true,
  "status": "answered",
  "subject": "Zomin davlat o'rmon xo'jaligida pichan o'rish ruxsatnomasi bo'yicha",
  "answer_text": "Murojaatingiz ko'rib chiqildi. 15-konturda mavsum 20-iyundan ochiladi.",
  "answered_at": "2026-05-12T14:30:00Z"
}
```
*Status qiymatlari:*
* `new` — Qabul qilindi, ko'rib chiqish kutilmoqda.
* `in_progress` — Mas'ul xodim tomonidan ko'rib chiqilmoqda.
* `answered` — Rasmiy javob berildi (`answer_text` mavjud bo'ladi).
* `closed` — Yopildi.

**B) Topilmaganda yoki telefon/email mos kelmaganda:**
```json
{
  "found": false,
  "status": null,
  "subject": null,
  "answer_text": null,
  "answered_at": null
}
```

---

## 4. Ko'p Beriladigan Savollar (FAQ)

Landingning "Savol-Javoblar" bo'limini dinamik to'ldirish uchun.

* **URL:** `GET /help/faq`
* **Autentifikatsiya:** Yo'q (Ochiq)

### Request:
* Query: `category` (optional, string) — Ma'lum kategoriya bo'yicha filtrlash (masalan: `permits`, `payments`, `general`).

### Response (`200 OK`):
```json
[
  {
    "id": "019183ee-0001-7000-8000-000000000001",
    "category": "permits",
    "sort_order": 1,
    "status": "published",
    "question": {
      "uz_latn": "Ruxsatnoma olish uchun qanday hujjatlar kerak?",
      "uz_cyrl": "Рухсатнома олиш учун қандай ҳужжатлар керак?",
      "ru": "Какие документы нужны для получения разрешения?"
    },
    "answer": {
      "uz_latn": "Arizachi OneID orqali ro'yxatdan o'tadi va E-IMZO yordamida arizani tasdiqlaydi...",
      "uz_cyrl": "Аризачи OneID орқали рўйхатдан ўтади ва Э-ИМЗО ёрдамида аризани тасдиқлайди...",
      "ru": "Заявитель авторизуется через OneID и подтверждает заявку с помощью ЭЦП..."
    }
  }
]
```

---

## 5. Ochiq Ma'lumotlar va Interaktiv Xarita (Open Data)

Landingning bosh sahifasidagi ko'rsatkichlar (hisoblagichlar) va o'rmon fondi xaritasi vidjeti uchun.

---

### 5.1. Umumiy statistika hisoblagichlari

* **URL:** `GET /public/open-data/stats`
* **Autentifikatsiya:** Yo'q (Ochiq)

#### Response (`200 OK`):
```json
{
  "k_anonymity_threshold": 3,
  "total_active_permits": 1420,
  "total_active_area_ha": "34500.5000",
  "by_region": [
    {
      "region_id": "019183aa-0001-7000-8000-000000000001",
      "region_name": {
        "uz_latn": "Toshkent viloyati",
        "ru": "Ташкентская область"
      },
      "active_permits_count": 312,
      "active_area_ha": "8500.0000"
    },
    {
      "region_id": "019183aa-0002-7000-8000-000000000002",
      "region_name": {
        "uz_latn": "Jizzax viloyati",
        "ru": "Джизакская область"
      },
      "active_permits_count": 240,
      "active_area_ha": "6200.2000"
    }
  ],
  "by_organization": [
    {
      "organization_id": "019183bb-0001-7000-8000-000000000001",
      "organization_name": {
        "uz_latn": "Burchmulla davlat o'rmon xo'jaligi",
        "ru": "Бурчмуллинский лесхоз"
      },
      "region_id": "019183aa-0001-7000-8000-000000000001",
      "region_name": {
        "uz_latn": "Toshkent viloyati",
        "ru": "Ташкентская область"
      },
      "active_permits_count": 145,
      "active_area_ha": "4200.0000"
    }
  ]
}
```

---

### 5.2. Ochiq GIS qatlamlari ro'yxati

* **URL:** `GET /public/open-data/layers`

#### Response (`200 OK`):
```json
[
  {
    "code": "forest_fund",
    "name": {
      "uz_latn": "Davlat o'rmon fondi chegaralari",
      "ru": "Границы государственного лесного фонда"
    },
    "geometry_type": "MULTIPOLYGON"
  },
  {
    "code": "pastures",
    "name": {
      "uz_latn": "Yaylov yerlari",
      "ru": "Пастбищные угодья"
    },
    "geometry_type": "MULTIPOLYGON"
  }
]
```

---

### 5.3. Xarita ob'ektlari geometriyasi (GeoJSON)

Xaritada o'rmon fondi hududlarini chizish uchun:
* **URL:** `GET /public/open-data/layers/{code}/features`
* *Misol:* `GET /api/v1/public/open-data/layers/forest_fund/features`

#### Response (`200 OK`):
Standart **GeoJSON FeatureCollection**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "019183ee-1234-7000-8000-000000000001",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[69.1234, 41.5678], [69.2345, 41.6789], [69.1234, 41.5678]]]]
      },
      "properties": {
        "name": "Burchmulla o'rmon fondi",
        "code": "forest_fund"
      }
    }
  ]
}
```

---

## 6. Kirish / Avtorizatsiya Havolalari

Landing sahifasidagi **"Shaxsiy kabinetga kirish"** tugmalari uchun:

1. **OneID OAuth2 kirish:**
   * Frontend havolasi: `window.location.href = "https://dev-api.ruxsatnoma-urmon.uz/api/v1/auth/oneid/authorize"`
   * Foydalanuvchi OneID sahifasiga o'tadi va tasdiqlangach, `admin_base_url` dagi kabinetga sessiya cookie bilan yo'naltiriladi.

2. **E-IMZO orqali kirish:**
   * Challenge olish: `POST /auth/eimzo/challenge` → `{"challenge": "...", "expires_in": 300}`
   * E-IMZO browser plagini orqali challenge imzolangach:
     `POST /auth/eimzo/login`
     *Body:* `{"signed_challenge": "PKCS7_BASE64_STRING"}`
     *Response:* Session cookie o'rnatiladi va `{"user": {...}}` qaytadi.
