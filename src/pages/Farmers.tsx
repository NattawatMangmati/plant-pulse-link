import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Farmer, Inspector } from '@/types/database';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, MapPin, CreditCard, FileText } from 'lucide-react';

const emptyFarmer = { farmer_name: '', farmer_no: '', address: '', province: '', district: '', subdistrict: '', bank: '', account_no: '', branch: '', contract: false };

const Farmers = () => {
  const { inspectorId } = useParams<{ inspectorId: string }>();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyFarmer);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

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
      bank: f.bank || '',
      account_no: f.account_no || '',
      branch: f.branch || '',
      contract: f.contract || false,
    });
    setEditId(f.id);
    setDialogOpen(true);
  };

  const openCreate = () => { setForm(emptyFarmer); setEditId(null); setDialogOpen(true); };

  const filtered = farmers.filter(f =>
    f.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.farmer_no || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Farmers</h1>
          <p className="text-muted-foreground text-sm">
            {inspector ? `Inspector: ${inspector.Name}` : ''} · {farmers.length} farmers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Farmer</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} Farmer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Farmer Name *</Label><Input value={form.farmer_name} onChange={e => setForm({ ...form, farmer_name: e.target.value })} /></div>
              <div><Label>Farmer No</Label><Input value={form.farmer_no} onChange={e => setForm({ ...form, farmer_no: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Province</Label><Input value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>Subdistrict</Label><Input value={form.subdistrict} onChange={e => setForm({ ...form, subdistrict: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Bank</Label><Input value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} /></div>
                <div><Label>Account No</Label><Input value={form.account_no} onChange={e => setForm({ ...form, account_no: e.target.value })} /></div>
                <div><Label>Branch</Label><Input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Contract</Label>
                <Switch checked={form.contract} onCheckedChange={val => setForm({ ...form, contract: val })} />
              </div>
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
                <CardTitle className="text-lg">{f.farmer_name}</CardTitle>
                {f.farmer_no && <p className="text-sm text-muted-foreground">#{f.farmer_no}</p>}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {f.address && <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{f.address}</p>}
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
