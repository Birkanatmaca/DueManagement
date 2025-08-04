// Sporcular (child) için API fonksiyonları

const API_URL = 'http://localhost:8080/admin';

// Çocukları listele
export async function listChildren(token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'child',
          type: 'listChildren',
        },
      },
    }),
  });
  return response.json();
}

// Çocuk ekle
export async function addChild(token, name, surname, birth_date) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'child',
          type: 'addChild',
          name,
          surname,
          birth_date,
        },
      },
    }),
  });
  return response.json();
}

// Çocuk güncelle
export async function updateChild(token, child_id, name, surname, birth_date) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'child',
          type: 'updateChild',
          child_id,
          name,
          surname,
          birth_date,
        },
      },
    }),
  });
  return response.json();
}

// Çocuk sil
export async function deleteChild(token, child_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'child',
          type: 'deleteChild',
          child_id,
        },
      },
    }),
  });
  return response.json();
}

// Çocuk-veli eşleştir (admin)
export async function matchChildToParentAdmin(token, child_id, parent_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'child',
          type: 'matchChildToParentAdmin',
          child_id,
          parent_id,
        },
      },
    }),
  });
  return response.json();
}

// Çocuk-veli eşleşmesini kaldır (admin)
export async function unmatchChildFromParentAdmin(token, child_id, parent_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'child',
          type: 'unmatchChildFromParentAdmin',
          child_id,
          parent_id,
        },
      },
    }),
  });
  return response.json();
}

// Veliler (parent) için API fonksiyonları

// Velileri listele
export async function listParents(token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'parent',
          type: 'listParents',
        },
      },
    }),
  });
  return response.json();
}

// Veli ekle
export async function addParent(token, name, last_name, email, phone, password) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'parent',
          type: 'addParent',
          name,
          last_name,
          email,
          phone,
          password,
        },
      },
    }),
  });
  return response.json();
}

// Veli güncelle
export async function updateParent(token, parent_id, name, last_name, email, phone, password) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'parent',
          type: 'updateParent',
          parent_id,
          name,
          last_name,
          email,
          phone,
          password,
        },
      },
    }),
  });
  return response.json();
}

// Veli sil
export async function deleteParent(token, parent_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'parent',
          type: 'deleteParent',
          parent_id,
        },
      },
    }),
  });
  return response.json();
}

// Veli detayları (eşleşmiş çocuklar dahil)
export async function getParentDetails(token, parent_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'parent',
          type: 'getParentDetails',
          parent_id,
        },
      },
    }),
  });
  return response.json();
}

// Aidat (Dues) işlemleri için API fonksiyonları

// Aidatları listele
export async function listDues(token, month, year) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'due',
          type: 'listDues',
          month,
          year,
        },
      },
    }),
  });
  return response.json();
}

// Aidat ekle
export async function addDue(token, child_id, month, year, amount, due_date) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'due',
          type: 'addDue',
          child_id,
          month,
          year,
          amount,
          due_date,
        },
      },
    }),
  });
  return response.json();
}

// Aidat güncelle
export async function updateDue(token, due_id, amount, is_paid) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'due',
          type: 'updateDue',
          due_id,
          amount,
          is_paid,
        },
      },
    }),
  });
  return response.json();
}

// Aidat sil
export async function deleteDue(token, due_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'due',
          type: 'deleteDue',
          due_id,
        },
      },
    }),
  });
  return response.json();
}

// Aidat detayını getir
export async function getDue(token, due_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'due',
          type: 'getDue',
          due_id,
        },
      },
    }),
  });
  return response.json();
}

// Bekleyen veliler için API fonksiyonları

// Bekleyen velileri listele
export async function listPendingUsers(token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'user_management',
          action: 'list_pending_users',
          email_verified_only: 'true'
        },
      },
    }),
  });
  return response.json();
}

// Bekleyen veli detaylarını getir
export async function getPendingUserDetails(token, user_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'user_management',
          action: 'get_pending_user_details',
          user_id
        },
      },
    }),
  });
  return response.json();
}

// Veliyi onayla
export async function approveUser(token, user_id) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'user_management',
          action: 'approve_user',
          user_id
        },
      },
    }),
  });
  return response.json();
}

// Veliyi reddet
export async function rejectUser(token, user_id, rejection_reason) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        request: {
          token,
          category: 'user_management',
          action: 'reject_user',
          user_id,
          rejection_reason
        },
      },
    }),
  });
  return response.json();
}
