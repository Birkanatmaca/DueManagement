const API_BASE = 'http://localhost:8080';

export async function backendRegister(name, last_name, email, phone, password) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          request: { name, last_name, email, phone, password }
        }
      })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

export async function backendLogin(emailOrPhone, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          request: {
            phone: emailOrPhone,
            password
          }
        }
      })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

export async function backendVerifyCode(email, code) {
  try {
    const response = await fetch(`${API_BASE}/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          request: { email, code }
        }
      })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

export async function backendResendCode(email) {
  try {
    const response = await fetch(`${API_BASE}/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          request: { email }
        }
      })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

// Only use new endpoints for password reset
export async function backendRequestPasswordReset(email, phone, new_password, repeat_password) {
  try {
    const response = await fetch(`${API_BASE}/request-password-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          request: { email, phone, new_password, repeat_password }
        }
      })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

export async function backendVerifyPasswordReset(email, phone, code) {
  try {
    const response = await fetch(`${API_BASE}/confirm-password-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          request: { email, phone, code }
        }
      })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Sunucuya bağlanılamadı.' };
  }
}


