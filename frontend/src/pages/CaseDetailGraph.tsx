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
        <div className="visual-flow">
          {data.prelevements.length === 0 && <div className="card">Aucun prélèvement</div>}
          {data.prelevements.map((p) => (
            <div key={p.id} className="visual-card card">
              <div className="visual-header">
                <div className="node node-prelevement" title={`Prélèvement ${p.id}`}>{p.id}</div>
              </div>
              <div className="blocks-row">
                {p.blocs.length === 0 ? (
                  <div className="muted">Aucun bloc</div>
                ) : (
                  p.blocs.map((b) => (
                    <div key={b.id} className="block-card">
                      <div className="block-title">Bloc {b.id}</div>
                      <div className="lames-row">
                        {b.lames.length === 0 ? (
                          <span className="muted" style={{ fontSize: 12 }}>Aucune lame</span>
                        ) : (
                          b.lames.map((l) => (
                            <div key={l.id} className="lame-card" title={`Lame ${l.id}`}>
                              <div className="lame-icon" aria-hidden />
                              <div className="lame-text">Lame : <strong>{l.id}</strong>  Couleur : <strong>{l.coloration}</strong></div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


