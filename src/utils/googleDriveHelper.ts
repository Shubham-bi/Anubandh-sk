/**
 * googleDriveHelper.ts - Utilities to convert Google Drive share links into direct CDN image URLs
 */

export const DEFAULT_GROOM_DRIVE_SHARE_LINK = 'https://drive.google.com/file/d/1lLsfQzKYrJWMs8_DNshxAbzWKMuSIPKd/view?usp=sharing';
export const DEFAULT_GROOM_PHOTO_CDN = 'https://lh3.googleusercontent.com/d/1lLsfQzKYrJWMs8_DNshxAbzWKMuSIPKd';

export interface ParsedImageLink {
  isValid: boolean;
  directUrl: string;
  isGoogleDrive: boolean;
  fileId?: string;
  errorMessage?: string;
}

/**
 * Extracts Google Drive file ID from various sharing link patterns
 * Examples supported:
 * - https://drive.google.com/file/d/1lLsfQzKYrJWMs8_DNshxAbzWKMuSIPKd/view?usp=sharing
 * - https://drive.google.com/open?id=1lLsfQzKYrJWMs8_DNshxAbzWKMuSIPKd
 * - https://drive.google.com/uc?id=1lLsfQzKYrJWMs8_DNshxAbzWKMuSIPKd
 * - https://lh3.googleusercontent.com/d/1lLsfQzKYrJWMs8_DNshxAbzWKMuSIPKd
 * - Bare 25+ character alphanumeric ID
 */
export function extractGoogleDriveFileId(inputUrl: string): string | null {
  const trimmed = inputUrl.trim();

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1];
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or ?id=FILE_ID or &id=FILE_ID
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1];
  }

  // Pattern 3: https://lh3.googleusercontent.com/d/FILE_ID
  const matchLh3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{25,})/);
  if (matchLh3 && matchLh3[1]) {
    return matchLh3[1];
  }

  // Pattern 4: Bare file ID (alphanumeric string with 25+ chars)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Checks if a given URL is a Google Drive share link or converted CDN link
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('googleusercontent.com/d/');
}

/**
 * Converts a Google Drive link or standard image URL into a direct displayable image URL
 */
export function parseImageLink(inputUrl: string): ParsedImageLink {
  const trimmed = inputUrl.trim();

  if (!trimmed) {
    return {
      isValid: false,
      directUrl: '',
      isGoogleDrive: false,
      errorMessage: 'कृपया वैध लिंक प्रविष्ट करा.'
    };
  }

  // Check if it is a Google Drive link
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    // Fast, reliable Google CDN endpoint for direct image display
    const directUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
    return {
      isValid: true,
      directUrl,
      isGoogleDrive: true,
      fileId: driveId
    };
  }

  // Check for standard web image URL (HTTP/HTTPS)
  if (/^https?:\/\/.+/i.test(trimmed)) {
    return {
      isValid: true,
      directUrl: trimmed,
      isGoogleDrive: false
    };
  }

  return {
    isValid: false,
    directUrl: '',
    isGoogleDrive: false,
    errorMessage: 'अवैध लिंक. कृपया Google Drive लिंक (https://drive.google.com/file/d/...) किंवा थेट वेब इमेज लिंक टाका.'
  };
}
