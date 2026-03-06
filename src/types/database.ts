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
  created_at: string;
}

export interface Plantation {
  id: string;
  farmer_id: string;
  name: string;
  created_at: string;
}

export type InspectionType = 'inspection' | 'after_45' | 'after_90' | 'after_120' | 'after_140' | 'harvest_plan';

export interface Inspection {
  id: string;
  plantation_id: string;
  type: InspectionType;
  details: string;
  created_at: string;
}
