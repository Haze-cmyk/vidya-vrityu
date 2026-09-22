import {
  Scheme,
  User,
  Application,
  AuditLogEntry,
  AdminStats,
  Notification,
  MeritCandidate,
  OCRField,
  Document
} from '../types';
const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const BASE_URL = RAW_BASE_URL === '' ? '/api' : (RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL}/api`);

const CURRENT_USER_STORAGE_KEY = 'vidya_vrtti_current_user';
const TOKEN_STORAGE_KEY = 'vidya_vrtti_token';

// Helper for typed fetch calls
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>)
  };

  // Only add Content-Type: application/json if body is not FormData
  if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const mockApi = {
  async login(emailOrUsername: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, role })
    });

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(res.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    return res;
  },

  async register(data: Partial<User> & Record<string, any>): Promise<User> {
    const user = await request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, `jwt-token-${user.id}`);
    return user;
  },

  async updateProfile(userData: Partial<User> & { id?: string }): Promise<User> {
    const updated = await request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  getCurrentUser(): User | null {
    try {
      const item = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  },

  // Schemes API
  async getSchemes(): Promise<Scheme[]> {
    return request<Scheme[]>('/schemes');
  },

  async getSchemeById(id: string): Promise<Scheme | null> {
    try {
      return await request<Scheme>(`/schemes/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn(`Scheme ${id} not found:`, err);
      return null;
    }
  },

  async createScheme(schemeData: Partial<Scheme>): Promise<Scheme> {
    return request<Scheme>('/schemes', {
      method: 'POST',
      body: JSON.stringify(schemeData)
    });
  },

  async updateScheme(id: string, schemeData: Partial<Scheme>): Promise<Scheme> {
    return request<Scheme>(`/schemes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(schemeData)
    });
  },

  // Applications API
  async getApplications(filters?: {
    schemeCode?: string;
    status?: string;
    search?: string;
    state?: string;
    applicantId?: string;
  }): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters?.schemeCode) params.set('schemeCode', filters.schemeCode);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.state) params.set('state', filters.state);
    if (filters?.applicantId) params.set('applicantId', filters.applicantId);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Application[]>(`/applications${query}`);
  },

  async getApplicationById(id: string): Promise<Application | null> {
    try {
      return await request<Application>(`/applications/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn(`Application ${id} not found:`, err);
      return null;
    }
  },

  async submitApplication(appData: Partial<Application>): Promise<Application> {
    return request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  },

  async approveApplication(id: string, officerName = 'Shri Rajesh Kumar'): Promise<Application> {
    return request<Application>(`/applications/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ officerName })
    });
  },

  async rejectApplication(id: string, reason: string, officerName = 'Shri Rajesh Kumar'): Promise<Application> {
    return request<Application>(`/applications/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, officerName })
    });
  },

  async raiseDeficiency(
    id: string,
    reasons: string[],
    note?: string,
    officerName = 'Shri Rajesh Kumar'
  ): Promise<Application> {
    return request<Application>(`/applications/${encodeURIComponent(id)}/raise-deficiency`, {
      method: 'POST',
      body: JSON.stringify({ reasons, note, officerName })
    });
  },

  async resubmitApplication(id: string, revisedDocs: Document[]): Promise<Application> {
    return request<Application>(`/applications/${encodeURIComponent(id)}/resubmit`, {
      method: 'POST',
      body: JSON.stringify({ revisedDocs })
    });
  },

  async updateApplication(id: string, updateData: Partial<Application>): Promise<Application> {
    return request<Application>(`/applications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  async unlockApplication(id: string): Promise<Application> {
    return request<Application>(`/applications/${encodeURIComponent(id)}/unlock`, {
      method: 'POST'
    });
  },

  async generateMeritList(schemeCode = 'NFST'): Promise<MeritCandidate[]> {
    return request<MeritCandidate[]>(`/applications/merit-list?schemeCode=${encodeURIComponent(schemeCode)}`);
  },

  // Real Document Upload & OCR
  async uploadDocument(
    file: File,
    docType: string,
    compareValues?: {
      fullName?: string;
      tribeName?: string;
      annualIncome?: number;
      dob?: string;
    }
  ): Promise<{
    document: Document;
    ocrFields: OCRField[];
    ocrConfidence: number;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    if (compareValues) {
      formData.append('compareValues', JSON.stringify(compareValues));
    }

    return request<{
      document: Document;
      ocrFields: OCRField[];
      ocrConfidence: number;
      message: string;
    }>('/documents/upload', {
      method: 'POST',
      body: formData
    });
  },

  // Document OCR simulation fallback (kept for compatibility)
  async runOCR(docType: string, fileName: string): Promise<OCRField[]> {
    return [
      {
        id: `ocr-${Date.now()}-1`,
        field: 'Document Type',
        value: docType,
        confidence: 90,
        sourceDocId: 'doc-gen',
        sourceDocName: fileName
      }
    ];
  },

  // Admin Stats
  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/stats');
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return request<Notification[]>(`/notifications?userId=${encodeURIComponent(userId)}`);
  },

  async markNotificationRead(id: string): Promise<void> {
    await request<void>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PUT'
    });
  },

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    link?: string
  ): Promise<Notification> {
    return request<Notification>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ userId, title, message, type, link })
    });
  },

  // Audit Log
  async getAuditLog(): Promise<AuditLogEntry[]> {
    return request<AuditLogEntry[]>('/audit');
  },

  async logAuditAction(
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    const currentUser = this.getCurrentUser();
    return request<AuditLogEntry>('/audit', {
      method: 'POST',
      body: JSON.stringify({
        actorId: currentUser?.id || 'usr-system',
        actorName: currentUser?.name || 'System User',
        actorRole: currentUser?.role || 'officer',
        action,
        entityType,
        entityId,
        metadata
      })
    });
  }
};
