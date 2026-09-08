'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/account');
    } catch {
      setError('E-mail ou mot de passe incorrect');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <div className="flex justify-center mb-2">
        <Image src="/ghost-logo.png" alt="GhostMarket" width={140} height={140} priority />
      </div>
      <h1 className="text-2xl font-semibold text-white text-center mb-8">Connexion à GhostMarket</h1>
      <form onSubmit={handleSubmit} className="space-y-4 glass-card rounded-2xl p-6">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-gradient py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p className="text-sm text-white/40 mt-5 text-center">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-gradient font-medium">
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
