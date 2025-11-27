import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCases } from '../api/client';
import type { CaseEntity } from '../types';

export function CaseList() {
  const [cases, setCases] = useState<CaseEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCases();
        setCases(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((c) => c.id.toLowerCase().includes(q));
  }, [cases, query]);

  function countBlocs(c: CaseEntity): number {
    return c.prelevements.reduce((acc, p) => acc + p.blocs.length, 0);
  }
  function countLames(c: CaseEntity): number {
    return c.prelevements.reduce(
      (acc, p) => acc + p.blocs.reduce((bAcc, b) => bAcc + b.lames.length, 0),
      0,
    );
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <h2 className="heading-primary" style={{ margin: 0, marginRight: 'auto' }}>Liste des dossiers</h2>
        <input
          placeholder="Rechercher un dossier…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 240, height: 38 }}
        />
        <Link to="/create" className="btn btn-primary">+ Créer un dossier</Link>
      </div>

      {loading && <div className="muted">Chargement...</div>}
      {error && <div className="alert alert-error">Erreur: {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Aucun dossier</div>
          <div className="muted">Créez un dossier pour commencer ou modifiez la recherche.</div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid">
          {filtered.map((c) => {
            const blocs = countBlocs(c);
            const lames = countLames(c);
            return (
              <Link
                key={c.id}
                to={`/cases/${encodeURIComponent(c.id)}`}
                className="card card-hover"
                style={{ textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: 18 }}>{c.id}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className="chip">{c.prelevements.length} prélèvement(s)</span>
                  <span className="chip">{blocs} bloc(s)</span>
                  <span className="chip">{lames} lame(s)</span>
                </div>
                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>Cliquer pour voir le détail</div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}


