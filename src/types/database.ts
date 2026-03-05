export interface Inspector {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  photo: string | null;
  created_at: string;
}

export interface Farmer {
  id: string;
  farmer_name: string;
  farmer_no: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  bank: string;
  account_no: string;
  branch: string;
  contract: string;
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
