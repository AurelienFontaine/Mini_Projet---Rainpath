import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCaseById, deleteCase } from '../api/client';
import type { CaseEntity } from '../types';

export function CaseDetailGraph() {
  const params = useParams();
  const caseId = params.id!;
  const [data, setData] = useState<CaseEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getCaseById(caseId);
        setData(res);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [caseId]);

  return (
    <section>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
        <Link className="link" to="/cases">← Retour à la liste</Link>
        {data && (
          <button
            className="btn btn-ghost"
            style={{ marginLeft: 'auto' }}
            onClick={async () => {
              if (!confirm(`Supprimer le dossier "${data.id}" ?`)) return;
              try {
                await deleteCase(data.id);
                navigate('/cases');
              } catch (e) {
                alert((e as Error).message);
              }
            }}
          >
            Supprimer le dossier
          </button>
        )}
      </div>
      <h2 className="heading-primary">Dossier: {caseId}</h2>
      {loading && <div className="muted">Chargement...</div>}
      {error && <div className="alert alert-error">Erreur: {error}</div>}
      {!loading && !error && data && (
        <div>
          {data.prelevements.length === 0 ? (
            <div className="card">Aucun prélèvement</div>
          ) : (
            <div className="grid">
              {data.prelevements.map((p) => (
                <div key={p.id} className="card">
                  <strong style={{ color: 'var(--primary-800)' }}>Prélèvement {p.id}</strong>
                  <div style={{ marginTop: 8 }}>
                    {p.blocs.length === 0 ? (
                      <div className="muted">Aucun bloc</div>
                    ) : (
                      p.blocs.map((b) => (
                        <div key={b.id} style={{ borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 8 }}>
                          <div style={{ marginBottom: 4, color: 'var(--primary-700)' }}>→ Bloc {b.id}</div>
                          {b.lames.length === 0 ? (
                            <div className="muted" style={{ marginLeft: 12 }}>Aucune lame</div>
                          ) : (
                            <ul className="list">
                              {b.lames.map((l) => (
                                <li key={l.id}>
                                  Lame {l.id} - <em className="muted">Couleur(s) : {l.coloration}</em>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}


