import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getAuthPage(@Res() res: Response) {
    const appUrl = process.env.FRONTEND_URL ?? '/index.html#/';

    return res.type('html').send(`<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quiz Auth</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at 20% 10%, rgba(168,85,247,0.22), transparent 40%), #020617;
      color: #e2e8f0;
    }
    .card {
      width: min(92vw, 480px);
      border: 1px solid rgba(148,163,184,0.2);
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(12px);
      padding: 26px;
      box-shadow: 0 20px 40px rgba(2, 6, 23, 0.6);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }
    p {
      margin: 0 0 20px;
      color: #94a3b8;
    }
    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }
    .tab {
      border: 1px solid rgba(148,163,184,0.25);
      border-radius: 12px;
      background: rgba(15,23,42,0.5);
      color: #cbd5e1;
      padding: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: 120ms ease;
    }
    .tab:hover {
      border-color: rgba(217,70,239,0.35);
      color: #f8fafc;
    }
    .tab.active {
      border-color: rgba(217,70,239,0.6);
      background: rgba(217,70,239,0.2);
      color: #f5d0fe;
    }
    .field {
      margin-bottom: 12px;
    }
    label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: #94a3b8;
    }
    input, select {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(148,163,184,0.3);
      background: rgba(2,6,23,0.7);
      color: #f8fafc;
      border-radius: 12px;
      padding: 10px 12px;
      outline: none;
    }
    input:focus, select:focus {
      border-color: rgba(56,189,248,0.8);
    }
    button.submit {
      width: 100%;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(90deg, #d946ef, #06b6d4);
      color: white;
      padding: 11px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 4px;
      transition: transform 120ms ease;
    }
    button.submit:hover {
      transform: translateY(-1px);
    }
    button.submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }
    .status {
      margin-top: 12px;
      border-radius: 12px;
      padding: 10px;
      font-size: 13px;
      white-space: pre-wrap;
    }
    .ok { background: rgba(16,185,129,0.15); color: #a7f3d0; }
    .err { background: rgba(244,63,94,0.15); color: #fecdd3; }
    .subnote { margin-top: 10px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Questly</h1>
    <p>Войди или зарегистрируйся, чтобы перейти к приложению Questly</p>

    <div class="tabs">
      <button class="tab active" id="loginTab" type="button">Вход</button>
      <button class="tab" id="registerTab" type="button">Регистрация</button>
    </div>

    <form id="authForm">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" required placeholder="you@example.com" />
      </div>
      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" type="password" minlength="6" required placeholder="Минимум 6 символов" />
      </div>
      <div class="field" id="roleWrap" style="display:none;">
        <label for="role">Роль</label>
        <select id="role">
          <option value="USER">USER</option>
          <option value="CREATOR">CREATOR</option>
        </select>
      </div>

      <button class="submit" id="submitBtn" type="submit">Войти</button>
    </form>

    <div id="status" class="status" style="display:none;"></div>
    <div class="subnote">После успеха откроется приложение.</div>
  </main>

  <script>
    const APP_URL = ${JSON.stringify(appUrl)};

    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const roleWrap = document.getElementById('roleWrap');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('authForm');
    const status = document.getElementById('status');

    let mode = 'login';

    function setMode(nextMode) {
      mode = nextMode;
      const isRegister = mode === 'register';

      loginTab.classList.toggle('active', !isRegister);
      registerTab.classList.toggle('active', isRegister);
      roleWrap.style.display = isRegister ? 'block' : 'none';
      submitBtn.textContent = isRegister ? 'Зарегистрироваться' : 'Войти';
      status.style.display = 'none';
    }

    loginTab.addEventListener('click', () => setMode('login'));
    registerTab.addEventListener('click', () => setMode('register'));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;

      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload = mode === 'register' ? { email, password, role } : { email, password };
      submitBtn.disabled = true;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка авторизации');
        }

        if (data.access_token) {
          localStorage.setItem('quiz_access_token', data.access_token);
        }

        status.className = 'status ok';
        status.style.display = 'block';
        status.textContent = 'Успешно! Перенаправляем в приложение...';
        window.setTimeout(() => {
          window.location.href = APP_URL;
        }, 550);
      } catch (error) {
        status.className = 'status err';
        status.style.display = 'block';
        status.textContent = 'Ошибка: ' + (error.message || 'Неизвестная ошибка');
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`);
  }
}
