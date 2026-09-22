/**
 * Centralized Application Draft Manager for Vidya-Vrtti
 * Provides robust helpers to inspect, resume, restore, and clear auto-saved application drafts.
 */

export interface ApplicationDraft {
  storageKey: string;
  schemeId: string;
  schemeName?: string;
  schemeCode?: string;
  editAppId?: string;
  currentStep: number;
  maxStepReached: number;
  completedSteps: number[];
  personal?: any;
  address?: any;
  academic?: any;
  schemeSpecific?: any;
  bank?: any;
  documents?: any[];
  savedAt: string;
}

export const STEP_NAMES: Record<number, string> = {
  1: 'Personal Details',
  2: 'Address & Domicile',
  3: 'Academic Details',
  4: 'Scheme Specific Info',
  5: 'Bank Details',
  6: 'Mandatory Documents',
  7: 'Review & Submit'
};

const SCHEME_NAME_MAP: Record<string, { name: string; code: string }> = {
  'sch-nfst-01': {
    name: 'National Fellowship for Higher Education of ST Students',
    code: 'NFST'
  },
  'sch-nos-02': {
    name: 'National Overseas Scholarship for ST Candidates',
    code: 'NOS'
  },
  'sch-tces-03': {
    name: 'Top Class Education Scheme for ST Students',
    code: 'TCES'
  }
};

export const draftManager = {
  /**
   * Generates the storage key for a user and scheme
   */
  getStorageKey(userId?: string, schemeId?: string, editAppId?: string): string {
    return `vidya_vrtti_draft_${userId || 'guest'}_${schemeId || 'default'}${editAppId ? `_${editAppId}` : ''}`;
  },

  /**
   * Fetches a specific draft for a user and scheme
   */
  getDraft(userId?: string, schemeId?: string): ApplicationDraft | null {
    if (!schemeId) return null;
    try {
      const primaryKey = this.getStorageKey(userId, schemeId);
      let raw = localStorage.getItem(primaryKey);
      let foundKey = primaryKey;

      // Fallback to guest key if not found under logged in user id
      if (!raw && userId && userId !== 'guest') {
        const guestKey = this.getStorageKey('guest', schemeId);
        raw = localStorage.getItem(guestKey);
        if (raw) foundKey = guestKey;
      }

      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const schemeMeta = SCHEME_NAME_MAP[schemeId] || { name: 'ST Scholarship Scheme', code: 'SCHEME' };

      return {
        storageKey: foundKey,
        schemeId: parsed.schemeId || schemeId,
        schemeName: parsed.schemeName || schemeMeta.name,
        schemeCode: parsed.schemeCode || schemeMeta.code,
        currentStep: parsed.currentStep || 1,
        maxStepReached: parsed.maxStepReached || parsed.currentStep || 1,
        completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [],
        personal: parsed.personal,
        address: parsed.address,
        academic: parsed.academic,
        schemeSpecific: parsed.schemeSpecific,
        bank: parsed.bank,
        documents: parsed.documents,
        savedAt: parsed.savedAt || new Date().toISOString()
      };
    } catch (e) {
      console.warn('Error reading draft from localStorage:', e);
      return null;
    }
  },

  /**
   * Lists all active drafts for the current user (or guest)
   */
  getAllDrafts(userId?: string): ApplicationDraft[] {
    const drafts: ApplicationDraft[] = [];
    try {
      const prefix = 'vidya_vrtti_draft_';
      const userKeyPrefix = `vidya_vrtti_draft_${userId || 'guest'}_`;
      const guestKeyPrefix = 'vidya_vrtti_draft_guest_';

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(prefix)) continue;

        // Accept keys for this specific user or guest
        const matchesUser = key.startsWith(userKeyPrefix);
        const matchesGuest = key.startsWith(guestKeyPrefix);

        if (!matchesUser && !matchesGuest) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);
          // Derive schemeId from key if not in json: vidya_vrtti_draft_{user}_{schemeId}
          const parts = key.replace(prefix, '').split('_');
          // parts[0] is userId, parts[1] is schemeId, parts[2] optional editAppId
          const extractedSchemeId = parsed.schemeId || parts[1] || 'sch-nfst-01';
          const editAppId = parts[2] || undefined;
          const schemeMeta = SCHEME_NAME_MAP[extractedSchemeId] || { name: 'ST Scholarship Scheme', code: 'SCHEME' };

          drafts.push({
            storageKey: key,
            schemeId: extractedSchemeId,
            schemeName: parsed.schemeName || schemeMeta.name,
            schemeCode: parsed.schemeCode || schemeMeta.code,
            editAppId,
            currentStep: parsed.currentStep || 1,
            maxStepReached: parsed.maxStepReached || parsed.currentStep || 1,
            completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [],
            personal: parsed.personal,
            address: parsed.address,
            academic: parsed.academic,
            schemeSpecific: parsed.schemeSpecific,
            bank: parsed.bank,
            documents: parsed.documents,
            savedAt: parsed.savedAt || new Date().toISOString()
          });
        } catch {
          // Ignore invalid JSON in localStorage
        }
      }

      // Sort newest first
      drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    } catch (e) {
      console.warn('Error reading all drafts:', e);
    }
    return drafts;
  },

  /**
   * Clear a specific draft
   */
  clearDraft(storageKey: string): void {
    try {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new CustomEvent('vidya_draft_updated'));
    } catch (e) {
      console.warn('Failed to clear draft:', e);
    }
  },

  /**
   * Save a draft payload and trigger event
   */
  saveDraft(storageKey: string, payload: any): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('vidya_draft_updated'));
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
  }
};
