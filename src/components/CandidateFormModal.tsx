import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, User, MapPin, Phone, GraduationCap, Users, Heart } from 'lucide-react';
import { BookletCandidate } from '../types/candidate';

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateToEdit?: BookletCandidate | null;
  onSave: (candidate: BookletCandidate) => void;
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
  onClose,
  candidateToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    sr: '',
    name: '',
    mulgaon: '',
    height: "५'४''",
    complexion: 'गोरा',
    gotra: '',
    mamkul: '',
    time: '',
    date: '',
    blood: 'ओ+',
    edu: '',
    fam: '',
    exp: 'अनुरूप',
    contactPerson: '',
    contactAddress: '',
    phoneNumbers: '',
    age: 25,
  });

  useEffect(() => {
    if (candidateToEdit) {
      // Pre-fill existing candidate
      const contactLines = (candidateToEdit.contact || '').split('\n');
      const contactPerson = contactLines[0] || '';
      const contactAddress = contactLines[1]?.replace(/^रा[\s:.-]*/i, '') || '';

      setFormData({
        id: candidateToEdit.id,
        sr: candidateToEdit.sr || '',
        name: candidateToEdit.name || '',
        mulgaon: candidateToEdit.mulgaon || '',
        height: candidateToEdit.height || "५'४''",
        complexion: candidateToEdit.complexion || 'गोरा',
        gotra: candidateToEdit.gotra || '',
        mamkul: candidateToEdit.mamkul || '',
        time: candidateToEdit.time || '',
        date: candidateToEdit.date || '',
        blood: candidateToEdit.blood || 'ओ+',
        edu: candidateToEdit.edu || '',
        fam: candidateToEdit.fam || '',
        exp: candidateToEdit.exp || 'अनुरूप',
        contactPerson: contactPerson,
        contactAddress: contactAddress,
        phoneNumbers: (candidateToEdit.phones || []).join(', '),
        age: candidateToEdit.age || 25,
      });
    } else {
      // New candidate default
      const randomId = 'cand_' + Date.now().toString().slice(-6);
      setFormData({
        id: randomId,
        sr: '',
        name: '',
        mulgaon: '',
        height: "५'४''",
        complexion: 'गोरा',
        gotra: '',
        mamkul: '',
        time: '',
        date: '',
        blood: 'ओ+',
        edu: '',
        fam: '',
        exp: 'अनुरूप',
        contactPerson: '',
        contactAddress: '',
        phoneNumbers: '',
        age: 25,
      });
    }
  }, [candidateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const phonesArray = formData.phoneNumbers
      .split(/[,;\n]/)
      .map((p) => p.trim())
      .filter(Boolean);

    let contactBlock = formData.contactPerson.trim();
    if (formData.contactAddress.trim()) {
      contactBlock += `\nरा. ${formData.contactAddress.trim()}`;
    }
    if (phonesArray.length > 0) {
      contactBlock += `\nमो. ${phonesArray.join(', ')}`;
    }

    const newCandidate: BookletCandidate = {
      id: formData.id,
      sr: formData.sr.trim() || formData.id,
      name: formData.name.trim(),
      mulgaon: formData.mulgaon.trim(),
      height: formData.height.trim(),
      complexion: formData.complexion.trim(),
      gotra: formData.gotra.trim() || 'इतर',
      mamkul: formData.mamkul.trim(),
      time: formData.time.trim(),
      date: formData.date.trim(),
      blood: formData.blood.trim(),
      edu: formData.edu.trim(),
      fam: formData.fam.trim(),
      exp: formData.exp.trim(),
      contact: contactBlock,
      phones: phonesArray,
      status: candidateToEdit?.status || 'pending',
      age: Number(formData.age) || 25,
      logs: candidateToEdit?.logs || [],
    };

    onSave(newCandidate);
    onClose();
  };

  const isEdit = Boolean(candidateToEdit);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {isEdit ? 'उमेदवार माहिती संपादित करा (Edit Profile)' : 'नवीन उमेदवार जोडा (Add Candidate)'}
              </h3>
              <p className="text-xs text-slate-500">
                पुस्तिका किंवा नवीन स्थळाची माहिती नोंदवा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 text-xs">
          {/* Section: Basic Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" /> प्राथमिक माहिती (Basic Details)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="font-bold text-slate-700 block mb-1">
                  उमेदवाराचे नाव (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कु. नेहा विलास पाटील"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="font-bold text-slate-700 block mb-1">
                  अनुक्रमांक / Serial No.
                </label>
                <input
                  type="text"
                  placeholder="उदा. १८५ किंवा cand_185"
                  value={formData.sr}
                  onChange={(e) => setFormData({ ...formData, sr: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">वय (Age)</label>
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">उंची (Height)</label>
                <input
                  type="text"
                  placeholder="५'४''"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">वर्ण (Complexion)</label>
                <select
                  value={formData.complexion}
                  onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="गोरा">गोरा (Fair)</option>
                  <option value="गहूवर्ण">गहूवर्ण (Wheatish)</option>
                  <option value="सावळा">सावळा</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">रक्तगट (Blood)</label>
                <input
                  type="text"
                  placeholder="उदा. ओ+, एबी+, बी+"
                  value={formData.blood}
                  onChange={(e) => setFormData({ ...formData, blood: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Gotra & Native Town */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> गोत्र व मूळगाव (Gotra & Origin)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">गोत्र (Gotra) *</label>
                <input
                  type="text"
                  placeholder="उदा. कौशिक, शांडिल्य, भारद्वाज..."
                  value={formData.gotra}
                  onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मामकूळ (Mamkul)</label>
                <input
                  type="text"
                  placeholder="उदा. नारखेडे, पाटील..."
                  value={formData.mamkul}
                  onChange={(e) => setFormData({ ...formData, mamkul: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मूळगाव (Mulgaon / Native)</label>
                <input
                  type="text"
                  placeholder="उदा. मलकापूर, पुणे, जळगाव..."
                  value={formData.mulgaon}
                  onChange={(e) => setFormData({ ...formData, mulgaon: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Education, Job & Family */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-rose-500" /> शिक्षण व नोकरी (Career & Family)
            </h4>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                शिक्षण व नोकरी / व्यवसाय (Education & Job details)
              </label>
              <textarea
                rows={2}
                placeholder="उदा. बी.ई. कॉम्प्युटर, नो- सिनियर सिस्टीम इंजिनिअर इन्फोसिस पुणे, रु. ६ लाख वार्षिक"
                value={formData.edu}
                onChange={(e) => setFormData({ ...formData, edu: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> कौटुंबिक माहिती (भाऊ / बहिण)
                </label>
                <input
                  type="text"
                  placeholder="उदा. भाऊ- १ अविवाहित, बहिण- नाही"
                  value={formData.fam}
                  onChange={(e) => setFormData({ ...formData, fam: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-slate-400" /> अपेक्षा (Expectations)
                </label>
                <input
                  type="text"
                  placeholder="उदा. अनुरूप, पदवीधर"
                  value={formData.exp}
                  onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Contact Person, Address & Mobile */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-500" /> पालक व संपर्क तपशील (Guardian & Contacts)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  संपर्क व्यक्तीचे नाव (Contact Person Name)
                </label>
                <input
                  type="text"
                  placeholder="उदा. श्री. प्रकाश वसंत झोपे (वडील / मामा)"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पत्ता / निवासस्थान (Address / Residence)
                </label>
                <input
                  type="text"
                  placeholder="उदा. निंपाणा, ता.मलकापूर, जि.बुलडाणा"
                  value={formData.contactAddress}
                  onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                मोबाईल नंबर (Phone Numbers - कॉमा देऊन एकापेक्षा जास्त टाकू शकता) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. 9822334455, 9422112233"
                value={formData.phoneNumbers}
                onChange={(e) => setFormData({ ...formData, phoneNumbers: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                इंग्रजी किंवा मराठी अंकांत नंबर टाकू शकता; ॲप आपोआप WhatsApp व कॉल बटण तयार करेल.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 pb-2 border-t border-slate-200 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'बदल जतन करा (Save Changes)' : 'उमेदवार जोडा (Add Candidate)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
