import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { compressImage } from '../utils/imageCompressor';

interface GroomPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string | null;
  onSavePhoto: (photoDataUrl: string) => Promise<void>;
  onRemovePhoto: () => Promise<void>;
}

export const GroomPhotoUploadModal: React.FC<GroomPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto,
  onRemovePhoto
}) => {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<{ sizeKb: number; width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetState = () => {
    setSelectedPreview(null);
    setFileStats(null);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया वैध इमेज फाईल (JPG, PNG, WebP) निवडा.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await compressImage(file, {
        maxWidth: 480,
        maxHeight: 620,
        quality: 0.82
      });

      setSelectedPreview(result.dataUrl);
      setFileStats({
        sizeKb: result.sizeKb,
        width: result.width,
        height: result.height
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrorMessage('फोटो कॉम्प्रेस करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPreview) return;
    setIsProcessing(true);
    try {
      await onSavePhoto(selectedPreview);
      handleClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage('फोटो सेव्ह करताना त्रुटी आली.');
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('तुम्हाला वर फोटो काढून टाकायचा आहे का?')) return;
    setIsProcessing(true);
    try {
      await onRemovePhoto();
      handleClose();
    } catch (err: any) {
      console.error('Remove error:', err);
      setErrorMessage('फोटो काढताना त्रुटी आली.');
      setIsProcessing(false);
    }
  };

  const previewToShow = selectedPreview || currentPhoto;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="वर फोटो अपलोड व व्यवस्थापन"
      subtitle="बायोडाटा व प्रोफाइलसाठी वर (शुभम) यांचा फोटो जोडा"
      icon={<Camera className="w-5 h-5 text-rose-600" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Image Preview Box */}
        <div className="flex flex-col items-center justify-center">
          {previewToShow ? (
            <div className="relative group">
              <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-100 flex items-center justify-center">
                <img
                  src={previewToShow}
                  alt="वर फोटो"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Tap to change overlay */}
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
              className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 group-hover:bg-rose-200 text-rose-700 flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                फोटो निवडा
              </span>
              <span className="text-[11px] text-slate-500">
                मोबाईल गॅलरी किंवा कॉम्प्युटरमधून
              </span>
            </div>
          )}

          {/* Compression Stats Badge */}
          {fileStats && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                ऑप्टिमाईज्ड आकार: <strong>{fileStats.sizeKb} KB</strong> ({fileStats.width}×{fileStats.height}px)
              </span>
            </div>
          )}
        </div>

        {/* Change / Upload Button */}
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{previewToShow ? 'दुसरा फोटो निवडा' : 'गॅलरी उघडा'}</span>
          </button>

          {currentPhoto && !selectedPreview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>काढून टाका</span>
            </button>
          )}
        </div>

        {/* Informative Note */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
          <p className="font-semibold flex items-center gap-1">
            💡 क्लाउड सिंक व ऑफलाइन माहिती:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            <li>अपलोड केलेला फोटो आपोआप हलक्या व उच्च दर्जाच्या WebP फॉरमॅटमध्ये कॉम्प्रेस होतो.</li>
            <li>हा फोटो थेट <strong>Firebase Realtime Database</strong> मध्ये सिंक होतो व सर्व उपकरणांवर त्वरित दिसतो.</li>
            <li>डाऊनलोड केल्या जाणाऱ्या बायोडाटा इमेजमध्येही हा फोटो आपोआप समाविष्ट होतो.</li>
          </ul>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            रद्द करा
          </button>

          {selectedPreview && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>सेव्ह होत आहे...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>सेव्ह व क्लाउड सिंक करा</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
