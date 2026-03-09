import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, parse } from 'date-fns';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { thailandLocations } from '@/data/thailand-locations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plantation } from '@/types/database';
import LocationPicker from './LocationPicker';

const plotTypeOptions = ['ต้นใหม่', 'เลี้ยงตอ'];
const interCropOptions = ['แซมยางพารา', 'แซมปาล์ม', 'แซมทุเรียน', 'แซมมะพร้าว', 'พื้นที่เปล่า'];
const plantSpacingOptions = ['ร่องคู่ 2 แถว 35 x 40 (ปูพื้น)', 'ร่องคู่ 4 แถว 35 x 35 (ยกร่อง)', 'ร่องคู่ 4 แถว 30 x 35 (ยกร่อง)'];
const plantPerRaiOptions = Array.from({ length: 17 }, (_, i) => String(4000 + i * 500));

const generateMonthOptions = (startYear: number, endYear: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const options: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (const month of months) {
      options.push(`${month}-${year}`);
    }
  }
  return options;
};

const monthYearOptions = generateMonthOptions(2024, 2027);
const forceMonthOptions = generateMonthOptions(2025, 2028);

export interface PlantationForm {
  plantation_name: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  plots_month: string;
  plots_type: string;
  force_month: string;
  inter_crop: string;
  plant_spacing: string;
  juk_noo: string;
  plant_per_rai: string;
  area: string;
  total_plant_register: string;
  force_plant: string;
  first_force_date: Date | undefined;
  second_force_date: Date | undefined;
  photo: string;
  lat: number | null;
  lng: number | null;
}

export const emptyForm: PlantationForm = {
  plantation_name: '',
  address: '',
  province: '',
  district: '',
  subdistrict: '',
  plots_month: '',
  plots_type: '',
  force_month: '',
  inter_crop: '',
  plant_spacing: '',
  juk_noo: '',
  plant_per_rai: '',
  area: '',
  total_plant_register: '',
  force_plant: '',
  first_force_date: undefined,
  second_force_date: undefined,
  photo: '',
  lat: null,
  lng: null,
};

