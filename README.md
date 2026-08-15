# 📚 کتابخانه حسین | Hossein's Reading Library

اپلیکیشن وب کودکانه و حرفه‌ای برای ثبت تاریخچه کتاب‌هایی که حسین هر هفته از کتابخانه امانت می‌گیرد.

## ✨ امکانات

- ثبت کتاب‌های هفتگی با عنوان، نویسنده، تاریخ، یادداشت، وضعیت خواندن
- امتیاز ستاره‌ای (۱ تا ۵)
- برچسب‌گذاری (داستان، علمی، شعر، تصویری و ...)
- آپلود عکس جلد یا عکس حسین در حال خواندن (فشرده‌سازی خودکار)
- داشبورد زیبا با آمار
- فیلتر و جستجو
- گالری عکس‌ها
- تم کاملاً کودکانه، رنگارنگ و Mobile-First
- آماده دیپلوی روی Vercel + Neon PostgreSQL

## 🚀 راه‌اندازی سریع

### ۱. نصب

```bash
cd hossein-library
npm install
```

### ۲. تنظیم دیتابیس (Neon رایگان)

1. برو به https://neon.tech و یک پروژه رایگان بساز
2. Connection String را کپی کن
3. فایل `.env` بساز:

```bash
cp .env.example .env
```

محتوای `.env`:

```env
DATABASE_URL="postgresql://..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
AUTH_SECRET="یک-رشته-بلند-تصادفی"
FAMILY_PASSWORD="hossein1403"
```

### ۳. ساخت جداول

```bash
npx prisma db push
```

### ۴. اجرا

```bash
npm run dev
```

برو به http://localhost:3000

## ☁️ دیپلوی روی Vercel

1. پروژه را روی GitHub پوش کن
2. در Vercel Import کن
3. Environment Variables را اضافه کن
4. Deploy!

## 🔐 ورود

رمز پیش‌فرض: `hossein1403`  
صفحه ورود: `/login` (اختیاری)

## 🛠 تکنولوژی‌ها

- Next.js 15 + TypeScript + Tailwind CSS 4
- Prisma + PostgreSQL (Neon)
- Cloudinary
- Framer Motion + Lucide Icons
- Vazirmatn Font (فارسی)

ساخته شده با ❤️ برای حسین
