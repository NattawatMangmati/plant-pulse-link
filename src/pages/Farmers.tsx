import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Farmer, Inspector } from '@/types/database';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Plus, Search, MapPin, CreditCard, FileText, Camera, Upload, X, User, CreditCard as CardIcon, BookOpen } from 'lucide-react';
import { getProvinces, getDistricts, getSubdistricts } from '@/data/thailand-locations';
import { thaiBanks } from '@/data/thai-banks';

const emptyFarmer = { 
  farmer_name: '', farmer_no: '', address: '', province: '', district: '', subdistrict: '', 
  contract: false, bank: '', account_no: '', branch: '',
  profile_photo: '', id_card_photo: '', bookbank_photo: ''
};

type PhotoField = 'profile_photo' | 'id_card_photo' | 'bookbank_photo';

const BUCKET_MAP: Record<PhotoField, string> = {
  profile_photo: 'Farmer photo',
  id_card_photo: 'Farmer ID card photo',
  bookbank_photo: 'Farmer bank account photo',
};

const PHOTO_LABELS: Record<PhotoField, { label: string; icon: React.ReactNode }> = {
  profile_photo: { label: 'Profile Photo', icon: <User className="h-4 w-4" /> },
  id_card_photo: { label: 'ID Card Photo', icon: <CardIcon className="h-4 w-4" /> },
  bookbank_photo: { label: 'Bookbank Photo', icon: <BookOpen className="h-4 w-4" /> },
};

