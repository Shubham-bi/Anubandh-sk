/**
 * messages.ts - Single Source of Truth for Anubandh Proposal & Share Messages
 * सर्व मेसेज मसुद्यांसाठी मध्यवर्ती फाईल (Single Source of Truth)
 * 
 * १. उमेदवार प्रस्ताव मेसेज (मुलीच्या पालकांना पाठवताना - Candidate Proposal Message)
 * २. सामान्य शोध मेसेज (नातेवाईक व परिचितांना पाठवताना - Generic Share Message)
 */

/**
 * Dynamically resolves the groom biodata URL at runtime using window.location.origin
 * Avoids any hardcoded domain so it works across localhost, local network IPs, staging, and production.
 */
export function getBiodataUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    return `${origin}/profile`;
  }
  return '/profile';
}

/**
 * Backward compatibility alias for getBiodataUrl()
 */
export const BIODATA_URL = typeof window !== 'undefined' && window.location?.origin
  ? `${window.location.origin.replace(/\/+$/, '')}/profile`
  : '/profile';

export const DEFAULT_GROOM = {
  name: 'शुभम अनिल खर्चे',
  edu: 'B.E. Mechanical',
  job: 'Sr. QA Engineer',
  company: 'Shaurya Technosoft Pvt. Ltd., Pune',
  salary: '7.8 LPA',
  dob: '25/08/1996',
  gotra: 'वशिष्ठ',
  mobile1: '9420539396',
  mobile2: '9422152231'
};

export interface CandidateProposalParams {
  girlFatherName?: string;
  guardianName?: string;
  girlName?: string;
  candidateName?: string;
  listNumber?: string | number;
  srNo?: string | number;
  includeNickname?: boolean;
  groomName?: string;
  groomEdu?: string;
  groomJob?: string;
  groomCompany?: string;
  groomSalary?: string;
  groomDob?: string;
  groomGotra?: string;
  biodataUrl?: string;
  includeGotra?: boolean;
  includeFamilyFooter?: boolean;
  familyFooterText?: string;
  customTemplate?: string;
}

/**
 * १. उमेदवार प्रस्ताव मेसेज (मुलीच्या पालकांना पाठवताना - Candidate Proposal Message)
 */
export function buildCandidateProposalMessage(params: CandidateProposalParams = {}): string {
  const father = (params.girlFatherName || params.guardianName || '').trim();
  let girl = (params.girlName || params.candidateName || '').trim();

  // In message while sharing don't include name in () unless explicitly requested via includeNickname toggle
  if (!params.includeNickname) {
    girl = girl.replace(/\s*\([^)]*\)/g, '').trim();
  }
  girl = girl.replace(/^कु\.?\s*/, '').trim();

  const candDisplay = girl ? `कु. ${girl}` : '';
  const listNo = String(
    params.listNumber !== undefined && params.listNumber !== null
      ? params.listNumber
      : params.srNo || ''
  )
    .replace(/\.$/, '')
    .trim();
  const srPart = listNo ? ` (अ.क्र. ${listNo}.)` : '';

  let introLine = '';
  if (father) {
    let prefix = '';
    if (!father.startsWith('श्री') && !father.startsWith('सौ') && !father.startsWith('डॉ')) {
      prefix = 'श्री. ';
    }
    introLine = `आम्ही ${prefix}${father} यांची मुलगी ${candDisplay}${srPart} हिच्यासाठी आपल्याशी संपर्क साधत आहोत.`;
  } else if (candDisplay) {
    introLine = `आम्ही भ्रातृमंडळ वधू-वर सूचीमधील मुलगी ${candDisplay}${srPart} हिच्यासाठी आपल्याशी संपर्क साधत आहोत.`;
  } else {
    introLine = `आम्ही भ्रातृमंडळ वधू-वर सूचीमधील आपल्या स्थळासाठी संपर्क साधत आहोत.`;
  }

  const groomName = params.groomName || DEFAULT_GROOM.name;
  const groomEdu = params.groomEdu || DEFAULT_GROOM.edu;
  const groomJob = params.groomJob || DEFAULT_GROOM.job;
  const groomCompany = params.groomCompany || DEFAULT_GROOM.company;
  const groomSalary = params.groomSalary || DEFAULT_GROOM.salary;
  const groomDob = params.groomDob || DEFAULT_GROOM.dob;
  const groomGotra = params.groomGotra || DEFAULT_GROOM.gotra;
  const url = params.biodataUrl || getBiodataUrl();

  // Optional CMS Custom Template override
  if (params.customTemplate && params.customTemplate.trim()) {
    const vars: Record<string, string> = {
      candidate_name: candDisplay || girl,
      sr_no: listNo,
      guardian_name: father,
      intro_line: introLine,
      groom_name: groomName,
      groom_edu: groomEdu,
      groom_job: groomJob,
      groom_company: groomCompany,
      groom_salary: groomSalary,
      groom_dob: groomDob,
      groom_gotra: groomGotra,
      profile_url: url
    };
    return params.customTemplate.replace(
      /\{(\w+)\}/g,
      (match, key) => (vars[key] !== undefined ? vars[key] : match)
    );
  }

  const groomLines = [
    `• नाव: चि. ${groomName}`,
    `• शिक्षण: ${groomEdu}`,
    `• नोकरी: ${groomJob}, ${groomCompany}`,
    `• वार्षिक पॅकेज: ${groomSalary}`,
    `• जन्मतारीख: ${groomDob}`
  ];
  if (params.includeGotra !== false) {
    groomLines.push(`• गोत्र: ${groomGotra}`);
  }

  let footerNote = 'धन्यवाद! 🙏';
  if (params.includeFamilyFooter !== false) {
    const footerText =
      params.familyFooterText || 'खर्चे परिवार (मो. 9420539396 / 9422152231)';
    footerNote += `\n— ${footerText}`;
  }

  return `नमस्कार!

${introLine}

भ्रातृमंडळ वधू-वर सूचीमध्ये आपल्या मुलीची विवाहासाठी दिलेली माहिती आम्ही वाचली. तिचे स्थळ आम्हाला योग्य वाटल्यामुळे आमच्या मुलाची माहिती आपणास पाठवत आहोत.

*मुलाची थोडक्यात माहिती:*
${groomLines.join('\n')}

मुलाचा बायोडाटा आणि अधिक माहिती खालील लिंकवर पाहता येईल:
${url}

आपणासही आमचे स्थळ योग्य वाटल्यास पुढील चर्चेसाठी कृपया संपर्क साधावा.

${footerNote}`;
}

