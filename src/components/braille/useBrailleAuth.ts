/**
 * Anmelde-Status des Braille-Trainers (eigene Sitzung, getrennt von der
 * LMS-Anmeldung). Die Sitzung selbst verwaltet das Backend
 * (`brailleBackend()`): lokal über localStorage, auf dem Server über den – mit
 * „Tastenflow" GETEILTEN – PocketBase-authStore. Dieser Store spiegelt nur,
 * wer gerade angemeldet ist.
 */
import { create } from "zustand";
import { BrailleAccount, rememberClassCode } from "@/lib/braille";
import { brailleBackend } from "@/lib/braille/backend";

interface BrailleAuthState {
  account: BrailleAccount | null;
  /** Nach erfolgreichem Login/Registrieren aufrufen (Backend hat die Sitzung
   *  bereits gesetzt). Merkt zusätzlich den Klassencode fürs nächste Anmelden. */
  login: (a: BrailleAccount) => void;
  logout: () => void;
}

export const useBrailleAuth = create<BrailleAuthState>((set) => ({
  account: brailleBackend().currentAccount(),
  login: (a) => {
    // Klassencode fürs nächste Anmelden auf diesem Gerät merken.
    if (a.role === "schueler" && a.classCode) rememberClassCode(a.classCode);
    set({ account: a });
  },
  logout: () => {
    brailleBackend().logout();
    set({ account: null });
  },
}));
