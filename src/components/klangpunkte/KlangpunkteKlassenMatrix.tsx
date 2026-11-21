/**
 * Klassen-Matrix Kind × Klangwelt für „Klangpunkte", gespeist aus dem geteilten
 * Lernwerkstatt-Fortschritt (lw_progress, program="klangpunkte").
 *
 * Sitzt seit 03.08. im Reiter „Klangpunkte" von „Meine Klassen" (MK-E5); Klasse
 * und Kinder werden dort zentral verwaltet, diese Ansicht ist rein lesend.
 * Der Spielstand kommt aus `klangBackend()`.
 *
 * Grundsatz [[feedback_data_transparency]]: Die Lehrkraft sieht die Lerndaten
 * der eigenen Klasse — nie mehr, als das Kind über sich selbst sieht (hier:
 * gemeisterte Kapitel, Sterne, zuletzt geübtes Kapitel).
 */
import { useEffect, useRef, useState } from "react";
import {
  AUFKLAPP_KNOPF_ZELLE,
  AUFKLAPP_ZEILE,
  AufklappHuelle,
  AufklappKnopf,
  aufklappGrund,
} from "@/components/lernwerkstatt/klasse/AufklappKnopf";
import type { BrailleAccount } from "@/lib/braille";
import { LwPupilMessageButton } from "@/components/lernwerkstatt/LwTeacherCompose";
import { klangBackend } from "@/lib/klangpunkte/backend";
import { totalStars, type KlangProgress } from "@/lib/klangpunkte/progress";
import { KAPITEL, KLANG_WELTEN, kapitelById } from "@/lib/klangpunkte/welten";
import { useKlangTexte } from "@/lib/klangpunkte/sprache";

/** Kennzahlen eines Kindes je Klangwelt. */
interface WeltStat {
  done: number;
  total: number;
  stars: number;
}

function weltStats(prog: KlangProgress): WeltStat[] {
  return KLANG_WELTEN.map((w) => {
    let done = 0;
    let stars = 0;
    for (const et of w.etappen) {
      const rec = prog.levels[et.id];
      if (rec?.completed) done += 1;
      stars += rec?.bestStars ?? 0;
    }
    return { done, total: w.etappen.length, stars };
  });
}