const Farmers = () => {
  const { inspectorId } = useParams<{ inspectorId: string }>();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyFarmer);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState<PhotoField | null>(null);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLInputElement>(null);
  const bookbankRef = useRef<HTMLInputElement>(null);

  const fileRefs: Record<PhotoField, React.RefObject<HTMLInputElement>> = {
    profile_photo: profileRef,
    id_card_photo: idCardRef,
    bookbank_photo: bookbankRef,
  };

  const provinces = getProvinces();
  const districts = form.province ? getDistricts(form.province) : [];
  const subdistricts = form.province && form.district ? getSubdistricts(form.province, form.district) : [];

  const fetchData = async () => {
    if (!inspectorId) return;
    const [farmersRes, inspectorRes] = await Promise.all([
      supabase.from('farmers').select('*').eq('inspector_id', inspectorId).order('created_at', { ascending: false }),
      supabase.from('inspectors').select('*').eq('id', inspectorId).single(),
    ]);
    if (farmersRes.error) toast.error(farmersRes.error.message);
    else setFarmers((farmersRes.data as unknown as Farmer[]) || []);
    if (inspectorRes.data) setInspector(inspectorRes.data as unknown as Inspector);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [inspectorId]);

  const handlePhotoUpload = async (field: PhotoField, file: File) => {
    setUploading(field);
    const bucket = BUCKET_MAP[field];
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    setForm(prev => ({ ...prev, [field]: urlData.publicUrl }));
    toast.success('Photo uploaded');
    setUploading(null);
  };

  const handleRemovePhoto = (field: PhotoField) => {
    setForm(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    if (!form.farmer_name.trim()) { toast.error('Farmer name is required'); return; }
    const payload = { ...form, inspector_id: inspectorId! };

    if (editId) {
      const { error } = await supabase.from('farmers').update(payload).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Farmer updated'); setDialogOpen(false); }
    } else {
      const { error } = await supabase.from('farmers').insert([payload]);
      if (error) toast.error(error.message);
      else { toast.success('Farmer created'); setDialogOpen(false); }
    }
    setForm(emptyFarmer);
    setEditId(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this farmer?')) return;
    const { error } = await supabase.from('farmers').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchData(); }
  };

  const openEdit = (f: Farmer) => {
    setForm({
      farmer_name: f.farmer_name,
      farmer_no: f.farmer_no || '',
      address: f.address || '',
      province: f.province || '',
      district: f.district || '',
      subdistrict: f.subdistrict || '',
      contract: f.contract || false,
      bank: f.bank || '',
      account_no: f.account_no || '',
      branch: f.branch || '',
      profile_photo: f.profile_photo || '',
      id_card_photo: f.id_card_photo || '',
      bookbank_photo: f.bookbank_photo || '',
    });
    setEditId(f.id);
    setDialogOpen(true);
  };

  const openCreate = () => { setForm(emptyFarmer); setEditId(null); setDialogOpen(true); };

  const handleProvinceChange = (value: string) => {
    setForm({ ...form, province: value, district: '', subdistrict: '' });
  };

  const handleDistrictChange = (value: string) => {
    setForm({ ...form, district: value, subdistrict: '' });
  };

  const filtered = farmers.filter(f =>
    f.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.farmer_no || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderPhotoUpload = (field: PhotoField) => {
    const { label, icon } = PHOTO_LABELS[field];
    const photoUrl = form[field];
    const isUploading = uploading === field;
    const ref = fileRefs[field];

    return (
      <div key={field}>
        <Label className="flex items-center gap-1.5 mb-2">{icon}{label}</Label>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={ref}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handlePhotoUpload(field, file);
            e.target.value = '';
          }}
        />
        {photoUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt={label}
              className="h-20 w-20 rounded-lg object-cover border border-border"
            />
            <div className="flex flex-col gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={isUploading}>
                <Camera className="h-3.5 w-3.5 mr-1" /> Change
              </Button>
              <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemovePhoto(field)}>
                <X className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full h-20 border-dashed flex flex-col gap-1"
            onClick={() => ref.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="text-sm text-muted-foreground">Uploading...</span>
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload {label.toLowerCase()}</span>
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Farmers</h1>
          <p className="text-muted-foreground text-sm">
            {inspector ? `Inspector: ${inspector.name}` : ''} · {farmers.length} farmers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Farmer</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} Farmer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* 1. Farmer Name */}
              <div><Label>Farmer Name *</Label><Input value={form.farmer_name} onChange={e => setForm({ ...form, farmer_name: e.target.value })} /></div>

              {/* 2. Farmer No */}
              <div><Label>Farmer No</Label><Input value={form.farmer_no} onChange={e => setForm({ ...form, farmer_no: e.target.value })} /></div>

              {/* 3. Address */}
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>

              {/* 4. Province */}
              <div>
                <Label>Province</Label>
                <Select value={form.province} onValueChange={handleProvinceChange}>
                  <SelectTrigger><SelectValue placeholder="เลือกจังหวัด" /></SelectTrigger>
                  <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* 5. District */}
              <div>
                <Label>District</Label>
                <Select value={form.district} onValueChange={handleDistrictChange} disabled={!form.province}>
                  <SelectTrigger><SelectValue placeholder={form.province ? "เลือกอำเภอ/เขต" : "กรุณาเลือกจังหวัดก่อน"} /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* 6. Subdistrict */}
              <div>
                <Label>Subdistrict</Label>
                <Select value={form.subdistrict} onValueChange={v => setForm({ ...form, subdistrict: v })} disabled={!form.district}>
                  <SelectTrigger><SelectValue placeholder={form.district ? "เลือกตำบล/แขวง" : "กรุณาเลือกอำเภอ/เขตก่อน"} /></SelectTrigger>
                  <SelectContent>{subdistricts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* 7. Contract */}
              <div className="flex items-center gap-2">
                <Label>Contract</Label>
                <Switch checked={form.contract} onCheckedChange={val => setForm({ ...form, contract: val })} />
              </div>

              {/* 8. Bank */}
              <div>
                <Label>Bank</Label>
                <Select value={form.bank} onValueChange={v => setForm({ ...form, bank: v })}>
                  <SelectTrigger><SelectValue placeholder="เลือกธนาคาร" /></SelectTrigger>
                  <SelectContent>{thaiBanks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* 9. Account No */}
              <div><Label>Account No</Label><Input value={form.account_no} onChange={e => setForm({ ...form, account_no: e.target.value })} /></div>

              {/* 10. Branch */}
              <div><Label>Branch</Label><Input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} /></div>

              {/* 11. Profile Photo */}
              {renderPhotoUpload('profile_photo')}

              {/* 12. ID Card Photo */}
              {renderPhotoUpload('id_card_photo')}

              {/* 13. Bookbank Photo */}
              {renderPhotoUpload('bookbank_photo')}

              <Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search farmers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No farmers found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(f => (
            <Card key={f.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {f.profile_photo ? <AvatarImage src={f.profile_photo} /> : null}
                    <AvatarFallback>{f.farmer_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{f.farmer_name}</CardTitle>
                    {f.farmer_no && <p className="text-sm text-muted-foreground">#{f.farmer_no}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {f.address && <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{f.address}</p>}
                {f.province && <p className="text-muted-foreground">{f.subdistrict && `${f.subdistrict}, `}{f.district && `${f.district}, `}{f.province}</p>}
                {f.bank && <p className="flex items-center gap-2 text-muted-foreground"><CreditCard className="h-3.5 w-3.5" />{f.bank} - {f.account_no}</p>}
                {f.contract && <p className="flex items-center gap-2 text-muted-foreground"><FileText className="h-3.5 w-3.5" />มีสัญญา</p>}
                <div className="flex gap-2 pt-3 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openEdit(f)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/farmers/${f.id}/plantations`)}>Plantations</Button>
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => handleDelete(f.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Farmers;
