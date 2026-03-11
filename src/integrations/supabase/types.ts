export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      "120days": {
        Row: {
          area: number | null
          avg_nitrate_no1: number | null
          avg_nitrate_no2: number | null
          avg_nitrate_no3: number | null
          avg_nitrate_row1: number | null
          avg_nitrate_row2: number | null
          avg_nitrate_row3: number | null
          avg_total_nitrate: number | null
          created_at: string
          defect_perc: number | null
          defect_row1: number | null
          defect_row2: number | null
          defect_row3: number | null
          destroyed_perc: number | null
          destroyed_row1: number | null
          destroyed_row2: number | null
          destroyed_row3: number | null
          farmerid: string | null
          first_prediction_product: number | null
          force_date: string | null
          force_plant: number | null
          good_products: number | null
          id: string
          inspection_date: string | null
          inspectorid: string | null
          large_perc: number | null
          large_row1: number | null
          large_row2: number | null
          large_row3: number | null
          large_weight: number | null
          m_y_force: string | null
          m_y_plot: string | null
          nitrate_row1_no1: number | null
          nitrate_row1_no2: number | null
          nitrate_row1_no3: number | null
          nitrate_row2_no1: number | null
          nitrate_row2_no2: number | null
          nitrate_row2_no3: number | null
          nitrate_row3_no1: number | null
          nitrate_row3_no2: number | null
          nitrate_row3_no3: number | null
          normal_perc: number | null
          photo: string | null
          platationid: string | null
          prediction_product_kg: number | null
          small_perc: number | null
          small_row1: number | null
          small_row2: number | null
          small_row3: number | null
          small_weight: number | null
          total_all: number | null
          total_defect: number | null
          total_destroyed: number | null
          total_large: number | null
          total_row1: number | null
          total_row2: number | null
          total_row3: number | null
          total_small: number | null
          total_very_small: number | null
          very_small_perc: number | null
          very_small_row1: number | null
          very_small_row2: number | null
          very_small_row3: number | null
          very_small_weight: number | null
        }
        Insert: {
          area?: number | null
          avg_nitrate_no1?: number | null
          avg_nitrate_no2?: number | null
          avg_nitrate_no3?: number | null
          avg_nitrate_row1?: number | null
          avg_nitrate_row2?: number | null
          avg_nitrate_row3?: number | null
          avg_total_nitrate?: number | null
          created_at?: string
          defect_perc?: number | null
          defect_row1?: number | null
          defect_row2?: number | null
          defect_row3?: number | null
          destroyed_perc?: number | null
          destroyed_row1?: number | null
          destroyed_row2?: number | null
          destroyed_row3?: number | null
          farmerid?: string | null
          first_prediction_product?: number | null
          force_date?: string | null
          force_plant?: number | null
          good_products?: number | null
          id: string
          inspection_date?: string | null
          inspectorid?: string | null
          large_perc?: number | null
          large_row1?: number | null
          large_row2?: number | null
          large_row3?: number | null
          large_weight?: number | null
          m_y_force?: string | null
          m_y_plot?: string | null
          nitrate_row1_no1?: number | null
          nitrate_row1_no2?: number | null
          nitrate_row1_no3?: number | null
          nitrate_row2_no1?: number | null
          nitrate_row2_no2?: number | null
          nitrate_row2_no3?: number | null
          nitrate_row3_no1?: number | null
          nitrate_row3_no2?: number | null
          nitrate_row3_no3?: number | null
          normal_perc?: number | null
          photo?: string | null
          platationid?: string | null
          prediction_product_kg?: number | null
          small_perc?: number | null
          small_row1?: number | null
          small_row2?: number | null
          small_row3?: number | null
          small_weight?: number | null
          total_all?: number | null
          total_defect?: number | null
          total_destroyed?: number | null
          total_large?: number | null
          total_row1?: number | null
          total_row2?: number | null
          total_row3?: number | null
          total_small?: number | null
          total_very_small?: number | null
          very_small_perc?: number | null
          very_small_row1?: number | null
          very_small_row2?: number | null
          very_small_row3?: number | null
          very_small_weight?: number | null
        }
        Update: {
          area?: number | null
          avg_nitrate_no1?: number | null
          avg_nitrate_no2?: number | null
          avg_nitrate_no3?: number | null
          avg_nitrate_row1?: number | null
          avg_nitrate_row2?: number | null
          avg_nitrate_row3?: number | null
          avg_total_nitrate?: number | null
          created_at?: string
          defect_perc?: number | null
          defect_row1?: number | null
          defect_row2?: number | null
          defect_row3?: number | null
          destroyed_perc?: number | null
          destroyed_row1?: number | null
          destroyed_row2?: number | null
          destroyed_row3?: number | null
          farmerid?: string | null
          first_prediction_product?: number | null
          force_date?: string | null
          force_plant?: number | null
          good_products?: number | null
          id?: string
          inspection_date?: string | null
          inspectorid?: string | null
          large_perc?: number | null
          large_row1?: number | null
          large_row2?: number | null
          large_row3?: number | null
          large_weight?: number | null
          m_y_force?: string | null
          m_y_plot?: string | null
          nitrate_row1_no1?: number | null
          nitrate_row1_no2?: number | null
          nitrate_row1_no3?: number | null
          nitrate_row2_no1?: number | null
          nitrate_row2_no2?: number | null
          nitrate_row2_no3?: number | null
          nitrate_row3_no1?: number | null
          nitrate_row3_no2?: number | null
          nitrate_row3_no3?: number | null
          normal_perc?: number | null
          photo?: string | null
          platationid?: string | null
          prediction_product_kg?: number | null
          small_perc?: number | null
          small_row1?: number | null
          small_row2?: number | null
          small_row3?: number | null
          small_weight?: number | null
          total_all?: number | null
          total_defect?: number | null
          total_destroyed?: number | null
          total_large?: number | null
          total_row1?: number | null
          total_row2?: number | null
          total_row3?: number | null
          total_small?: number | null
          total_very_small?: number | null
          very_small_perc?: number | null
          very_small_row1?: number | null
          very_small_row2?: number | null
          very_small_row3?: number | null
          very_small_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "120days_farmerid_fkey"
            columns: ["farmerid"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "120days_inspectorid_fkey"
            columns: ["inspectorid"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "120days_platationid_fkey"
            columns: ["platationid"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      "140days": {
        Row: {
          area: number | null
          avg_nitrate_no1: number | null
          avg_nitrate_no2: number | null
          avg_nitrate_no3: number | null
          avg_nitrate_row1: number | null
          avg_nitrate_row2: number | null
          avg_nitrate_row3: number | null
          avg_total_nitrate: number | null
          created_at: string
          defect_perc: number | null
          defect_row1: number | null
          defect_row2: number | null
          defect_row3: number | null
          destroyed_perc: number | null
          destroyed_row1: number | null
          destroyed_row2: number | null
          destroyed_row3: number | null
          farmerid: string | null
          first_prediction_product: number | null
          force_date: string | null
          force_plant: number | null
          good_products: number | null
          id: string
          inspection_date: string | null
          inspectorid: string | null
          large_perc: number | null
          large_row1: number | null
          large_row2: number | null
          large_row3: number | null
          large_weight: number | null
          m_y_force: string | null
          m_y_plot: string | null
          nitrate_row1_no1: number | null
          nitrate_row1_no2: number | null
          nitrate_row1_no3: number | null
          nitrate_row2_no1: number | null
          nitrate_row2_no2: number | null
          nitrate_row2_no3: number | null
          nitrate_row3_no1: number | null
          nitrate_row3_no2: number | null
          nitrate_row3_no3: number | null
          normal_perc: number | null
          photo: string | null
          platationid: string | null
          prediction_product_kg: number | null
          small_perc: number | null
          small_row1: number | null
          small_row2: number | null
          small_row3: number | null
          small_weight: number | null
          total_all: number | null
          total_defect: number | null
          total_destroyed: number | null
          total_large: number | null
          total_row1: number | null
          total_row2: number | null
          total_row3: number | null
          total_small: number | null
          total_very_small: number | null
          very_small_perc: number | null
          very_small_row1: number | null
          very_small_row2: number | null
          very_small_row3: number | null
          very_small_weight: number | null
        }
        Insert: {
          area?: number | null
          avg_nitrate_no1?: number | null
          avg_nitrate_no2?: number | null
          avg_nitrate_no3?: number | null
          avg_nitrate_row1?: number | null
          avg_nitrate_row2?: number | null
          avg_nitrate_row3?: number | null
          avg_total_nitrate?: number | null
          created_at?: string
          defect_perc?: number | null
          defect_row1?: number | null
          defect_row2?: number | null
          defect_row3?: number | null
          destroyed_perc?: number | null
          destroyed_row1?: number | null
          destroyed_row2?: number | null
          destroyed_row3?: number | null
          farmerid?: string | null
          first_prediction_product?: number | null
          force_date?: string | null
          force_plant?: number | null
          good_products?: number | null
          id: string
          inspection_date?: string | null
          inspectorid?: string | null
          large_perc?: number | null
          large_row1?: number | null
          large_row2?: number | null
          large_row3?: number | null
          large_weight?: number | null
          m_y_force?: string | null
          m_y_plot?: string | null
          nitrate_row1_no1?: number | null
          nitrate_row1_no2?: number | null
          nitrate_row1_no3?: number | null
          nitrate_row2_no1?: number | null
          nitrate_row2_no2?: number | null
          nitrate_row2_no3?: number | null
          nitrate_row3_no1?: number | null
          nitrate_row3_no2?: number | null
          nitrate_row3_no3?: number | null
          normal_perc?: number | null
          photo?: string | null
          platationid?: string | null
          prediction_product_kg?: number | null
          small_perc?: number | null
          small_row1?: number | null
          small_row2?: number | null
          small_row3?: number | null
          small_weight?: number | null
          total_all?: number | null
          total_defect?: number | null
          total_destroyed?: number | null
          total_large?: number | null
          total_row1?: number | null
          total_row2?: number | null
          total_row3?: number | null
          total_small?: number | null
          total_very_small?: number | null
          very_small_perc?: number | null
          very_small_row1?: number | null
          very_small_row2?: number | null
          very_small_row3?: number | null
          very_small_weight?: number | null
        }
        Update: {
          area?: number | null
          avg_nitrate_no1?: number | null
          avg_nitrate_no2?: number | null
          avg_nitrate_no3?: number | null
          avg_nitrate_row1?: number | null
          avg_nitrate_row2?: number | null
          avg_nitrate_row3?: number | null
          avg_total_nitrate?: number | null
          created_at?: string
          defect_perc?: number | null
          defect_row1?: number | null
          defect_row2?: number | null
          defect_row3?: number | null
          destroyed_perc?: number | null
          destroyed_row1?: number | null
          destroyed_row2?: number | null
          destroyed_row3?: number | null
          farmerid?: string | null
          first_prediction_product?: number | null
          force_date?: string | null
          force_plant?: number | null
          good_products?: number | null
          id?: string
          inspection_date?: string | null
          inspectorid?: string | null
          large_perc?: number | null
          large_row1?: number | null
          large_row2?: number | null
          large_row3?: number | null
          large_weight?: number | null
          m_y_force?: string | null
          m_y_plot?: string | null
          nitrate_row1_no1?: number | null
          nitrate_row1_no2?: number | null
          nitrate_row1_no3?: number | null
          nitrate_row2_no1?: number | null
          nitrate_row2_no2?: number | null
          nitrate_row2_no3?: number | null
          nitrate_row3_no1?: number | null
          nitrate_row3_no2?: number | null
          nitrate_row3_no3?: number | null
          normal_perc?: number | null
          photo?: string | null
          platationid?: string | null
          prediction_product_kg?: number | null
          small_perc?: number | null
          small_row1?: number | null
          small_row2?: number | null
          small_row3?: number | null
          small_weight?: number | null
          total_all?: number | null
          total_defect?: number | null
          total_destroyed?: number | null
          total_large?: number | null
          total_row1?: number | null
          total_row2?: number | null
          total_row3?: number | null
          total_small?: number | null
          total_very_small?: number | null
          very_small_perc?: number | null
          very_small_row1?: number | null
          very_small_row2?: number | null
          very_small_row3?: number | null
          very_small_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "140days_farmerid_fkey"
            columns: ["farmerid"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "140days_inspectorid_fkey"
            columns: ["inspectorid"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "140days_platationid_fkey"
            columns: ["platationid"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      "60days": {
        Row: {
          Area: number | null
          created_at: string
          est_harvest_date: string | null
          est_products: number | null
          farmerid: string | null
          force_date: string | null
          force_plant: number | null
          fruiting_perc: number | null
          fruiting_row1: number | null
          fruiting_row2: number | null
          fruiting_row3: number | null
          id: string
          inspection_date: string | null
          inspectorid: string | null
          m_y_force: string | null
          "M-Y plot": string | null
          "non-fruiting_perc": number | null
          "Non-fruiting_row1": number | null
          "non-fruiting_row2": number | null
          "non-fruiting_row3": number | null
          plant_photo: string | null
          plantationid: string | null
          productive_plant: number | null
          total_all: number | null
          total_fruiting: number | null
          "total_non-fruiting": number | null
          total_row1: number | null
          total_row2: number | null
          total_row3: number | null
        }
        Insert: {
          Area?: number | null
          created_at?: string
          est_harvest_date?: string | null
          est_products?: number | null
          farmerid?: string | null
          force_date?: string | null
          force_plant?: number | null
          fruiting_perc?: number | null
          fruiting_row1?: number | null
          fruiting_row2?: number | null
          fruiting_row3?: number | null
          id: string
          inspection_date?: string | null
          inspectorid?: string | null
          m_y_force?: string | null
          "M-Y plot"?: string | null
          "non-fruiting_perc"?: number | null
          "Non-fruiting_row1"?: number | null
          "non-fruiting_row2"?: number | null
          "non-fruiting_row3"?: number | null
          plant_photo?: string | null
          plantationid?: string | null
          productive_plant?: number | null
          total_all?: number | null
          total_fruiting?: number | null
          "total_non-fruiting"?: number | null
          total_row1?: number | null
          total_row2?: number | null
          total_row3?: number | null
        }
        Update: {
          Area?: number | null
          created_at?: string
          est_harvest_date?: string | null
          est_products?: number | null
          farmerid?: string | null
          force_date?: string | null
          force_plant?: number | null
          fruiting_perc?: number | null
          fruiting_row1?: number | null
          fruiting_row2?: number | null
          fruiting_row3?: number | null
          id?: string
          inspection_date?: string | null
          inspectorid?: string | null
          m_y_force?: string | null
          "M-Y plot"?: string | null
          "non-fruiting_perc"?: number | null
          "Non-fruiting_row1"?: number | null
          "non-fruiting_row2"?: number | null
          "non-fruiting_row3"?: number | null
          plant_photo?: string | null
          plantationid?: string | null
          productive_plant?: number | null
          total_all?: number | null
          total_fruiting?: number | null
          "total_non-fruiting"?: number | null
          total_row1?: number | null
          total_row2?: number | null
          total_row3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "60days_farmerid_fkey"
            columns: ["farmerid"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "60days_inspectorid_fkey"
            columns: ["inspectorid"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "60days_plantationid_fkey"
            columns: ["plantationid"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          account_no: string | null
          address: string | null
          bank: string | null
          bookbank_photo: string | null
          branch: string | null
          contract: boolean | null
          created_at: string
          district: string | null
          farmer_name: string
          farmer_no: string | null
          id: string
          id_card_photo: string | null
          inspector_id: string
          profile_photo: string | null
          province: string | null
          subdistrict: string | null
        }
        Insert: {
          account_no?: string | null
          address?: string | null
          bank?: string | null
          bookbank_photo?: string | null
          branch?: string | null
          contract?: boolean | null
          created_at?: string
          district?: string | null
          farmer_name: string
          farmer_no?: string | null
          id?: string
          id_card_photo?: string | null
          inspector_id: string
          profile_photo?: string | null
          province?: string | null
          subdistrict?: string | null
        }
        Update: {
          account_no?: string | null
          address?: string | null
          bank?: string | null
          bookbank_photo?: string | null
          branch?: string | null
          contract?: boolean | null
          created_at?: string
          district?: string | null
          farmer_name?: string
          farmer_no?: string | null
          id?: string
          id_card_photo?: string | null
          inspector_id?: string
          profile_photo?: string | null
          province?: string | null
          subdistrict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_plan: {
        Row: {
          actual_date: string | null
          actual_forcing: number | null
          actual_havest: number | null
          created_at: string
          est_error: number | null
          farmerid: string | null
          harvest_plan: number | null
          id: string
          inspectorid: string | null
          low_quality: number | null
          move_from_previous_week: number | null
          move_to_previous_week: number | null
          out_plan: number | null
          plantationid: string | null
          postpone_another_week: number | null
          predict_date: string | null
          sale_elsewhere: number | null
          week: string | null
        }
        Insert: {
          actual_date?: string | null
          actual_forcing?: number | null
          actual_havest?: number | null
          created_at?: string
          est_error?: number | null
          farmerid?: string | null
          harvest_plan?: number | null
          id: string
          inspectorid?: string | null
          low_quality?: number | null
          move_from_previous_week?: number | null
          move_to_previous_week?: number | null
          out_plan?: number | null
          plantationid?: string | null
          postpone_another_week?: number | null
          predict_date?: string | null
          sale_elsewhere?: number | null
          week?: string | null
        }
        Update: {
          actual_date?: string | null
          actual_forcing?: number | null
          actual_havest?: number | null
          created_at?: string
          est_error?: number | null
          farmerid?: string | null
          harvest_plan?: number | null
          id?: string
          inspectorid?: string | null
          low_quality?: number | null
          move_from_previous_week?: number | null
          move_to_previous_week?: number | null
          out_plan?: number | null
          plantationid?: string | null
          postpone_another_week?: number | null
          predict_date?: string | null
          sale_elsewhere?: number | null
          week?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvest_plan_farmerid_fkey"
            columns: ["farmerid"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_plan_inspectorid_fkey"
            columns: ["inspectorid"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_plan_plantationid_fkey"
            columns: ["plantationid"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          average_weight: number | null
          created_at: string
          date: string
          Environment: string | null
          farmerid: string | null
          id: string
          inspectorid: string | null
          inter_crop: string | null
          large: number | null
          medium: number | null
          plantation_id: string
          previous_weight: number | null
          small: number | null
          sub_small: number | null
          very_large: number | null
          การตาย: string | null
          รอบติดตาม: string
          โรค: string | null
        }
        Insert: {
          average_weight?: number | null
          created_at?: string
          date: string
          Environment?: string | null
          farmerid?: string | null
          id?: string
          inspectorid?: string | null
          inter_crop?: string | null
          large?: number | null
          medium?: number | null
          plantation_id: string
          previous_weight?: number | null
          small?: number | null
          sub_small?: number | null
          very_large?: number | null
          การตาย?: string | null
          รอบติดตาม: string
          โรค?: string | null
        }
        Update: {
          average_weight?: number | null
          created_at?: string
          date?: string
          Environment?: string | null
          farmerid?: string | null
          id?: string
          inspectorid?: string | null
          inter_crop?: string | null
          large?: number | null
          medium?: number | null
          plantation_id?: string
          previous_weight?: number | null
          small?: number | null
          sub_small?: number | null
          very_large?: number | null
          การตาย?: string | null
          รอบติดตาม?: string
          โรค?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_farmerid_fkey"
            columns: ["farmerid"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_inspectorid_fkey"
            columns: ["inspectorid"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_plantation_id_fkey"
            columns: ["plantation_id"]
            isOneToOne: false
            referencedRelation: "plantations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspectors: {
        Row: {
          created_at: string
          email: string | null
          "Full name": string | null
          id: string
          Name: string | null
          phone: string | null
          photo: string | null
          position: string | null
          User: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          "Full name"?: string | null
          id?: string
          Name?: string | null
          phone?: string | null
          photo?: string | null
          position?: string | null
          User?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          "Full name"?: string | null
          id?: string
          Name?: string | null
          phone?: string | null
          photo?: string | null
          position?: string | null
          User?: string | null
        }
        Relationships: []
      }
      plantations: {
        Row: {
          "120_days_after_force": string | null
          "140_days_after_force": string | null
          "60_days_after_force": string | null
          address: string | null
          area: number | null
          created_at: string
          district: string | null
          farmer_id: string
          first_force_date: string | null
          force_month: string | null
          force_plant: number | null
          id: string
          inspectorid: string | null
          inter_crop: string | null
          lat: number | null
          long: number | null
          photo: string | null
          plant_per_rai: string | null
          plant_spacing: string | null
          plantation_name: string
          "plot's_month": string | null
          "plot's_type": string | null
          province: string | null
          second_force_date: string | null
          subdistrict: string | null
          total_plant: number | null
          total_plant_register: number | null
          "จุก/หน่อ": string | null
        }
        Insert: {
          "120_days_after_force"?: string | null
          "140_days_after_force"?: string | null
          "60_days_after_force"?: string | null
          address?: string | null
          area?: number | null
          created_at?: string
          district?: string | null
          farmer_id: string
          first_force_date?: string | null
          force_month?: string | null
          force_plant?: number | null
          id?: string
          inspectorid?: string | null
          inter_crop?: string | null
          lat?: number | null
          long?: number | null
          photo?: string | null
          plant_per_rai?: string | null
          plant_spacing?: string | null
          plantation_name: string
          "plot's_month"?: string | null
          "plot's_type"?: string | null
          province?: string | null
          second_force_date?: string | null
          subdistrict?: string | null
          total_plant?: number | null
          total_plant_register?: number | null
          "จุก/หน่อ"?: string | null
        }
        Update: {
          "120_days_after_force"?: string | null
          "140_days_after_force"?: string | null
          "60_days_after_force"?: string | null
          address?: string | null
          area?: number | null
          created_at?: string
          district?: string | null
          farmer_id?: string
          first_force_date?: string | null
          force_month?: string | null
          force_plant?: number | null
          id?: string
          inspectorid?: string | null
          inter_crop?: string | null
          lat?: number | null
          long?: number | null
          photo?: string | null
          plant_per_rai?: string | null
          plant_spacing?: string | null
          plantation_name?: string
          "plot's_month"?: string | null
          "plot's_type"?: string | null
          province?: string | null
          second_force_date?: string | null
          subdistrict?: string | null
          total_plant?: number | null
          total_plant_register?: number | null
          "จุก/หน่อ"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plantations_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantations_inspectorid_fkey"
            columns: ["inspectorid"]
            isOneToOne: false
            referencedRelation: "inspectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
