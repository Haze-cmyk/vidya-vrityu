import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RotateCcw,
  ShieldCheck,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Eligibility' | 'Documents' | 'Disbursement' | 'Verification' | 'General';
  lastUpdated?: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is the annual family income ceiling for NFST?',
    answer:
      'The annual family income limit for NFST is ₹6.0 Lakhs per annum. Income certificates must be issued by a competent revenue authority (such as a Tehsildar, Sub-Divisional Magistrate, or Revenue Officer) in the current financial year.',
    category: 'Eligibility',
    lastUpdated: '2026-03-01'
  },
  {
    id: 'faq-2',
    question: 'How does the AI OCR Document Scrutiny work?',
    answer:
      'When you upload your ST Caste Certificate or Income Certificate, our AI OCR engine automatically extracts your full name, community/tribe name, certificate issue date, and financial figures. If a discrepancy or unclear scan is detected, an automatic query notification is sent to your dashboard with a link to re-upload.',
    category: 'Verification',
    lastUpdated: '2026-03-10'
  },
  {
    id: 'faq-3',
    question: 'How are scholarship funds disbursed to students?',
    answer:
      'All approved fellowship amounts and tuition fees are directly transferred to the student’s Aadhaar-seeded bank account through the Direct Benefit Transfer (DBT) and PFMS payment gateway, ensuring 100% transparent and leak-proof delivery.',
    category: 'Disbursement',
    lastUpdated: '2026-03-15'
  },
  {
    id: 'faq-4',
    question: 'What documents are mandatory for Scheduled Tribe applicants?',
    answer:
      'Mandatory documents include: (1) Valid ST Community/Caste Certificate, (2) Competent Authority Income Certificate, (3) Academic marksheets/degrees, (4) Institute Admission/Fee Confirmation Letter, and (5) Aadhaar card for DBT verification.',
    category: 'Documents',
    lastUpdated: '2026-03-18'
  },
  {
    id: 'faq-5',
    question: 'What should I do if my application is marked "Defective"?',
    answer:
      'Do not panic. If a verification officer marks a specific document as defective (e.g. illegible stamp or missing seal), you will receive an alert. Navigate to "My Applications" -> Click "View Defect" -> Upload the corrected document and submit your response.',
    category: 'General',
    lastUpdated: '2026-03-20'
  }
];

const STORAGE_KEY = 'vidya_vrtti_faqs';

