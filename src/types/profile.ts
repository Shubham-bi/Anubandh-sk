import { PipelineStage, CallLogEntry } from './pipeline';

export type TriageStatus = 'default' | 'shortlisted' | 'not_interested' | 'review' | 'contacted';

export interface Profile {
  nu_id: string;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birthdate: string;
  birthtime: string;
  birthplace: string;
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
  currentCity: string;
  about: string;
  expectations: string;
  photos: string[];
  biodatas: string[];
  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;
  motherName: string;
  motherOccupation: string;
  brothers: string;
  sisters: string;
  uncleName: string;
  unclePlace: string;
  mobile1: string;
  mobile2: string;
  email: string;
  maritalStatus: string;
  handicap: string;
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
