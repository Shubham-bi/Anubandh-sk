const fs = require('fs');
const path = require('path');

const PROFILES_PATH = path.join(__dirname, '..', 'profiles.json');
const USER_PROFILES_PATH = path.join(__dirname, '..', 'user_profiles.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'profiles_clean.json');
const METADATA_FILE = path.join(OUTPUT_DIR, 'filter_metadata.json');

function parseAge(birthdateStr, fallbackAge) {
  if (birthdateStr && typeof birthdateStr === 'string') {
    // Expected format: DD-MM-YYYY or YYYY-MM-DD
    const parts = birthdateStr.split(/[-/]/);
    if (parts.length === 3) {
      let day, month, year;
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
      if (year > 1950 && year < 2015 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const birthDate = new Date(year, month, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 18 && age <= 70) {
          return age;
        }
      }
    }
  }

  if (fallbackAge) {
    const parsed = parseInt(fallbackAge, 10);
    if (!isNaN(parsed) && parsed >= 18 && parsed <= 70) {
      return parsed;
    }
  }

  return 28; // Default fallback
}

function parseHeight(rawHeight) {
  if (!rawHeight) return { text: 'N/A', inches: 64, cm: 162 };
  const str = String(rawHeight).trim();
  const match = str.match(/(\d+)\.?(\d+)?/);
  if (match) {
    const feet = parseInt(match[1], 10);
    const inches = match[2] ? parseInt(match[2], 10) : 0;
    const totalInches = (feet * 12) + inches;
    const cm = Math.round(totalInches * 2.54);
    return {
      text: `${feet}'${inches > 0 ? inches + '"' : ''}`,
      inches: totalInches,
      cm: cm
    };
  }
  return { text: str, inches: 64, cm: 162 };
}

function parseIncome(rawIncome) {
  if (!rawIncome) return 0;
  const cleaned = String(rawIncome).replace(/[^\d]/g, '');
  const val = parseInt(cleaned, 10);
  return isNaN(val) ? 0 : val;
}

function formatIncomeLabel(val) {
  if (!val || val === 0) return 'Not Specified';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

function cleanString(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  return (s === 'null' || s === 'undefined' || s === '0' || s === '0000-00-00') ? '' : s;
}

function main() {
  console.log('Loading input files...');
  if (!fs.existsSync(PROFILES_PATH)) {
    console.error(`Missing ${PROFILES_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(USER_PROFILES_PATH)) {
    console.error(`Missing ${USER_PROFILES_PATH}`);
    process.exit(1);
  }

  const listData = JSON.parse(fs.readFileSync(PROFILES_PATH, 'utf-8'));
  const detailData = JSON.parse(fs.readFileSync(USER_PROFILES_PATH, 'utf-8'));

  // Build lookup from listData
  const listMap = new Map();
  if (Array.isArray(listData.results)) {
    for (const r of listData.results) {
      const items = r.data?.bg_gotra;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item.nu_id) {
            listMap.set(String(item.nu_id), item);
          }
        }
      }
    }
  }

  console.log(`Found ${listMap.size} summary records in profiles.json`);

  const detailResults = detailData.results || {};
  const cleanProfiles = [];

  const gotraSet = new Set();
  const districtSet = new Set();
  const citySet = new Set();
  const educationSet = new Set();

  for (const [nuIdStr, detailObj] of Object.entries(detailResults)) {
    const listSummary = listMap.get(nuIdStr) || {};
    const detailBg = Array.isArray(detailObj.bg_gotra) && detailObj.bg_gotra.length > 0 ? detailObj.bg_gotra[0] : {};

    // Parse summary string: "27, 5.4, Fair / गोरा, O+, Pune (M Corp.), /MBA,  , Service , 550000"
    const summaryStr = listSummary.return_data_eng_data || '';
    const summaryParts = summaryStr.split(',').map(s => s.trim());

    const fallbackAge = summaryParts[0] || listSummary.age;
    const age = parseAge(detailBg.birthdate, fallbackAge);

    const heightRaw = detailBg.height || summaryParts[1] || '5.4';
    const height = parseHeight(heightRaw);

    const rawIncome = listSummary.is_bussiness_income || summaryParts[8] || detailBg.is_bussiness_income;
    const incomeNum = parseIncome(rawIncome);
    const incomeLabel = formatIncomeLabel(incomeNum);

    const education = cleanString(summaryParts[5]?.replace(/^\//, '') || detailBg.education || 'Graduate');
    if (education) educationSet.add(education);

    const occupation = cleanString(summaryParts[7] || detailBg.fatherjobDetails || 'Service');
    const bloodGroup = cleanString(detailBg.bloodGroup || summaryParts[3]);
    const complexion = cleanString(detailBg.colorName || summaryParts[2]);

    const gotra = cleanString(detailBg.gotraName || 'Other');
    if (gotra) gotraSet.add(gotra);

    const mamkul = cleanString(detailBg.mamkul);

    const nativeDistrict = cleanString(detailBg.nativeDistrict || detailBg.districtName);
    if (nativeDistrict) districtSet.add(nativeDistrict);

    const nativeTaluka = cleanString(detailBg.nativeTaluka || detailBg.talukaName);
    const nativePlace = cleanString(detailBg.nativePlace || detailBg.placeName);

    const currentCity = cleanString(detailBg.currentCity || summaryParts[4] || detailBg.placeName || 'Maharashtra');
    if (currentCity) citySet.add(currentCity);

    // Photos
    const photos = [];
    if (listSummary.e_profile_img1) {
      photos.push(listSummary.e_profile_img1);
    }
    if (Array.isArray(detailObj.profile_picture)) {
      for (const pic of detailObj.profile_picture) {
        if (pic && pic.e_profile_img && !photos.includes(pic.e_profile_img)) {
          photos.push(pic.e_profile_img);
        }
      }
    }

    // Biodata docs
    const biodatas = [];
    if (Array.isArray(detailObj.userBiodata)) {
      for (const bio of detailObj.userBiodata) {
        if (bio && bio.e_biodata && bio.e_biodata.trim() !== '') {
          biodatas.push(bio.e_biodata.trim());
        }
      }
    }

    // Family details
    const fatherName = cleanString(detailBg.fatherName);
    const fatherOccupation = cleanString(detailBg.fatherjobDetails);
    const fatherMobile = cleanString(detailBg.fathermobile1 || detailBg.fathermobile2);
    const motherName = cleanString(detailBg.motherName);
    const motherOccupation = cleanString(detailBg.motherjobDetails);

    const brothers = `Unmarried: ${cleanString(detailBg.unmarriedBrother) || '0'}, Married: ${cleanString(detailBg.marriedBrother) || '0'}`;
    const sisters = `Unmarried: ${cleanString(detailBg.unmarriedSister) || '0'}, Married: ${cleanString(detailBg.marriedSister) || '0'}`;

    const uncleName = cleanString(detailBg.uncleName);
    const unclePlace = cleanString(detailBg.unclePlace);

    const contactMobile1 = cleanString(detailBg.mobile1 || listSummary.mobile1);
    const contactMobile2 = cleanString(detailBg.mobile2 || listSummary.mobile2);
    const contactEmail = cleanString(detailBg.email);

    const fullName = `${cleanString(detailBg.firstname || listSummary.firstname)} ${cleanString(detailBg.middlename || listSummary.middlename)} ${cleanString(detailBg.lastname || listSummary.lastname)}`.trim();

    cleanProfiles.push({
      nu_id: String(nuIdStr),
      name: fullName,
      firstname: cleanString(detailBg.firstname || listSummary.firstname),
      lastname: cleanString(detailBg.lastname || listSummary.lastname),
      age: age,
      birthdate: cleanString(detailBg.birthdate),
      birthtime: cleanString(detailBg.birthTime),
      birthplace: cleanString(detailBg.birthplace),
      height: height.text,
      height_inches: height.inches,
      height_cm: height.cm,
      bloodGroup: bloodGroup,
      complexion: complexion,
      gotra: gotra,
      mamkul: mamkul,
      zodiac: cleanString(detailBg.zodicSign),
      mangal: cleanString(detailBg.mangalName),
      education: education,
      occupation: occupation,
      income_num: incomeNum,
      income_label: incomeLabel,
      nativePlace: nativePlace,
      nativeTaluka: nativeTaluka,
      nativeDistrict: nativeDistrict,
      currentCity: currentCity,
      about: cleanString(detailBg.e_nu_about_user),
      expectations: cleanString(detailBg.e_nu_exception),
      photos: photos,
      biodatas: biodatas,
      fatherName: fatherName,
      fatherOccupation: fatherOccupation,
      fatherMobile: fatherMobile,
      motherName: motherName,
      motherOccupation: motherOccupation,
      brothers: brothers,
      sisters: sisters,
      uncleName: uncleName,
      unclePlace: unclePlace,
      mobile1: contactMobile1,
      mobile2: contactMobile2,
      email: contactEmail,
      maritalStatus: cleanString(detailBg.maratialStatus) || 'Never Married',
      handicap: cleanString(detailBg.handcap_status) === '1' ? (cleanString(detailBg.handcapDetails) || 'Yes') : 'No'
    });
  }

  console.log(`Processed ${cleanProfiles.length} clean profile objects.`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanProfiles, null, 2), 'utf-8');
  console.log(`Saved clean profiles to ${OUTPUT_FILE}`);

  const metadata = {
    total_profiles: cleanProfiles.length,
    gotras: Array.from(gotraSet).filter(Boolean).sort(),
    districts: Array.from(districtSet).filter(Boolean).sort(),
    cities: Array.from(citySet).filter(Boolean).sort(),
    educations: Array.from(educationSet).filter(Boolean).sort()
  };

  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`Saved filter metadata to ${METADATA_FILE}`);
}

main();
