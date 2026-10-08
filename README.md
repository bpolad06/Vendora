# Vendora

Azərbaycan satıcıları üçün marketplace və biznes idarəetmə demosu.

## Başlatmaq

Node.js 18+ ilə:

```sh
npm install
npm run dev
```

Ünvan: http://localhost:3000

## Ayrı bölmələr

- `/`: açıq marketplace, məhsul kataloqu, axtarış, kateqoriyalar, qiymət üzrə sıralama, məhsul və mağaza səhifələri.
- `/buyer`: alıcı hesabı və yalnız həmin alıcının sifarişləri.
- `/seller`: satıcının dashboard-u, öz məhsulları, sifarişləri və mağaza profili.
- `/admin`: platformanın dashboard-u, bütün məhsullar, sifarişlər, satıcı təsdiqi və istifadəçi siyahısı.
- `/login` və `/signup`: giriş və alıcı/satıcı qeydiyyatı. Admin qeydiyyatı açıq deyil.
- `/cart` və `/checkout`: miqdar, topdan qiymət, satıcı üzrə çatdırılma və nağd ödənişli demo sifariş.

## Demo hesabları

Hamısı üçün şifrə: `Vendora123!`

| Rol    | E-poçt            |
| ------ | ----------------- |
| Admin  | admin@vendora.az  |
| Satıcı | seller@vendora.az |
| Alıcı  | buyer@vendora.az  |

Giriş səhifəsində rol düyməsi demo məlumatlarını doldurur.

## Məhsullar və sifarişlər

Satıcı yeni məhsul yarada, qiymət/stok və topdan qiymət pillələrini dəyişə, şəkil üçün HTTPS ünvanı daxil edə və ya 5 MB-a qədər şəkil yükləyə bilər. Yüklənən şəkil 900 px ölçüyə qədər kiçildilib JPEG kimi saxlanılır. Yeni məhsul əvvəlcə qaralama olur; Aktiv düyməsi ilə marketplace-də görünür.

Kataloqda yerli nümunə şəkillər var. Bunlar demo məhsullarının real fotosu deyil. Satıcı öz məhsulunun şəklini yükləyə bilər. Mənbələr: `public/products/SOURCES.md`.

Qonağın səbəti alıcı hesabına daxil olduqda həmin hesaba köçürülür. Sifariş hər satıcı üçün ayrılır; stok və inventar jurnalı birlikdə yenilənir. Statuslar irəli dəyişdirilir. Ləğv stok miqdarını qaytarır; təkrar ləğv əlavə stok yaratmır. Dashboard rəqəmləri və qrafiklər məlumatlardan hesablanır.

Biznes məlumatları eyni origin-də açılmış pəncərələr arasında BroadcastChannel ilə sinxronlaşır. Funksiyalar göndərilmir və alınmış yeniləmə yenidən yayımlanmır.

## Demo məhdudiyyəti

Bu layihə frontend demosudur: backend, real ödəniş və serverdə autentifikasiya yoxdur. Hesablar, şifrə hash-ləri, məhsullar və sifarişlər localStorage-da saxlanılır. Şifrələr PBKDF2/SHA-256 ilə fərdi salt istifadə edərək hash olunur. Rol yönləndirmələri istifadəçi interfeysi üçündür; server təhlükəsizliyi təmin etmir. Brauzer məlumatlarının silinməsi demo məlumatlarını silir. İstehsal istifadəsi üçün server autentifikasiyası, serverdə rol yoxlaması, verilənlər bazası və serverdə atomik stok əməliyyatları əlavə edilməlidir.

## Yoxlama

```sh
npm run build
npm run lint
```

`scripts/verify.mjs` ayrı, müvəqqəti Chrome sessiyasında signup/login, rollar, guest səbəti, checkout, stok, sifariş statusu, şəkil yükləmə, publish, pəncərə sinxronizasiyası və mobil görünüşü yoxlayır. Test üçün Playwright və Chrome tələb olunur.

```sh
node scripts/verify.mjs
```

Playwright başqa qovluqdadırsa `VENDORA_TEST_MODULES`, Chrome yolu fərqlidirsə `VENDORA_CHROME_PATH` dəyişənini təyin edin. Vite serveri əvvəlcədən işləməlidir. Görünüş şəkilləri `qa/` qovluğunda saxlanılır.
