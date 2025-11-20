# ⚡ Быстрый деплой на Render

## 🎯 За 5 минут

### 1️⃣ Сгенерируйте секрет

```bash
openssl rand -base64 32
```

Скопируйте результат.

---

### 2️⃣ Загрузите код в Git

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

### 3️⃣ Создайте Web Service на Render

1. Зайдите на [render.com](https://render.com)
2. **New +** → **Web Service**
3. Подключите ваш репозиторий
4. Настройки:
   - **Runtime:** Docker
   - **Region:** Frankfurt
   - **Plan:** Free

---

### 4️⃣ Добавьте переменные окружения

```bash
DATABASE_URL=postgresql://root:80gnIBVDbbfCXEUEPLo0PKDtNyKsMQhB@dpg-d4fgn615pdvs73ag1upg-a/friendly_reminder

NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=<ваш_сгенерированный_секрет>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=drz2002@yandex.ru
SMTP_PASSWORD=<ваш_gmail_app_password>
SMTP_FROM=noreply@friendly-reminder.com

MEGA_EMAIL=drz2002@yandex.ru
MEGA_PASSWORD=grigory2002

NODE_ENV=production
RUN_SEED=true  # Автоматически создаст тестовые аккаунты
```

⚠️ **Важно:** Замените:
- `your-app-name` на имя вашего сервиса
- `<ваш_сгенерированный_секрет>` на результат из шага 1
- `<ваш_gmail_app_password>` на App Password от Gmail

---

### 5️⃣ Деплой

Нажмите **"Create Web Service"** и ждите 5-10 минут.

---

## ✅ Проверка

Откройте: `https://your-app-name.onrender.com/api/health`

Должно вернуть:
```json
{"status": "ok"}
```

---

## 🔑 Тестовые аккаунты

После первого деплоя доступны:

- **Admin:** admin@example.com / admin123
- **Teacher:** teacher@example.com / teacher123
- **Student:** student@example.com / student123

---

## 🔄 После первого деплоя

Измените переменную окружения:
```bash
RUN_SEED=false
```

---

## 📧 Gmail App Password

1. Google Account → Security → 2-Step Verification
2. App passwords → Mail → Other (Custom name)
3. Скопируйте пароль → используйте в `SMTP_PASSWORD`

---

## 🐛 Проблемы?

Смотрите полную инструкцию: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)

---

## 🎉 Готово!

Приложение доступно по адресу:
```
https://your-app-name.onrender.com
```
