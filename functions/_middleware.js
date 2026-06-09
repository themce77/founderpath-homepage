const PASSWORD = 'founderpathwidelab123!';
const COOKIE_NAME = 'fp_auth';
const COOKIE_VALUE = 'ok_2026';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Founderpath — Protected Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #f5f5f7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .logo {
      font-size: 18px;
      font-weight: 700;
      color: #111;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #111;
      margin-bottom: 8px;
    }
    p {
      font-size: 14px;
      color: #666;
      margin-bottom: 28px;
      line-height: 1.5;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #444;
      margin-bottom: 6px;
    }
    input[type="password"] {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 100px;
      font-size: 14px;
      outline: none;
      margin-bottom: 16px;
      transition: border-color 0.15s;
    }
    input[type="password"]:focus { border-color: #443dd8; }
    button {
      width: 100%;
      padding: 11px;
      background: #443dd8;
      color: #fff;
      border: none;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #3832b8; }
    .error {
      font-size: 13px;
      color: #d32f2f;
      margin-bottom: 12px;
      display: none;
    }
    .error.visible { display: block; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Founderpath</div>
    <h1>Protected preview</h1>
    <p>Enter the password to access this page.</p>
    <form method="POST" action="/__auth">
      <label for="pw">Password</label>
      <p class="error SHOWERROR">Incorrect password — try again.</p>
      <input type="password" id="pw" name="password" autofocus placeholder="••••••••••••" />
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Handle auth form submission
  if (url.pathname === '/__auth' && request.method === 'POST') {
    const formData = await request.formData();
    const pw = formData.get('password');

    if (pw === PASSWORD) {
      const redirectTo = url.searchParams.get('next') || '/';
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectTo,
          'Set-Cookie': `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        },
      });
    }

    // Wrong password — show form with error
    const html = LOGIN_HTML.replace('display: none;', 'display: block;').replace('SHOWERROR', 'visible');
    return new Response(html, {
      status: 401,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  // Check cookie
  const cookie = request.headers.get('Cookie') || '';
  const authenticated = cookie.split(';').some(c => c.trim() === `${COOKIE_NAME}=${COOKIE_VALUE}`);

  if (authenticated) {
    return next();
  }

  // Show login form
  const html = LOGIN_HTML.replace('SHOWERROR', '');
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
