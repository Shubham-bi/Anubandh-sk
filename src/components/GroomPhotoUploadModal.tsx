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
  HelpCircle,
  Star,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { compressImage } from '../utils/imageCompressor';
import {
  parseImageLink,
  DEFAULT_GROOM_DRIVE_SHARE_LINK
} from '../utils/googleDriveHelper';

interface GroomPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotos: string[];
  onAddPhoto: (photoUrl: string) => Promise<void>;
  onAddMultiplePhotos?: (photoUrls: string[]) => Promise<void>;
  onRemovePhotoAtIndex: (index: number) => Promise<void>;
  onSetPrimaryPhoto: (index: number) => Promise<void>;
  onClearAllPhotos: () => Promise<void>;
  // Backward compatibility
  currentPhoto?: string | null;
  onSavePhoto?: (photoDataUrl: string) => Promise<void>;
  onRemovePhoto?: () => Promise<void>;
}

type TabType = 'drive' | 'gallery';

export const GroomPhotoUploadModal: React.FC<GroomPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhotos,
  onAddPhoto,
  onAddMultiplePhotos,
  onRemovePhotoAtIndex,
  onSetPrimaryPhoto,
  onClearAllPhotos,
  onSavePhoto,
  onRemovePhoto
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('drive');

  // Multi-photo gallery upload state
  const [galleryPreviews, setGalleryPreviews] = useState<Array<{ dataUrl: string; sizeKb: number; width: number; height: number }>>([]);
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
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Reset/Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      setSuccessNotice(null);
      setIsProcessing(false);
      setGalleryPreviews([]);
      setLinkInput('');
      setLinkDirectUrl(null);
      setLinkImageStatus('idle');
      setLinkErrorMessage(null);
    }
  }, [isOpen]);

  // Handle URL link input changes with real-time parsing
  const handleLinkChange = (value: string) => {
    setLinkInput(value);
    setGeneralError(null);
    setSuccessNotice(null);

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

  // Gallery File Picker Handler supporting multiple files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGeneralError(null);
    setSuccessNotice(null);
    setIsProcessing(true);

    const compressedList: Array<{ dataUrl: string; sizeKb: number; width: number; height: number }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const result = await compressImage(file, {
            maxWidth: 480,
            maxHeight: 620,
            quality: 0.82
          });
          compressedList.push(result);
        }
      }

      if (compressedList.length === 0) {
        setGeneralError('कृपया वैध इमेज फाईल्स (JPG, PNG, WebP) निवडा.');
      } else {
        setGalleryPreviews((prev) => [...prev, ...compressedList]);
      }
    } catch (err: any) {
      console.error('Image compression error:', err);
      setGeneralError('फोटो कॉम्प्रेस करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add Google Drive Link to Gallery
  const handleAddDrivePhoto = async () => {
    if (!linkDirectUrl) {
      setGeneralError('कृपया प्रथम वैध Google Drive लिंक प्रविष्ट करा.');
      return;
    }

    if (currentPhotos.includes(linkDirectUrl)) {
      setGeneralError('हा फोटो आधीच गॅलरीमध्ये जोडलेला आहे.');
      return;
    }

    setIsProcessing(true);
    setGeneralError(null);

    try {
      if (onAddPhoto) {
        await onAddPhoto(linkDirectUrl);
      } else if (onSavePhoto) {
        await onSavePhoto(linkDirectUrl);
      }

      setLinkInput('');
      setLinkDirectUrl(null);
      setLinkImageStatus('idle');
      setSuccessNotice('✅ फोटो गॅलरीमध्ये यशस्वीरित्या जोडला!');
    } catch (err: any) {
      console.error('Add photo error:', err);
      setGeneralError('फोटो जोडताना त्रुटी आली.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add Uploaded Gallery Photos
  const handleAddGalleryPhotos = async () => {
    if (galleryPreviews.length === 0) {
      setGeneralError('कृपया प्रथम गॅलरीतून फोटो निवडा.');
      return;
    }

    setIsProcessing(true);
    setGeneralError(null);

    try {
      const urls = galleryPreviews.map((p) => p.dataUrl);
      if (onAddMultiplePhotos) {
        await onAddMultiplePhotos(urls);
      } else {
        for (const url of urls) {
          if (onAddPhoto) {
            await onAddPhoto(url);
          } else if (onSavePhoto) {
            await onSavePhoto(url);
          }
        }
      }

      setGalleryPreviews([]);
      setSuccessNotice(`✅ ${urls.length} फोटो गॅलरीमध्ये जोडले!`);
    } catch (err: any) {
      console.error('Save error:', err);
      setGeneralError('फोटो सेव्ह करताना त्रुटी आली.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove individual photo at index
  const handleRemovePhoto = async (index: number) => {
    if (!window.confirm('हा फोटो गॅलरीतून काढून टाकायचा आहे का?')) return;
    setIsProcessing(true);
    setGeneralError(null);
    setSuccessNotice(null);

    try {
      if (onRemovePhotoAtIndex) {
        await onRemovePhotoAtIndex(index);
      } else if (onRemovePhoto && currentPhotos.length <= 1) {
        await onRemovePhoto();
      }
      setSuccessNotice('फोटो काढून टाकला.');
    } catch (err: any) {
      console.error('Remove error:', err);
      setGeneralError('फोटो काढताना त्रुटी आली.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Set primary photo
  const handleSetPrimary = async (index: number) => {
    if (index === 0) return;
    setIsProcessing(true);
    setGeneralError(null);

    try {
      if (onSetPrimaryPhoto) {
        await onSetPrimaryPhoto(index);
        setSuccessNotice('⭐ हा फोटो मुख्य फोटो म्हणून सेट केला!');
      }
    } catch (err: any) {
      console.error('Set primary error:', err);
      setGeneralError('मुख्य फोटो सेट करताना त्रुटी आली.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all photos
  const handleClearAll = async () => {
    if (!window.confirm('तुम्हाला सर्व फोटो काढून टाकायचे आहेत का?')) return;
    setIsProcessing(true);
    setGeneralError(null);

    try {
      if (onClearAllPhotos) {
        await onClearAllPhotos();
      } else if (onRemovePhoto) {
        await onRemovePhoto();
      }
      setSuccessNotice('सर्व फोटो काढून टाकले.');
    } catch (err: any) {
      console.error('Clear all error:', err);
      setGeneralError('फोटो काढताना त्रुटी आली.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="वर फोटो गॅलरी व्यवस्थापन (Multiple Photos)"
      subtitle="बायोडाटा व प्रोफाइलसाठी एकापेक्षा जास्त फोटो Google Drive किंवा गॅलरीतून जोडा"
      icon={<Camera className="w-5 h-5 text-rose-600" />}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {generalError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* SECTION 1: Current Photos Gallery Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">
                सध्याचे फोटो ({currentPhotos.length})
              </span>
            </div>
            {currentPhotos.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isProcessing}
                className="text-[11px] font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>सर्व काढा</span>
              </button>
            )}
          </div>

          {currentPhotos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
              {currentPhotos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border-2 border-slate-300 bg-white shadow-xs aspect-[3/4] flex flex-col justify-between"
                >
                  <img
                    src={photoUrl}
                    alt={`फोटो ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Primary Badge */}
                  {idx === 0 ? (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[9px] font-black shadow-xs flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>मुख्य</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      disabled={isProcessing}
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 hover:bg-amber-500 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 cursor-pointer"
                      title="मुख्य फोटो बनवा"
                    >
                      <Star className="w-2.5 h-2.5" />
                      <span>मुख्य करा</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    disabled={isProcessing}
                    className="absolute top-1 right-1 w-6 h-6 rounded-md bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                    title="हा फोटो काढून टाका"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/50 text-white text-[9px] font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center text-slate-400 text-xs">
              गॅलरीमध्ये अद्याप कोणताही फोटो जोडलेला नाही. खालील पर्यायांतून फोटो जोडा.
            </div>
          )}
        </div>

        {/* SECTION 2: Add Photo Tabs */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-1.5">
            नवीन फोटो जोडा (Add New Photo):
          </span>

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
        </div>

        {/* TAB 1: GOOGLE DRIVE LINK */}
        {activeTab === 'drive' && (
          <div className="space-y-3 animate-fade-in">
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
            {linkDirectUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-slate-700 shadow-md bg-slate-200 relative">
                  <img
                    src={linkDirectUrl}
                    alt="नवीन फोटो प्रिव्ह्यू"
                    className="w-full h-full object-cover object-top"
                    onLoad={() => setLinkImageStatus('success')}
                    onError={() => {
                      setLinkImageStatus('error');
                      setLinkErrorMessage('गुगल ड्राईव्हवरून फोटो लोड होऊ शकला नाही. कृपया शेअरिंग सेटिंग तपासा.');
                    }}
                  />
                  {linkImageStatus === 'loading' && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[11px] gap-1">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                      <span>तपासत आहे...</span>
                    </div>
                  )}
                </div>

                {linkImageStatus === 'success' && (
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{isDriveLink ? 'गुगल ड्राईव्ह फोटो तयार आहे!' : 'वेब इमेज तयार आहे!'}</span>
                  </div>
                )}

                {linkImageStatus === 'error' && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[10.5px] text-center max-w-xs space-y-1">
                    <p className="font-bold flex items-center justify-center gap-1 text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>फोटो लोड होऊ शकला नाही</span>
                    </p>
                    <p className="text-amber-700">
                      {linkErrorMessage || 'Google Drive मधील शेअरिंग पर्याय तपासा.'}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddDrivePhoto}
                  disabled={isProcessing || linkImageStatus === 'loading'}
                  className="mt-3 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ हा फोटो गॅलरीमध्ये जोडा</span>
                </button>
              </div>
            )}

            {/* Helpful Guide */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[10.5px] text-amber-900 space-y-0.5">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <HelpCircle className="w-3 h-3 text-amber-700" />
                <span>Google Drive लिंक वापरताना:</span>
              </p>
              <p className="text-amber-800">
                Google Drive वर फोटोच्या <strong>Share</strong> पर्यायामध्ये <strong>"Anyone with the link can view"</strong> असणे आवश्यक आहे.
              </p>
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
              multiple
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              {galleryPreviews.length > 0 ? (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      निवडलेले नवीन फोटो ({galleryPreviews.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setGalleryPreviews([])}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      साफ करा
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {galleryPreviews.map((p, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[3/4] bg-white">
                        <img src={p.dataUrl} alt={`New ${i}`} className="w-full h-full object-cover object-top" />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-white text-[9px]">
                          {p.sizeKb}KB
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>आणखी निवडा</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddGalleryPhotos}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>जोडत आहे...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>➕ हे {galleryPreviews.length} फोटो गॅलरीत जोडा</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-all rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 group-hover:bg-rose-200 text-rose-700 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    मोबाईल / कॉम्प्युटर गॅलरीतून फोटो निवडा
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (एकाच वेळी एकापेक्षा जास्त फोटो निवडू शकता)
                  </span>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>ऑटोमॅटिक हलक्या WebP फॉरमॅटमध्ये कॉम्प्रेस होतात</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Done / Close Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            पूर्ण झाले (Done)
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