export interface GenericShareParams {
  groomName?: string;
  groomEdu?: string;
  groomJob?: string;
  groomCompany?: string;
  groomSalary?: string;
  groomDob?: string;
  biodataUrl?: string;
  customTemplate?: string;
}

/**
 * २. सामान्य शोध मेसेज (नातेवाईक व परिचितांना पाठवताना - Generic Share Message)
 */
export function buildGenericShareMessage(params: GenericShareParams = {}): string {
  const groomName = params.groomName || DEFAULT_GROOM.name;
  const groomEdu = params.groomEdu || DEFAULT_GROOM.edu;
  const groomJob = params.groomJob || DEFAULT_GROOM.job;
  const groomCompany = params.groomCompany || DEFAULT_GROOM.company;
  const groomSalary = params.groomSalary || DEFAULT_GROOM.salary;
  const groomDob = params.groomDob || DEFAULT_GROOM.dob;
  const url = params.biodataUrl || getBiodataUrl();

  if (params.customTemplate && params.customTemplate.trim()) {
    const vars: Record<string, string> = {
      groom_name: groomName,
      groom_edu: groomEdu,
      groom_job: groomJob,
      groom_company: groomCompany,
      groom_salary: groomSalary,
      groom_dob: groomDob,
      profile_url: url
    };
    return params.customTemplate.replace(
      /\{(\w+)\}/g,
      (match, key) => (vars[key] !== undefined ? vars[key] : match)
    );
  }

  return `नमस्कार!

आम्ही आमचा मुलगा चि. ${groomName} याच्यासाठी योग्य वधूच्या शोधात आहोत.

आपल्या परिचयात योग्य स्थळ असल्यास कृपया आम्हाला कळवावे.

*मुलाची थोडक्यात माहिती:*
• नाव: चि. ${groomName}
• शिक्षण: ${groomEdu}
• नोकरी: ${groomJob}, ${groomCompany}
• वार्षिक पॅकेज: ${groomSalary}
• जन्मतारीख: ${groomDob}

मुलाचा (${groomName}) बायोडाटा सोबत जोडलेला आहे. अधिक माहिती खालील लिंकवर पाहता येईल:
${url}

धन्यवाद! 🙏`;
}

/**
 * Helper to generate WhatsApp URL with the proposal message
 */
export function getProposalWhatsAppUrl(phoneClean: string, proposalParams: CandidateProposalParams): string {
  if (!phoneClean) return '';
  const countryPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
  const message = buildCandidateProposalMessage(proposalParams);
  return `https://wa.me/${countryPhone}?text=${encodeURIComponent(message)}`;
}
