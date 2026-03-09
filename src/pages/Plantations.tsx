import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plantation, Farmer, InspectionType } from '@/types/database';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, ClipboardCheck, Clock, CalendarCheck, Sprout } from 'lucide-react';
import { thailandLocations } from '@/data/thailand-locations';

const inspectionTypes: { type: InspectionType; label: string; icon: typeof ClipboardCheck }[] = [
  { type: 'inspection', label: 'Inspection', icon: ClipboardCheck },
  { type: 'after_60', label: 'After 60 Days', icon: Clock },
  { type: 'after_120', label: 'After 120 Days', icon: Clock },
  { type: 'after_140', label: 'After 140 Days', icon: Clock },
  { type: 'harvest_plan', label: 'Harvest Plan', icon: CalendarCheck },
];

const plotTypeOptions = ['ต้นใหม่', 'เลี้ยงตอ'];
const interCropOptions = ['แซมยางพารา', 'แซมปาล์ม', 'แซมทุเรียน', 'แซมมะพร้าว', 'พื้นที่เปล่า'];
const plantSpacingOptions = ['ร่องคู่ 2 แถว 35 x 40 (ปูพื้น)', 'ร่องคู่ 4 แถว 35 x 35 (ยกร่อง)', 'ร่องคู่ 4 แถว 30 x 35 (ยกร่อง)'];
const plantPerRaiOptions = Array.from({ length: 17 }, (_, i) => String(4000 + i * 500));

const generateForceMonthOptions = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const options: string[] = [];
  for (let year = 2025; year <= 2028; year++) {
    for (const month of months) {
      options.push(`${month}-${year}`);
    }
  }
  return options;
};
const forceMonthOptions = generateForceMonthOptions();

const generateMonthYearOptions = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const options: string[] = [];
  for (let year = 2024; year <= 2027; year++) {
    for (const month of months) {
      options.push(`${month}-${year}`);
    }
  }
  return options;
};

const monthYearOptions = generateMonthYearOptions();

interface PlantationForm {
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
}

const emptyForm: PlantationForm = {
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
};

const Plantations = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<PlantationForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

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

  const fetchData = async () => {
    if (!farmerId) return;
    const [pRes, fRes] = await Promise.all([
      supabase.from('plantations').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
      supabase.from('farmers').select('*').eq('id', farmerId).single(),
    ]);
    if (pRes.error) toast.error(pRes.error.message);
    else setPlantations((pRes.data as unknown as Plantation[]) || []);
    if (fRes.data) setFarmer(fRes.data as unknown as Farmer);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [farmerId]);

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
    };

    if (editId) {
      const { error } = await supabase.from('plantations').update(payload as any).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Updated'); setDialogOpen(false); }
    } else {
      const { error } = await supabase.from('plantations').insert([{ ...payload, farmer_id: farmerId! } as any]);
      if (error) toast.error(error.message);
      else { toast.success('Created'); setDialogOpen(false); }
    }
    setForm({ ...emptyForm });
    setEditId(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plantation?')) return;
    const { error } = await supabase.from('plantations').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchData(); }
  };

  const openEdit = (p: Plantation) => {
    setForm({
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
    });
    setEditId(p.id);
    setDialogOpen(true);
  };

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setDialogOpen(true); };

  const updateField = (field: keyof PlantationForm, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Reset cascading fields
      if (field === 'province') {
        next.district = '';
        next.subdistrict = '';
      }
      if (field === 'district') {
        next.subdistrict = '';
      }
      return next;
    });
  };

  const filtered = plantations.filter(p => (p.plantation_name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plantations</h1>
          <p className="text-muted-foreground text-sm">
            {farmer ? `Farmer: ${farmer.farmer_name}` : ''} · {plantations.length} plantations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Plantation</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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

              {/* 3. Province */}
              <div className="space-y-1">
                <Label>Province</Label>
                <Select value={form.province} onValueChange={v => updateField('province', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกจังหวัด" /></SelectTrigger>
                  <SelectContent>
                    {provinces.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. District */}
              <div className="space-y-1">
                <Label>District</Label>
                <Select value={form.district} onValueChange={v => updateField('district', v)} disabled={!form.province}>
                  <SelectTrigger><SelectValue placeholder="เลือกอำเภอ/เขต" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Subdistrict */}
              <div className="space-y-1">
                <Label>Subdistrict</Label>
                <Select value={form.subdistrict} onValueChange={v => updateField('subdistrict', v)} disabled={!form.district}>
                  <SelectTrigger><SelectValue placeholder="เลือกตำบล/แขวง" /></SelectTrigger>
                  <SelectContent>
                    {subdistricts.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Plot's Month */}
              <div className="space-y-1">
                <Label>Plot's Month</Label>
                <Select value={form.plots_month} onValueChange={v => updateField('plots_month', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกเดือน-ปี" /></SelectTrigger>
                  <SelectContent>
                    {monthYearOptions.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 7. Plot's Type */}
              <div className="space-y-1">
                <Label>Plot's Type</Label>
                <Select value={form.plots_type} onValueChange={v => updateField('plots_type', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                  <SelectContent>
                    {plotTypeOptions.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 8. Force Month */}
              <div className="space-y-1">
                <Label>Force Month</Label>
                <Select value={form.force_month} onValueChange={v => updateField('force_month', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกเดือน-ปี" /></SelectTrigger>
                  <SelectContent>
                    {forceMonthOptions.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 9. Inter Crop */}
              <div className="space-y-1">
                <Label>Inter Crop</Label>
                <Select value={form.inter_crop} onValueChange={v => updateField('inter_crop', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกพืชแซม" /></SelectTrigger>
                  <SelectContent>
                    {interCropOptions.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 10. Plant Spacing */}
              <div className="space-y-1">
                <Label>Plant Spacing</Label>
                <Select value={form.plant_spacing} onValueChange={v => updateField('plant_spacing', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกระยะปลูก" /></SelectTrigger>
                  <SelectContent>
                    {plantSpacingOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 11. จุก/หน่อ */}
              <div className="space-y-1">
                <Label>จุก/หน่อ</Label>
                <Input value={form.juk_noo} onChange={e => updateField('juk_noo', e.target.value)} placeholder="ระบุจุก/หน่อ" />
              </div>

              {/* 12. Plant per Rai */}
              <div className="space-y-1">
                <Label>Plant per Rai</Label>
                <Select value={form.plant_per_rai} onValueChange={v => updateField('plant_per_rai', v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกจำนวนต้น/ไร่" /></SelectTrigger>
                  <SelectContent>
                    {plantPerRaiOptions.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search plantations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No plantations found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  {p.plantation_name}
                </CardTitle>
                {p.province && (
                  <p className="text-xs text-muted-foreground">
                    {[p.subdistrict, p.district, p.province].filter(Boolean).join(', ')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {inspectionTypes.map(({ type, label, icon: Icon }) => (
                    <Button key={type} size="sm" variant="outline" className="justify-start text-xs" onClick={() => navigate(`/plantations/${p.id}/inspections/${type}`)}>
                      <Icon className="h-3.5 w-3.5 mr-1.5" />{label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => handleDelete(p.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Plantations;