/** Eine Zeile der Matrix: Kennzahlen je Welt, aufklappbare Kapitel-Details. */
function PupilMatrixRow({ pupil, index }: { pupil: BrailleAccount; index: number }) {
  const t = useKlangTexte().uebersicht;
  const starText = t.matrixSterne;
  const [prog, setProg] = useState<KlangProgress | null>(null);
  const [open, setOpen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    klangBackend()
      .getProgress(pupil.id)
      .then((p) => {
        if (alive) setProg(p);
      });
    return () => {
      alive = false;
    };
  }, [pupil.id]);

  // Beim Aufklappen den Fokus in die Detail-Region legen (NVDA-Muster).
  useEffect(() => {
    if (open) detailRef.current?.focus();
  }, [open]);

  const nameCell = (
    <th scope="row" className="font-bold text-ink">
      <span className="inline-flex items-center gap-1.5">
        <span>{pupil.name}</span>
        <LwPupilMessageButton
          pupilId={pupil.id}
          pupilName={pupil.name}
          classCode={pupil.classCode ?? ""}
          iconOnly
        />
      </span>
    </th>
  );

  // ★ 20.10.2026 (Johannes: überall wie in Tastenflow): Pfeil links vor dem
  // Namen, die Kapitel öffnen sich als Zeile direkt unter dem Kind.
  const grund = aufklappGrund(index);
  const knopfZelle = (
    <td className={`${AUFKLAPP_KNOPF_ZELLE} ${grund}`}>
      <AufklappKnopf
        open={open}
        onToggle={() => setOpen((v) => !v)}
        controls={`kp-detail-${pupil.id}`}
        label={t.matrixAufklappLabel(pupil.name, open)}
        tipp={t.matrixAufklappTipp(pupil.name)}
      />
    </td>
  );

  if (!prog) {
    return (
      <tr className={`text-center ${grund}`}>
        {knopfZelle}
        {nameCell}
        <td colSpan={KLANG_WELTEN.length + 2} className="text-ink-muted">
          {t.matrixLaedt}
        </td>
      </tr>
    );
  }

  const stats = weltStats(prog);
  const doneTotal = stats.reduce((s, w) => s + w.done, 0);
  const starsTotal = totalStars(prog);
  const last = prog.lastPlace?.kapitelId ? kapitelById(prog.lastPlace.kapitelId) : null;

  return (
    <>
      {/* 10.09.2026, Johannes: alle Tabellenspalten mittig. Die Aufklapp-Zeile
          darunter bleibt linksbündig - sie ist Fließtext, keine Spalte. */}
      <tr className={`${AUFKLAPP_ZEILE} text-center ${grund}`}>
        {knopfZelle}
        {nameCell}
        {stats.map((w, i) => {
          const full = w.total > 0 && w.done === w.total;
          return (
            <td
              key={i}
              className={
                w.done === 0 ? "text-ink-muted" : full ? "rounded bg-success-soft text-ink" : "text-ink"
              }
            >
              <span aria-hidden="true">
                {w.done}/{w.total}
              </span>
              <span className="sr-only">
                {t.matrixWeltSr(KLANG_WELTEN[i].nr, KLANG_WELTEN[i].title, w.done, w.total, starText(w.stars))}
              </span>
            </td>
          );
        })}
        <td className="font-medium text-ink">
          <span aria-hidden="true">{doneTotal}/{KAPITEL.length}</span>
          <span className="sr-only">
            {t.matrixGesamtSr(doneTotal, KAPITEL.length, starText(starsTotal))}
          </span>
        </td>
        <td className="text-ink-muted">{last ? last.title : "-"}</td>
      </tr>
      {/* Sichtbar aufklappen (Johannes 19.09.2026: „der Rest rutscht nach
          unten und der andere kommt nach"): Die Zeile kommt als Hülle mit,
          der Kasten in der Zelle wächst - samt dem senkrechten Abstand, der
          darum von der Zelle in den Kasten gewandert ist. */}
      <AufklappHuelle offen={open} spalten={KLANG_WELTEN.length + 4} grund={grund} id={`kp-detail-${pupil.id}`}>
          <div
            ref={detailRef}
            tabIndex={-1}
            role="region"
            aria-label={t.matrixRegion(pupil.name)}
            className="outline-none focus-visible:ring-[4.5px] focus-visible:ring-accent"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {KLANG_WELTEN.map((w) => (
                <div key={w.key}>
                  <p className="m-0 text-sm font-semibold text-ink">
                    {t.matrixWeltTitel(w.nr, w.title)}
                  </p>
                  <ul className="m-0 mt-1 list-none space-y-0.5 p-0">
                    {w.etappen.map((et) => {
                      const rec = prog.levels[et.id];
                      const s = rec?.bestStars ?? 0;
                      return (
                        <li key={et.id} className="flex items-baseline justify-between gap-2 text-xs">
                          <span className="text-ink-muted">{et.title}</span>
                          <span className={rec?.completed ? "text-ink" : "text-ink-muted"}>
                            <span aria-hidden="true">
                              {rec?.completed ? "★".repeat(s) + "☆".repeat(Math.max(0, 3 - s)) : "-"}
                            </span>
                            <span className="sr-only">
                              {rec?.completed ? t.matrixGemeistert(starText(s)) : t.matrixNichtGemeistert}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
      </AufklappHuelle>
    </>
  );
}

/**
 * Die Klassen-Matrix Kind × Klangwelt — ohne Klassen-Auswahl, damit sie auch im
 * Reiter „Klangpunkte" von „Meine Klassen" (MK-E3) sitzen kann, wo die Klasse
 * schon oben gewählt wird.
 */
export function KlangpunkteKlassenMatrix({ pupils }: { pupils: BrailleAccount[] }) {
  const t = useKlangTexte().uebersicht;
  return (
    <div className="card overflow-x-auto p-4">
      <table className="w-full text-sm" aria-label={t.matrixTabelle}>
        <thead>
          <tr className="text-center text-ink-muted">
            <th scope="col" className={`py-2 ${AUFKLAPP_KNOPF_ZELLE}`}>
              <span className="sr-only">{t.matrixKapitelImEinzelnen}</span>
            </th>
            <th scope="col" className="py-2 pr-3">
              {t.matrixName}
            </th>
            {KLANG_WELTEN.map((w) => (
              <th key={w.key} scope="col" className="px-1 py-2">
                <abbr title={t.matrixWeltTitel(w.nr, w.title)} className="no-underline">
                  {t.matrixWeltKurz(w.nr)}
                </abbr>
                <span className="sr-only">
                  {t.matrixWeltSpalteSr(w.nr, w.title)}
                </span>
              </th>
            ))}
            <th scope="col" className="px-1 py-2">
              {t.matrixGesamt}
            </th>
            <th scope="col" className="px-1 py-2">
              {t.matrixZuletzt}
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:py-2 [&_td]:pr-2 [&_tr]:border-t [&_tr]:border-hairline/60">
          {pupils.map((p, i) => (
            <PupilMatrixRow key={p.id} pupil={p} index={i} />
          ))}
        </tbody>
      </table>
      <p className="m-0 mt-3 text-xs text-ink-muted">
        {t.matrixFuss}
      </p>
    </div>
  );
}