export const HelpPage: React.FC = () => {
  const { user, role } = useAuth();
  // Only users with role === 'admin' can edit, add, or delete FAQs.
  // Students (applicants) and Institutes can only view.
  const isAdmin = role === 'admin' || user?.role === 'admin';

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_FAQS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(faqs[0]?.id || null);

  // Admin Editing States
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState<FAQItem['category']>('General');

  // Save changes to localStorage
  const saveFaqsToStorage = (updatedFaqs: FAQItem[]) => {
    setFaqs(updatedFaqs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFaqs));
    } catch {
      // ignore
    }
  };

  const handleStartAdd = () => {
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('General');
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleStartEdit = (faq: FAQItem) => {
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setEditingId(faq.id);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormQuestion('');
    setFormAnswer('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      toast.error('Both question and answer are required.');
      return;
    }

    if (isAddingNew) {
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      const updated = [newFaq, ...faqs];
      saveFaqsToStorage(updated);
      setIsAddingNew(false);
      setOpenAccordionId(newFaq.id);
      toast.success('New FAQ added successfully!');
    } else if (editingId) {
      const updated = faqs.map((f) =>
        f.id === editingId
          ? {
              ...f,
              question: formQuestion.trim(),
              answer: formAnswer.trim(),
              category: formCategory,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : f
      );
      saveFaqsToStorage(updated);
      setEditingId(null);
      toast.success('FAQ updated successfully!');
    }
  };

  const handleDeleteFaq = (id: string, qText: string) => {
    if (window.confirm(`Are you sure you want to delete this FAQ: "${qText}"?`)) {
      const updated = faqs.filter((f) => f.id !== id);
      saveFaqsToStorage(updated);
      toast.success('FAQ removed.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all FAQs back to standard MoTA official guidelines?')) {
      saveFaqsToStorage(DEFAULT_FAQS);
      toast.success('FAQs restored to default guidelines.');
    }
  };

  const categories = ['All', 'Eligibility', 'Documents', 'Disbursement', 'Verification', 'General'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c9b79c] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
              Official MoTA Portal
            </span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 tracking-wider flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin Editor Mode Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Scholarship Helpdesk & FAQs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official guidelines, criteria, and operational FAQs for ST Scholarship Schemes.
          </p>
        </div>

        {/* Admin Action Button */}
        {isAdmin && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleStartAdd}
              className="px-4 py-2.5 rounded-xl bg-[#71816d] hover:bg-[#5a6857] text-white text-xs font-bold shadow-md transition-all flex items-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add New FAQ</span>
            </button>
            <button
              onClick={handleResetDefaults}
              title="Reset to default official MoTA FAQs"
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Admin Notice (If logged in as Admin) */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Administrator Privilege:</strong> You can create, edit, or delete any FAQ. Students and Institutes can only view these guidelines in read-only mode.
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit FAQ Modal or Inline Form */}
      {(isAddingNew || editingId) && isAdmin && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#71816d] shadow-lg animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <Edit2 className="w-4 h-4 mr-2 text-[#71816d]" />
              <span>{isAddingNew ? 'Create New FAQ' : 'Edit FAQ Item'}</span>
            </h3>
            <button
              onClick={handleCancelForm}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g., What is the deadline for submitting the post-matric application?"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as FAQItem['category'])}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="Eligibility">Eligibility</option>
                  <option value="Documents">Documents</option>
                  <option value="Disbursement">Disbursement</option>
                  <option value="Verification">Verification</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="Provide official, accurate guidance for students and applicants..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#71816d] focus:border-[#71816d] text-xs text-slate-800 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#71816d] hover:bg-[#5a6857] text-white font-bold shadow-sm transition-all flex items-center cursor-pointer"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save FAQ</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b79c] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, keyword, eligibility, or income ceiling..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fbf8f3] border border-[#c9b79c] rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#71816d] outline-hidden transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#71816d] text-white shadow-xs'
                  : 'bg-[#f1e0c5] text-slate-700 hover:bg-[#e8d6ba]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-[#c9b79c] text-slate-500 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="font-bold text-slate-700 text-sm">No matching FAQs found</p>
            <p className="mt-1">Try searching with a different keyword or select another category.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openAccordionId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#c9b79c] shadow-xs transition-all overflow-hidden"
              >
                {/* Accordion Title / Question Header */}
                <div
                  onClick={() => setOpenAccordionId(isOpen ? null : faq.id)}
                  className="p-4 sm:p-5 flex items-start justify-between cursor-pointer hover:bg-[#fbf8f3]/70 transition-colors"
                >
                  <div className="flex items-start space-x-3 pr-4">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#f1e0c5] text-[#71816d] font-black text-xs flex items-center justify-center mt-0.5 border border-[#dfcdb1]">
                      Q
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#f1e0c5] text-[#5a6857]">
                          {faq.category}
                        </span>
                        {faq.lastUpdated && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Updated {faq.lastUpdated}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5">
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Admin Edit / Delete Actions */}
                    {isAdmin && (
                      <div
                        className="flex items-center space-x-1.5 mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleStartEdit(faq)}
                          title="Edit this FAQ (Admin only)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id, faq.question)}
                          title="Delete this FAQ (Admin only)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Accordion Answer Content */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-[#f1e0c5] bg-[#fbf8f3]/40">
                    <div className="pl-9 pr-2">
                      <p className="whitespace-pre-line font-medium text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Official MoTA Helpline Card */}
      <div className="bg-[#f1e0c5] rounded-2xl border border-[#dfcdb1] p-6 text-xs text-slate-800 space-y-3">
        <h4 className="font-extrabold text-sm text-[#2c352a] flex items-center">
          <Phone className="w-4 h-4 mr-2 text-[#71816d]" />
          <span>Still need assistance? MoTA National Scholarship Helpdesk</span>
        </h4>
        <p className="text-slate-600 leading-relaxed">
          For technical grievances, payment inquiries, or special scheme clarification, reach out to our dedicated nodal support center.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-white rounded-xl border border-[#dfcdb1]">
            <p className="font-bold text-slate-500 text-[10px] uppercase">Toll-Free Helpline</p>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">1800-11-2026</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#dfcdb1]">
            <p className="font-bold text-slate-500 text-[10px] uppercase">Helpdesk Email</p>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">helpdesk-mota@gov.in</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#dfcdb1]">
            <p className="font-bold text-slate-500 text-[10px] uppercase">Working Hours</p>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">09:30 AM – 06:00 PM (Mon-Fri)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
