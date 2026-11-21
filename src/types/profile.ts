import { PipelineStage, CallLogEntry } from './pipeline';

export type TriageStatus = 'default' | 'shortlisted' | 'not_interested' | 'review' | 'contacted';

export interface ContactPerson {
  id: number;
  name: string;
  relationName: string;
  mobile1: string;
  mobile2?: string;
  homeAddress?: string;
  place?: string;
  taluka?: string;
  district?: string;
  state?: string;
  jobName?: string;
  jobAddress?: string;
  officeContactNo?: string;
}

export interface Profile {
  nu_id: string;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birthdate: string;
  birthtime: string;
  birthplace: string;
  birthname?: string;
  height: string;
  height_inches: number;
  height_cm: number;
  bloodGroup: string;
  complexion: string;
  gotra: string;
  mamkul: string;
  zodiac: string;
  mangal: string;
  education: string;
  occupation: string;
  income_num: number;
  income_label: string;
  nativePlace: string;
  nativeTaluka: string;
  nativeDistrict: string;
  nativeState?: string;
  currentCity: string;
  currentTaluka?: string;
  currentDistrict?: string;
  currentState?: string;
  personalAddress?: string;
  gender?: string;
  profileCreatedBy?: string;
  weight?: string;
  groupMarriageAgree?: string;
  about: string;
  expectations: string;
  photos: string[];
  biodatas: string[];
  fatherName: string;
  fatherOccupation: string;
  fatherJobPosition?: string;
  fatherJobAddress?: string;
  fatherAddress?: string;
  fatherMobile: string;
  fatherMobile2?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation: string;
  motherAddress?: string;
  motherMobile1?: string;
  motherMobile2?: string;
  motherEmail?: string;
  brothers: string;
  sisters: string;
  uncleName: string;
  unclePlace: string;
  uncleTaluka?: string;
  uncleDistrict?: string;
  uncleState?: string;
  mobile1: string;
  mobile2: string;
  email: string;
  maritalStatus: string;
  marriageYear?: string;
  divorceYear?: string;
  numberOfChildren?: string;
  avgChildrenAge?: string;
  handicap: string;
  handicapStatus?: string;
  handicapPercent?: string;
  handicapDetails?: string;
  contactPersons?: ContactPerson[];
}

export interface ProfileInteraction {
  nu_id: string;
  status: TriageStatus;
  stage?: PipelineStage;
  notes: string;
  tags: string[];
  rating: number; // 0 to 5
  logs?: CallLogEntry[];
  updatedAt: number;
}

export interface FilterState {
  searchQuery: string;
  statusTab: 'all' | TriageStatus;
  minAge: number;
  maxAge: number;
  minIncome: number; // in INR
  maxIncome: number; // in INR
  selectedGotras: string[];
  excludedGotras: string[];
  selectedDistricts: string[];
  selectedCities: string[];
  selectedEducations: string[];
  maritalStatus: string;
  hasPhotosOnly: boolean;
  sortBy: 'age_asc' | 'age_desc' | 'income_desc' | 'income_asc' | 'name_asc' | 'updated_desc';
}

export interface FilterMetadata {
  total_profiles: number;
  gotras: string[];
  districts: string[];
  cities: string[];
  educations: string[];
}
