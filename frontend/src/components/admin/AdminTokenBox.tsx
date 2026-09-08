'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'admin_token';

export function useAdminToken() {
  const [token, setTokenState] = useState<string>('');

  useEffect(() => {
    setTokenState(localStorage.getItem(STORAGE_KEY) ?? '');
  }, []);

  const setToken = (value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setTokenState(value);
  };

  return { token, setToken };
}

// Полноценного логина на фронте пока нет (отдельная задача из roadmap).
// Токен получаем вручную: POST /api/auth/login {email, password} → accessToken,
// вставляем сюда один раз, дальше он лежит в localStorage браузера.
export function AdminTokenBox({
  token,
  onChange,
}: {
  token: string;
  onChange: (token: string) => void;
}) {
  const [draft, setDraft] = useState(token);

  return (
    <div className="border rounded-lg p-4 bg-amber-50 mb-6 text-sm">
      <div className="font-medium mb-2">Access-токен администратора</div>
      <p className="text-gray-600 mb-3">
        Временная заглушка вместо полноценного логина на фронте. Получи токен через{' '}
        <code className="bg-white px-1 rounded">POST /api/auth/login</code> и вставь сюда —
        он сохранится в браузере.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="eyJhbGciOi..."
          className="border rounded px-3 py-2 flex-1 font-mono text-xs"
        />
        <button
          onClick={() => onChange(draft)}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Сохранить
        </button>
      </div>
      {token && <div className="text-green-700 mt-2">Токен сохранён в этом браузере.</div>}
    </div>
  );
}
