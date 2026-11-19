import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Save, User, MapPin, Phone, GraduationCap, Users } from 'lucide-react';
import { BookletCandidate } from '../types/candidate';

interface CandidateFormPageProps {
  onBack: () => void;
  candidateToEdit?: BookletCandidate | null;
  onSave: (candidate: BookletCandidate) => void;
}

export const CandidateFormPage: React.FC<CandidateFormPageProps> = ({
  onBack,
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
    window.scrollTo({ top: 0, behavior: 'instant' });
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
  }, [candidateToEdit]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

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
    onBack();
  };

  const isEdit = Boolean(candidateToEdit);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-200">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>मागे (Back)</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700 hidden sm:block">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  {isEdit ? 'उमेदवार माहिती संपादित करा' : 'नवीन उमेदवार जोडा'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  पुस्तिका किंवा नवीन स्थळाची माहिती नोंदवा
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>जतन करा (Save)</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-3 sm:p-6 space-y-5">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-4 sm:p-6 space-y-6 text-xs">
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
                  placeholder="उदा. ५'४''"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">वर्ण (Complexion)</label>
                <input
                  type="text"
                  placeholder="उदा. गोरा, सावळा"
                  value={formData.complexion}
                  onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">रक्तगट (Blood Group)</label>
                <input
                  type="text"
                  placeholder="उदा. ओ+, बी+, ए+"
                  value={formData.blood}
                  onChange={(e) => setFormData({ ...formData, blood: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Kundali & Gotra */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> गोत्र व जन्म तपशील (Horoscope & Native)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">गोत्र (Gotra) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. भारद्वाज, कश्यप, वसिष्ठ"
                  value={formData.gotra}
                  onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मामकूळ (Mamkul)</label>
                <input
                  type="text"
                  placeholder="उदा. सरोदे, बोंडे, कोलते"
                  value={formData.mamkul}
                  onChange={(e) => setFormData({ ...formData, mamkul: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मुळगाव (Native Village)</label>
                <input
                  type="text"
                  placeholder="उदा. सावदा, फैजपूर, वरणगाव"
                  value={formData.mulgaon}
                  onChange={(e) => setFormData({ ...formData, mulgaon: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">जन्म तारीख (Birth Date)</label>
                <input
                  type="text"
                  placeholder="उदा. १२-०८-१९९९ किंवा 12/08/1999"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">जन्म वेळ (Birth Time)</label>
                <input
                  type="text"
                  placeholder="उदा. स. ०८:४५ किंवा दु. ०२:१५"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Education & Career */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> शिक्षण व नोकरी (Education & Profession)
            </h4>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                शिक्षण व नोकरी सविस्तर तपशील *
              </label>
              <textarea
                rows={3}
                required
                placeholder="उदा. BE (Computer), Software Engineer at Infosys Pune, वार्षिक पॅकेज १२ लाख"
                value={formData.edu}
                onChange={(e) => setFormData({ ...formData, edu: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Section: Family & Expectations */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500" /> कौटुंबिक माहिती व अपेक्षा (Family & Expectations)
            </h4>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                कौटुंबिक माहिती (भाऊ, बहीण, शेती/इस्टेट)
              </label>
              <textarea
                rows={2}
                placeholder="उदा. १ भाऊ (इंजिनिअर), १ बहीण (विवाहित), शेती ५ एकर बागायत"
                value={formData.fam}
                onChange={(e) => setFormData({ ...formData, fam: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                अपेक्षा (Expectations)
              </label>
              <input
                type="text"
                placeholder="उदा. अनुरूप, पदवीधर, नोकरी करणारी किंवा गृहिणी चालतील"
                value={formData.exp}
                onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Section: Contacts */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" /> संपर्क तपशील (Contact Details)
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
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
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
