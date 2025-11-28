import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCase } from '../api/client';
import type { Bloc, Lame, Prelevement } from '../types';

type LameDraft = Lame & { validated?: boolean };
type BlocDraft = Omit<Bloc, 'lames'> & { lames: LameDraft[]; validated?: boolean };
type PrelevementDraft = Omit<Prelevement, 'blocs'> & { blocs: BlocDraft[]; validated?: boolean };

export function CaseCreate() {
  const navigate = useNavigate();
  const [caseId, setCaseId] = useState<string>('');
  const [prelevements, setPrelevements] = useState<PrelevementDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [caseNameValidated, setCaseNameValidated] = useState(false);
  const hasTypedCaseId = caseId.trim().length > 0;
  const canEditStructure = hasTypedCaseId && caseNameValidated;

  function addPrelevement(): void {
    if (!canEditStructure) return;
    setPrelevements((prev) => [...prev, { id: `P${prev.length + 1}`, blocs: [] }]);
  }
  function removePrelevement(index: number): void {
    setPrelevements((prev) => prev.filter((_, i) => i !== index));
  }
  function updatePrelevementId(index: number, id: string): void {
    setPrelevements((prev) => prev.map((p, i) => (i === index ? { ...p, id } : p)));
  }
  function addBloc(pIndex: number): void {
    if (!canEditStructure) return;
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex ? { ...p, blocs: [...p.blocs, { id: String.fromCharCode(65 + p.blocs.length), lames: [] }] } : p,
      ),
    );
  }
  function removeBloc(pIndex: number, bIndex: number): void {
    setPrelevements((prev) =>
      prev.map((p, i) => (i === pIndex ? { ...p, blocs: p.blocs.filter((_, j) => j !== bIndex) } : p)),
    );
  }
  function updateBlocId(pIndex: number, bIndex: number, id: string): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex ? { ...p, blocs: p.blocs.map((b, j) => (j === bIndex ? { ...b, id } : b)) } : p,
      ),
    );
  }
  function addLame(pIndex: number, bIndex: number): void {
    if (!canEditStructure) return;
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? {
              ...p,
              blocs: p.blocs.map((b, j) =>
                j === bIndex ? { ...b, lames: [...b.lames, { id: String(b.lames.length + 1), coloration: '' }] } : b,
              ),
            }
          : p,
      ),
    );
  }
  function removeLame(pIndex: number, bIndex: number, lIndex: number): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? {
              ...p,
              blocs: p.blocs.map((b, j) => (j === bIndex ? { ...b, lames: b.lames.filter((_, k) => k !== lIndex) } : b)),
            }
          : p,
      ),
    );
  }
  function updateLame(pIndex: number, bIndex: number, lIndex: number, field: 'id' | 'coloration', value: string): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? {
              ...p,
              blocs: p.blocs.map((b, j) =>
                j === bIndex
                  ? { ...b, lames: b.lames.map((l, k) => (k === lIndex ? { ...l, [field]: value } : l)) }
                  : b,
              ),
            }
          : p,
      ),
    );
  }

  // -- Helpers: validation & keyboard shortcuts --
  // Deprecated: kept for reference; no longer used for enabling prelevement
  function isBlocComplete(b: BlocDraft): boolean {
    if (!b.id || b.id.trim() === '') return false;
    if (b.lames.length === 0) return false;
    return b.lames.every((l) => l.id.trim() !== '' && l.coloration.trim() !== '');
  }

  function validateBloc(pIndex: number, bIndex: number): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? { ...p, blocs: p.blocs.map((b, j) => (j === bIndex ? { ...b, validated: true } : b)) }
          : p,
      ),
    );
  }

  // New: a prélèvement is considered complete when all required fields are filled
  // - p.id non vide
  // - au moins un bloc
  // - chaque bloc a un id non vide et au moins une lame
  // - chaque lame a id et coloration non vides
  function isPrelevementFieldsComplete(p: PrelevementDraft): boolean {
    if (!p.id || p.id.trim() === '') return false;
    if (p.blocs.length === 0) return false;
    return p.blocs.every((b) => {
      if (!b.id || b.id.trim() === '') return false;
      if (b.lames.length === 0) return false;
      return b.lames.every((l) => l.id.trim() !== '' && l.coloration.trim() !== '');
    });
  }

  function isPrelevementReady(p: PrelevementDraft): boolean {
    return !!p.id && p.id.trim().length > 0;
  }
  function validatePrelevement(pIndex: number): void {
    setPrelevements((prev) => prev.map((p, i) => (i === pIndex ? { ...p, validated: true } : p)));
  }
  function isLameComplete(l: LameDraft): boolean {
    return l.id.trim().length > 0 && l.coloration.trim().length > 0;
  }
  function validateLame(pIndex: number, bIndex: number, lIndex: number): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? {
              ...p,
              blocs: p.blocs.map((b, j) =>
                j === bIndex ? { ...b, lames: b.lames.map((l, k) => (k === lIndex ? { ...l, validated: true } : l)) } : b,
              ),
            }
          : p,
      ),
    );
  }

  // Unvalidate (edit again) actions
  function unvalidatePrelevement(pIndex: number): void {
    // Unvalidate the whole prélèvement and unlock all nested blocs/lames
    setPrelevements((prev) =>
      prev.map((p, i) => {
        if (i !== pIndex) return p;
        return {
          ...p,
          validated: false,
          blocs: p.blocs.map((b) => ({
            ...b,
            validated: false,
            lames: b.lames.map((l) => ({ ...l, validated: false })),
          })),
        };
      }),
    );
  }
  function unvalidateBloc(pIndex: number, bIndex: number): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex ? { ...p, blocs: p.blocs.map((b, j) => (j === bIndex ? { ...b, validated: false } : b)) } : p,
      ),
    );
  }
  function unvalidateLame(pIndex: number, bIndex: number, lIndex: number): void {
    setPrelevements((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? {
              ...p,
              blocs: p.blocs.map((b, j) =>
                j === bIndex
                  ? {
                      // invalider aussi le bloc parent pour permettre l'édition des champs
                      ...b,
                      validated: false,
                      lames: b.lames.map((l, k) => (k === lIndex ? { ...l, validated: false } : l)),
                    }
                  : b,
              ),
            }
          : p,
      ),
    );
  }

  // Require: all blocs validated and each bloc has all its lames validated (and at least one lame)
  function hasAllBlocsAndLamesValidated(p: PrelevementDraft): boolean {
    if (p.blocs.length === 0) return false;
    return p.blocs.every(
      (b) => b.validated && b.lames.length > 0 && b.lames.every((l) => l.validated),
    );
  }

  function hasValidatedPrelevement(): boolean {
    return prelevements.some((p) => p.validated);
  }

  function onCaseIdKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (hasTypedCaseId && !caseNameValidated) setCaseNameValidated(true);
    }
  }
  function onPrelevementIdKeyDown(pIndex: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBloc(pIndex);
    }
  }
  function onBlocIdKeyDown(pIndex: number, bIndex: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLame(pIndex, bIndex);
    }
  }
  function onLameFieldKeyDown(
    pIndex: number,
    bIndex: number,
    l: LameDraft,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (l.id.trim() && l.coloration.trim()) addLame(pIndex, bIndex);
    }
  }

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      if (!(hasTypedCaseId && caseNameValidated)) {
        throw new Error("Validez d'abord le nom du dossier");
      }
      // validation profonde: pas de champs vides
      for (const p of prelevements) {
        if (!p.id || p.id.trim().length === 0) {
          throw new Error('Un prélèvement a un identifiant vide');
        }
        for (const b of p.blocs) {
          if (!b.id || b.id.trim().length === 0) {
            throw new Error(`Un bloc de ${p.id} a un identifiant vide`);
          }
          for (const l of b.lames) {
            if (!l.id || l.id.trim().length === 0) {
              throw new Error(`Une lame du bloc ${b.id} est sans identifiant`);
            }
            if (!l.coloration || l.coloration.trim().length === 0) {
              throw new Error(`Une lame du bloc ${b.id} a une coloration vide`);
            }
          }
        }
      }
      const payload = {
        id: caseId.trim(),
        prelevements: prelevements.map((p) => ({
          id: p.id,
          blocs: p.blocs.map((b) => ({
            id: b.id,
            lames: b.lames.map((l) => ({ id: l.id, coloration: l.coloration })),
          })),
        })),
      };
      const created = await createCase(payload as any);
      setSuccess(`Dossier créé: ${created.id}`);
      setTimeout(() => navigate(`/cases/${encodeURIComponent(created.id)}`), 500);
    } catch (err) {
      const raw = (err as Error).message || '';
      let friendly = raw;
      if (/already exists/i.test(raw) || /HTTP 400/i.test(raw)) {
        friendly = "Ce nom de dossier existe déjà. Choisissez un autre nom unique.";
      }
      setError(friendly);
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDownForm(e: React.KeyboardEvent<HTMLFormElement>): void {
    if (e.key === 'Enter') {
      // Empêche la soumission par "Enter" sur les inputs
      e.preventDefault();
    }
  }

  return (
    <section>
      <h2 className="heading-primary">Créer un dossier</h2>
      <form onSubmit={onSubmit} onKeyDown={onKeyDownForm}>
        <div className="card" style={{ marginBottom: 16 }}>
          {caseNameValidated ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                marginBottom: 12,
                gap: 8,
              }}
            >
              <span style={{ visibility: 'hidden' }}>Modifier le nom</span>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 24 }}>{caseId}</div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setCaseNameValidated(false)}
                style={{ justifySelf: 'end' }}
              >
                Modifier le nom
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <label>
                Nom du dossier:{' '}
                <input
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  onKeyDown={onCaseIdKeyDown}
                  placeholder="CASE-001"
                  required
                  disabled={caseNameValidated}
                />
              </label>
              <span>
                {!caseNameValidated ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => hasTypedCaseId && setCaseNameValidated(true)}
                    disabled={!hasTypedCaseId}
                  >
                    Valider le nom
                  </button>
                ) : null}
              </span>
            </div>
          )}
          {/* helper alert removed per request */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prelevements.length === 0 && (
              <div className="card card-cta">
                <button className="btn btn-primary" type="button" onClick={addPrelevement} disabled={!canEditStructure}>
                  + Ajouter un prélèvement
                </button>
                {/* hint removed per request */}
              </div>
            )}
            {prelevements.map((p, pIndex) => (
              <div key={pIndex} className="card">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong>Prélèvement</strong>
                  <input
                    value={p.id}
                    onChange={(e) => updatePrelevementId(pIndex, e.target.value)}
                    onKeyDown={(e) => onPrelevementIdKeyDown(pIndex, e)}
                    disabled={!canEditStructure || p.validated}
                    required
                  />
                  <div style={{ marginLeft: 'auto' }} />
                  {!p.validated ? (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => validatePrelevement(pIndex)}
                      disabled={!isPrelevementFieldsComplete(p)}
                      title="Valider le prélèvement"
                    >
                      ✔
                    </button>
                  ) : null}
                  {p.validated && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => unvalidatePrelevement(pIndex)}
                      title="Modifier le prélèvement"
                    >
                      Modifier le prélèvement
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => removePrelevement(pIndex)}
                    disabled={!canEditStructure}
                    title="Supprimer le prélèvement"
                  >
                    ✖
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  {p.blocs.map((b, bIndex) => (
                    <div key={bIndex} className="section level1">
                      <div className="section-header">
                        <span className="section-title">Bloc</span>
                        <input
                          value={b.id}
                          onChange={(e) => updateBlocId(pIndex, bIndex, e.target.value)}
                          onKeyDown={(e) => onBlocIdKeyDown(pIndex, bIndex, e)}
                          disabled={!canEditStructure || p.validated}
                          required
                        />
                        {/* per-bloc validate removed */}
                        {!p.validated && (
                          <button className="btn btn-danger" type="button" onClick={() => removeBloc(pIndex, bIndex)} disabled={!canEditStructure || p.validated} title="Supprimer le bloc">
                            ✖
                          </button>
                        )}
                        <div style={{ marginLeft: 'auto' }} />
                      </div>
                      <div className="section level2">
                        {b.lames.map((l, lIndex) => (
                          <div key={lIndex} className="section-header" style={{ marginBottom: 6 }}>
                            <span className="section-title">Lame</span>
                            <input
                              value={l.id}
                              onChange={(e) => updateLame(pIndex, bIndex, lIndex, 'id', e.target.value)}
                              placeholder="id lame"
                              disabled={!canEditStructure || p.validated}
                              required
                              onKeyDown={(e) => onLameFieldKeyDown(pIndex, bIndex, l, e)}
                            />
                            <input
                              value={l.coloration}
                              onChange={(e) => updateLame(pIndex, bIndex, lIndex, 'coloration', e.target.value)}
                              placeholder="coloration"
                              disabled={!canEditStructure || p.validated}
                              required
                              onKeyDown={(e) => onLameFieldKeyDown(pIndex, bIndex, l, e)}
                            />
                            {/* per-lame validate removed */}
                            {!p.validated && (
                              <button className="btn btn-danger" type="button" onClick={() => removeLame(pIndex, bIndex, lIndex)} disabled={!canEditStructure || p.validated} title="Supprimer la lame">
                                ✖
                              </button>
                            )}
                          </div>
                        ))}
                        <button className="btn" type="button" onClick={() => addLame(pIndex, bIndex)} disabled={!canEditStructure || p.validated}>
                          + Ajouter une lame
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <button className="btn" type="button" onClick={() => addBloc(pIndex)} disabled={!canEditStructure || p.validated}>
                      + Ajouter un bloc
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {prelevements.length > 0 && (
              <div className="card card-cta">
                <button className="btn btn-primary" type="button" onClick={addPrelevement} disabled={!canEditStructure}>
                  + Ajouter un prélèvement
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            {hasValidatedPrelevement() && (
              <button className="btn btn-primary" type="submit" disabled={submitting || !canEditStructure}>
                {submitting ? 'Création...' : 'Créer'}
              </button>
            )}
            <Link className="btn btn-ghost" to="/cases" style={{ whiteSpace: 'nowrap' }}>
              Retour à la liste
            </Link>
            {/* tip removed per request */}
          </div>
        </div>
        {error && <span className="alert alert-error">{error}</span>}
        {success && <span className="alert alert-success">{success}</span>}
      </form>
    </section>
  );
}


