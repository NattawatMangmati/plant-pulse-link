export interface Inspector {
  id: string;
  Name: string | null;
  "Full name": string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
  photo: string | null;
  created_at: string;
}

export interface Farmer {
  id: string;
  farmer_name: string;
  farmer_no: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  bank: string | null;
  account_no: string | null;
  branch: string | null;
  contract: boolean | null;
  inspector_id: string;
  profile_photo: string | null;
  id_card_photo: string | null;
  bookbank_photo: string | null;
  created_at: string;
}

export interface Plantation {
  id: string;
  farmer_id: string;
  plantation_name: string;
  address: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  "plot's_month": string | null;
  "plot's_type": string | null;
  area: number | null;
  plant_per_rai: string | null;
  plant_spacing: string | null;
  inter_crop: string | null;
  total_plant: number | null;
  total_plant_register: number | null;
  force_plant: number | null;
  force_month: string | null;
  first_force_date: string | null;
  second_force_date: string | null;
  "60_days_after_force": string | null;
  "120_days_after_force": string | null;
  "140_days_after_force": string | null;
  inspectorid: string | null;
  "จุก/หน่อ": string | null;
  photo: string | null;
  lat: number | null;
  long: number | null;
  created_at: string;
}

export type InspectionType = 'inspection' | 'after_60' | 'after_120' | 'after_140' | 'harvest_plan';

export interface Inspection {
  id: string;
  plantation_id: string;
  type: InspectionType;
  details: string;
  created_at: string;
}