export const plantationToForm = (p: Plantation): PlantationForm => ({
  plantation_name: p.plantation_name || '',
  address: p.address || '',
  province: p.province || '',
  district: p.district || '',
  subdistrict: p.subdistrict || '',
  plots_month: p["plot's_month"] || '',
  plots_type: p["plot's_type"] || '',
  force_month: p.force_month || '',
  inter_crop: p.inter_crop || '',
  plant_spacing: p.plant_spacing || '',
  juk_noo: p["จุก/หน่อ"] || '',
  plant_per_rai: p.plant_per_rai || '',
  area: p.area != null ? String(p.area) : '',
  total_plant_register: p.total_plant_register != null ? String(p.total_plant_register) : '',
  force_plant: p.force_plant != null ? String(p.force_plant) : '',
  first_force_date: p.first_force_date ? new Date(p.first_force_date) : undefined,
  second_force_date: p.second_force_date ? new Date(p.second_force_date) : undefined,
  photo: p.photo || '',
  lat: p.lat ?? null,
  lng: p.long ?? null,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: PlantationForm;
  setForm: React.Dispatch<React.SetStateAction<PlantationForm>>;
  farmerId: string;
  onSaved: () => void;
}

export default function PlantationFormDialog({ open, onOpenChange, editId, form, setForm, farmerId, onSaved }: Props) {
  const [uploading, setUploading] = useState(false);

  const provinces = useMemo(() => thailandLocations.map(l => l.province), []);
  const districts = useMemo(() => {
    if (!form.province) return [];
    const loc = thailandLocations.find(l => l.province === form.province);
    return loc ? loc.districts.map(d => d.name) : [];
  }, [form.province]);
  const subdistricts = useMemo(() => {
    if (!form.province || !form.district) return [];
    const loc = thailandLocations.find(l => l.province === form.province);
    const dist = loc?.districts.find(d => d.name === form.district);
    return dist ? dist.subdistricts : [];
  }, [form.province, form.district]);

  const updateField = useCallback((field: keyof PlantationForm, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'province') { next.district = ''; next.subdistrict = ''; }
      if (field === 'district') { next.subdistrict = ''; }
      return next;
    });
  }, [setForm]);

  // Auto-calculate total_plant
  const totalPlant = useMemo(() => {
    const ppr = parseFloat(form.plant_per_rai);
    const area = parseFloat(form.area);
    if (!isNaN(ppr) && !isNaN(area)) return Math.round(ppr * area);
    return null;
  }, [form.plant_per_rai, form.area]);

  // Auto-calculate days after force
  const daysAfter60 = form.second_force_date ? addDays(form.second_force_date, 60) : null;
  const daysAfter120 = form.second_force_date ? addDays(form.second_force_date, 120) : null;
  const daysAfter140 = form.second_force_date ? addDays(form.second_force_date, 140) : null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${farmerId}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('Plantation photo').upload(filePath, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('Plantation photo').getPublicUrl(filePath);
    updateField('photo', urlData.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.plantation_name.trim()) { toast.error('Plantation Name is required'); return; }
    const payload: Record<string, unknown> = {
      plantation_name: form.plantation_name,
      address: form.address || null,
      province: form.province || null,
      district: form.district || null,
      subdistrict: form.subdistrict || null,
      "plot's_month": form.plots_month || null,
      "plot's_type": form.plots_type || null,
      force_month: form.force_month || null,
      inter_crop: form.inter_crop || null,
      plant_spacing: form.plant_spacing || null,
      "จุก/หน่อ": form.juk_noo || null,
      plant_per_rai: form.plant_per_rai || null,
      area: form.area ? parseFloat(form.area) : null,
      total_plant: totalPlant,
      total_plant_register: form.total_plant_register ? parseFloat(form.total_plant_register) : null,
      force_plant: form.force_plant ? parseFloat(form.force_plant) : null,
      first_force_date: form.first_force_date ? format(form.first_force_date, 'yyyy-MM-dd') : null,
      second_force_date: form.second_force_date ? format(form.second_force_date, 'yyyy-MM-dd') : null,
      "60_days_after_force": daysAfter60 ? format(daysAfter60, 'yyyy-MM-dd') : null,
      "120_days_after_force": daysAfter120 ? format(daysAfter120, 'yyyy-MM-dd') : null,
      "140_days_after_force": daysAfter140 ? format(daysAfter140, 'yyyy-MM-dd') : null,
      photo: form.photo || null,
      lat: form.lat,
      long: form.lng,
    };

    if (editId) {
      const { error } = await supabase.from('plantations').update(payload as any).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Updated'); onOpenChange(false); }
    } else {
      const { error } = await supabase.from('plantations').insert([{ ...payload, farmer_id: farmerId } as any]);
      if (error) toast.error(error.message);
      else { toast.success('Created'); onOpenChange(false); }
    }
    onSaved();
  };

  const renderSelect = (label: string, value: string, field: keyof PlantationForm, placeholder: string, options: string[], disabled = false) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={v => updateField(field, v)} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const renderDatePicker = (label: string, value: Date | undefined, field: keyof PlantationForm) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'dd/MM/yyyy') : 'เลือกวันที่'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={d => updateField(field, d)} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} Plantation</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {/* 1. Plantation Name */}
          <div className="space-y-1">
            <Label>Plantation Name *</Label>
            <Input value={form.plantation_name} onChange={e => updateField('plantation_name', e.target.value)} />
          </div>

          {/* 2. Address */}
          <div className="space-y-1">
            <Label>Address</Label>
            <Input value={form.address} onChange={e => updateField('address', e.target.value)} />
          </div>

          {/* 3-5. Province / District / Subdistrict */}
          {renderSelect('Province', form.province, 'province', 'เลือกจังหวัด', provinces)}
          {renderSelect('District', form.district, 'district', 'เลือกอำเภอ/เขต', districts, !form.province)}
          {renderSelect('Subdistrict', form.subdistrict, 'subdistrict', 'เลือกตำบล/แขวง', subdistricts, !form.district)}

          {/* 6-7. Plot's Month / Type */}
          {renderSelect("Plot's Month", form.plots_month, 'plots_month', 'เลือกเดือน-ปี', monthYearOptions)}
          {renderSelect("Plot's Type", form.plots_type, 'plots_type', 'เลือกประเภท', plotTypeOptions)}

          {/* 8-10. Force Month / Inter Crop / Plant Spacing */}
          {renderSelect('Force Month', form.force_month, 'force_month', 'เลือกเดือน-ปี', forceMonthOptions)}
          {renderSelect('Inter Crop', form.inter_crop, 'inter_crop', 'เลือกพืชแซม', interCropOptions)}
          {renderSelect('Plant Spacing', form.plant_spacing, 'plant_spacing', 'เลือกระยะปลูก', plantSpacingOptions)}

          {/* 11. จุก/หน่อ */}
          <div className="space-y-1">
            <Label>จุก/หน่อ</Label>
            <Input value={form.juk_noo} onChange={e => updateField('juk_noo', e.target.value)} placeholder="ระบุจุก/หน่อ" />
          </div>

          {/* 12. Plant per Rai */}
          {renderSelect('Plant per Rai', form.plant_per_rai, 'plant_per_rai', 'เลือกจำนวนต้น/ไร่', plantPerRaiOptions)}

          {/* 13. Area */}
          <div className="space-y-1">
            <Label>Area (ไร่)</Label>
            <Input type="number" value={form.area} onChange={e => updateField('area', e.target.value)} placeholder="ระบุพื้นที่ (ไร่)" />
          </div>

          {/* 14. Total Plant (auto-calculated) */}
          <div className="space-y-1">
            <Label>Total Plant (คำนวณอัตโนมัติ: Plant per Rai × Area)</Label>
            <Input value={totalPlant != null ? String(totalPlant) : ''} disabled className="bg-muted" />
          </div>

          {/* 15. Total Plant Register */}
          <div className="space-y-1">
            <Label>Total Plant Register</Label>
            <Input type="number" value={form.total_plant_register} onChange={e => updateField('total_plant_register', e.target.value)} placeholder="ระบุจำนวนต้นที่ลงทะเบียน" />
          </div>

          {/* 16. Force Plant */}
          <div className="space-y-1">
            <Label>Force Plant</Label>
            <Input type="number" value={form.force_plant} onChange={e => updateField('force_plant', e.target.value)} placeholder="ระบุจำนวนต้นที่บังคับ" />
          </div>

          {/* 17-18. First / Second Force Date */}
          {renderDatePicker('First Force Date', form.first_force_date, 'first_force_date')}
          {renderDatePicker('Second Force Date', form.second_force_date, 'second_force_date')}

          {/* 19-21. Auto-calculated days */}
          <div className="space-y-1">
            <Label>60 Days After Force (คำนวณจาก Second Force Date + 60 วัน)</Label>
            <Input value={daysAfter60 ? format(daysAfter60, 'dd/MM/yyyy') : ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label>120 Days After Force (คำนวณจาก Second Force Date + 120 วัน)</Label>
            <Input value={daysAfter120 ? format(daysAfter120, 'dd/MM/yyyy') : ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label>140 Days After Force (คำนวณจาก Second Force Date + 140 วัน)</Label>
            <Input value={daysAfter140 ? format(daysAfter140, 'dd/MM/yyyy') : ''} disabled className="bg-muted" />
          </div>

          {/* 22. Photo */}
          <div className="space-y-1">
            <Label>Photo</Label>
            {form.photo && (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-border mb-2">
                <img src={form.photo} alt="Plantation" className="w-full h-full object-cover" />
                <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => updateField('photo', '')}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span><Upload className="h-4 w-4 mr-1" />{uploading ? 'Uploading...' : 'Upload Photo'}</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>

          {/* 23. Location */}
          <div className="space-y-1">
            <Label>Location (ปักหมุดบนแผนที่)</Label>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => { updateField('lat', lat); updateField('lng', lng); }}
            />
            {form.lat != null && form.lng != null && (
              <p className="text-xs text-muted-foreground">Lat: {form.lat.toFixed(6)}, Lng: {form.lng.toFixed(6)}</p>
            )}
          </div>

          <Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
