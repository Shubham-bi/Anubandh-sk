import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  Loader2,
  Link2,
  ClipboardPaste,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { compressImage } from '../utils/imageCompressor';
import {
  parseImageLink,
  isGoogleDriveUrl,
  DEFAULT_GROOM_DRIVE_SHARE_LINK
} from '../utils/googleDriveHelper';

interface GroomPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string | null;
  onSavePhoto: (photoDataUrl: string) => Promise<void>;
  onRemovePhoto: () => Promise<void>;
}

type TabType = 'drive' | 'gallery';

export const GroomPhotoUploadModal: React.FC<GroomPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto,
  onRemovePhoto
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return isGoogleDriveUrl(currentPhoto) ? 'drive' : 'drive';
  });

  // Gallery file upload state
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<{ sizeKb: number; width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Google Drive / Web Link state
  const [linkInput, setLinkInput] = useState<string>('');
  const [linkDirectUrl, setLinkDirectUrl] = useState<string | null>(null);
  const [isDriveLink, setIsDriveLink] = useState(false);
  const [linkImageStatus, setLinkImageStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null);

  // General processing & error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Initialize modal state when opened
  useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      setIsProcessing(false);
      setGalleryPreview(null);
      setFileStats(null);

      if (currentPhoto && isGoogleDriveUrl(currentPhoto)) {
        setActiveTab('drive');
        setLinkDirectUrl(currentPhoto);
        setIsDriveLink(true);
        setLinkImageStatus('success');
      } else {
        setActiveTab('drive');
        setLinkInput('');
        setLinkDirectUrl(null);
        setLinkImageStatus('idle');
        setLinkErrorMessage(null);
      }
    }
  }, [isOpen, currentPhoto]);

  // Handle URL link input changes with real-time parsing
  const handleLinkChange = (value: string) => {
    setLinkInput(value);
    setGeneralError(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setLinkDirectUrl(null);
      setIsDriveLink(false);
      setLinkImageStatus('idle');
      setLinkErrorMessage(null);
      return;
    }

    const parsed = parseImageLink(trimmed);
    if (parsed.isValid) {
      setLinkDirectUrl(parsed.directUrl);
      setIsDriveLink(parsed.isGoogleDrive);
      setLinkImageStatus('loading');
      setLinkErrorMessage(null);
    } else {
      setLinkDirectUrl(null);
      setIsDriveLink(false);
      setLinkImageStatus('error');
      setLinkErrorMessage(parsed.errorMessage || 'अवैध लिंक.');
    }
  };

  // Paste from clipboard helper
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleLinkChange(text);
        }
      }
    } catch (e) {
      console.warn('Clipboard read error:', e);
    }
  };

  // Pre-fill with the verified Google Drive link
  const handlePrefillDefaultLink = () => {
    handleLinkChange(DEFAULT_GROOM_DRIVE_SHARE_LINK);
  };

  // Gallery File Picker Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setGeneralError('कृपया वैध इमेज फाईल (JPG, PNG, WebP) निवडा.');
      return;
    }

    setGeneralError(null);
    setIsProcessing(true);

    try {
      const result = await compressImage(file, {
        maxWidth: 480,
        maxHeight: 620,
        quality: 0.82
      });

      setGalleryPreview(result.dataUrl);
      setFileStats({
        sizeKb: result.sizeKb,
        width: result.width,
        height: result.height
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      setGeneralError('फोटो कॉम्प्रेस करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Link or File
  const handleSave = async () => {
    let photoToSave: string | null = null;

    if (activeTab === 'drive') {
      if (!linkDirectUrl) {
        setGeneralError('कृपया वैध Google Drive लिंक प्रविष्ट करा.');
        return;
      }
      photoToSave = linkDirectUrl;
    } else {
      if (!galleryPreview) {
        setGeneralError('कृपया प्रथम गॅलरीतून फोटो निवडा.');
        return;
      }
      photoToSave = galleryPreview;
    }

    setIsProcessing(true);
    setGeneralError(null);

    try {
      await onSavePhoto(photoToSave);
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setGeneralError('फोटो सेव्ह करताना त्रुटी आली.');
      setIsProcessing(false);
    }
  };

  // Delete / Remove Photo
  const handleRemove = async () => {
    if (!window.confirm('तुम्हाला वर फोटो / लिंक काढून टाकायची आहे का?')) return;
    setIsProcessing(true);
    setGeneralError(null);

    try {
      await onRemovePhoto();
      onClose();
    } catch (err: any) {
      console.error('Remove error:', err);
      setGeneralError('फोटो काढताना त्रुटी आली.');
      setIsProcessing(false);
    }
  };

  // Active preview candidate
  const currentPreview =
    activeTab === 'drive'
      ? linkDirectUrl || (isGoogleDriveUrl(currentPhoto) ? currentPhoto : null)
      : galleryPreview || (!isGoogleDriveUrl(currentPhoto) ? currentPhoto : null);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="वर फोटो व्यवस्थापन (Google Drive / Upload)"
      subtitle="बायोडाटा व प्रोफाइलसाठी शुभम यांचा फोटो लिंक जोडा किंवा अपलोड करा"
      icon={<Camera className="w-5 h-5 text-rose-600" />}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {generalError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Tab Switcher: Drive Link vs Gallery Upload */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-white text-rose-800 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>🔗 गुगल ड्राईव्ह लिंक</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-rose-800 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>📁 गॅलरीतून निवडा</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE DRIVE LINK */}
        {activeTab === 'drive' && (
          <div className="space-y-3.5 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Google Drive शेअर लिंक पेस्ट करा:</span>
                </label>
                <button
                  type="button"
                  onClick={handlePrefillDefaultLink}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                >
                  शुभम यांची लिंक भरा
                </button>
              </div>

              <div className="relative">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="w-full px-3.5 py-2.5 pr-20 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-800 font-mono shadow-xs"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {linkInput && (
                    <button
                      type="button"
                      onClick={() => handleLinkChange('')}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="साफ करा"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="क्लिपबोर्डवरून पेस्ट करा"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>पेस्ट</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Link Verification & Preview Box */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              {currentPreview ? (
                <div className="relative flex flex-col items-center">
                  <div className="w-36 h-48 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg bg-slate-200 flex items-center justify-center relative">
                    <img
                      src={currentPreview}
                      alt="फोटो प्रिव्ह्यू"
                      className="w-full h-full object-cover object-top"
                      onLoad={() => setLinkImageStatus('success')}
                      onError={() => {
                        setLinkImageStatus('error');
                        setLinkErrorMessage('गुगल ड्राईव्हवरून फोटो लोड होऊ शकला नाही. कृपया शेअरिंग सेटिंग तपासा.');
                      }}
                    />
                    {linkImageStatus === 'loading' && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1.5">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                        <span>फोटो तपासत आहे...</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  {linkImageStatus === 'success' && (
                    <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isDriveLink ? 'गुगल ड्राईव्ह फोटो यशस्वीरित्या लोड झाला!' : 'वेब इमेज लोड झाली!'}</span>
                    </div>
                  )}

                  {linkImageStatus === 'error' && (
                    <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] text-center max-w-xs space-y-1">
                      <p className="font-bold flex items-center justify-center gap-1 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>फोटो लोड होऊ शकला नाही</span>
                      </p>
                      <p className="text-[10.5px] text-amber-700">
                        {linkErrorMessage || 'Google Drive मध्ये फाईलवर उजवे क्लिक करून Share > Anyone with the link (Viewer) असे सेट करा.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 space-y-1.5">
                  <Link2 className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    वरील चौकटीत Google Drive लिंक पेस्ट करा
                  </p>
                  <p className="text-[11px] text-slate-400">
                    उदा. https://drive.google.com/file/d/1lLsfQzKYrJWMs8.../view?usp=sharing
                  </p>
                </div>
              )}
            </div>

            {/* Helpful Guide */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Google Drive लिंक कशी मिळवावी?</span>
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-800">
                <li>Google Drive वर फोटो उघडून <strong>Share (शेअर)</strong> बटनावर टॅप करा.</li>
                <li>General access मध्ये <strong>"Anyone with the link"</strong> निवडा.</li>
                <li><strong>"Copy link"</strong> करून ती येथे पेस्ट करा.</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: GALLERY UPLOAD */}
        {activeTab === 'gallery' && (
          <div className="space-y-3.5 animate-fade-in">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              {currentPreview ? (
                <div className="relative group">
                  <div className="w-36 h-48 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg bg-slate-100 flex items-center justify-center">
                    <img
                      src={currentPreview}
                      alt="वर फोटो"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>फोटो बदला</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-48 sm:w-40 sm:h-52 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 group-hover:bg-rose-200 text-rose-700 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">फोटो निवडा</span>
                  <span className="text-[11px] text-slate-500">गॅलरी किंवा कॉम्प्युटरमधून</span>
                </div>
              )}

              {fileStats && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    ऑप्टिमाईज्ड: <strong>{fileStats.sizeKb} KB</strong> ({fileStats.width}×{fileStats.height}px)
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{currentPreview ? 'दुसरा फोटो निवडा' : 'गॅलरी उघडा'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons: Delete vs Save vs Cancel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div>
            {currentPhoto && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isProcessing}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-red-200 cursor-pointer"
                title="फोटो किंवा लिंक काढून टाका"
              >
                <Trash2 className="w-4 h-4" />
                <span>फोटो / लिंक काढून टाका</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              रद्द करा
            </button>

            {((activeTab === 'drive' && linkDirectUrl) || (activeTab === 'gallery' && galleryPreview)) && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>सेव्ह होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{activeTab === 'drive' ? 'ही लिंक सेव्ह करा' : 'हा फोटो सेव्ह करा'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
