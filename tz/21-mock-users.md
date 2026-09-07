# Test foydalanuvchilari va rollar boʻyicha kirish huquqlari (Mock Data)

Ushbu hujjat tizimning 10 ta rolining har biri uchun autentifikatsiya qilishga moʻljallangan test foydalanuvchilar (Mock Data) roʻyxatini oʻz ichiga oladi.

## Test akkauntlar roʻyxati (10 ta rol)

| № | Rol kodi | Rol nomi (Oʻzbekcha) | JSHSHIR / STIR (Login) | Parol (Password) | F.I.SH (FIO) | Tashkilot / Lavozim | Boshlangʻich sahifa |
|---|---|---|---|---|---|---|---|
| 1 | `sys_admin` | **Tizim administrator** | `11111111111111` | `Admin123!` | Ergashov Sardor Anvarovich | "Oʻzmon texno" DUK / Bosh administrator | `admin_settings` |
| 2 | `central_admin` | **Markaziy apparat xodimi** | `22222222222222` | `Central123!` | Karimov Jamshid Botirovich | Oʻrmon xoʻjaligi agentligi / Boʻlim boshligʻi | `leskhoz_inbox` |
| 3 | `management` | **Rahbariyat** | `33333333333333` | `Director123!` | Tashpulatova Nodira Rustamovna | Agentlik Direktori oʻrinbosari | `manager_decision` |
| 4 | `executor_staff` | **Ijrochi tashkilot xodimi** | `44444444444444` | `Staff123!` | Rahimov Jasur Umidovich | Boʻstonliq DЎX / Katta mutaxassis | `leskhoz_inbox` |
| 5 | `gis_specialist` | **GIS / me'yoriy mutaxassis** | `55555555555555` | `Gis123!` | Yusupov Bobur Maratovich | Oʻrmon loyiha instituti / GIS mutaxassisi | `gis_editor` |
| 6 | `executor_head` | **Ijrochi tashkilot rahbari** | `66666666666666` | `Head123!` | Mirzayev Dilshod Akramovich | Boʻstonliq DЎX / Direktor | `manager_decision` |
| 7 | `inspector` | **Inspektor** | `77777777777777` | `Inspect123!` | Abdullayev Alisher Nabiyevich | Toshkent v. Boʻstonliq tumani / Tuman inspektori | `field_tasks` |
| 8 | `accountant` | **Buxgalter** | `88888888888888` | `Buhg123!` | Umarova Malika Saidovna | Moliya-hisob boʻlimi / Bosh buxgalter | `accountant_reconciliation` |
| 9 | `applicant` | **Jismoniy va yuridik shaxs (Ariza beruvchi)** | `30491823410019` | `User123!` | Saidov Otabek Shavkatovich | "Burchmulla Agro" MCHJ / Ariza beruvchi | `applicant_dashboard` |
| 10 | `prosecutor` | **Prokuror (Faqat oʻqish / Read-Only)** | `99999999999999` | `Prokuror123!` | Xalilov Utkir Xasanovich | Bosh Prokuratura / 11-tarmoq prokurori | `prosecutor_portal` |

---

## Kirish va tekshirish qoidalari

1. **Format:** Login sifatida JSHSHIR (14 xonali son) yoki STIR (9 xonali son) qabul qilinadi.
2. **Strict Matching:** Foydalanuvchi kiritgan `login` va `password` ushbu roʻyxatdagi ma'lumotlar bilan 100% mos kelishi shart.
3. **Xato kiritilganda:** Agar JSHSHIR/STIR mavjud boʻlmasa yoki parol xato kiritilsa:
   - Tizimga kirish rad etiladi.
   - Ekranda *"JSHSHIR/STIR yoki parol xato! Tizimga kirish rad etildi."* xabari chiqariladi.
   - Kabinetga yoʻnaltirish bajarilmaydi.
