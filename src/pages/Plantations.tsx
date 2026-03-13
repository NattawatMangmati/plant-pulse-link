import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plantation, Farmer, InspectionType } from '@/types/database';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Search, ClipboardCheck, Clock, CalendarCheck, Sprout } from 'lucide-react';
import PlantationFormDialog, { PlantationForm, emptyForm, plantationToForm } from '@/components/plantation/PlantationFormDialog';

const inspectionTypes: { type: InspectionType; label: string; icon: typeof ClipboardCheck }[] = [
  { type: 'inspection', label: 'Inspection', icon: ClipboardCheck },
  { type: 'after_60', label: 'After 60 Days', icon: Clock },
  { type: 'after_120', label: 'After 120 Days', icon: Clock },
  { type: 'after_140', label: 'After 140 Days', icon: Clock },
  { type: 'harvest_plan', label: 'Harvest Plan', icon: CalendarCheck },
];

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plantation?')) return;
    const { error } = await supabase.from('plantations').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchData(); }
  };

  const openEdit = (p: Plantation) => {
    setForm(plantationToForm(p));
    setEditId(p.id);
    setDialogOpen(true);
  };

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setDialogOpen(true); };

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
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Plantation</Button>
      </div>

      <PlantationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editId={editId}
        form={form}
        setForm={setForm}
        farmerId={farmerId!}
        onSaved={() => { setForm({ ...emptyForm }); setEditId(null); fetchData(); }}
      />

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
                  {p.plantation_name} - {p.farmer_name}
                </CardTitle>
                {p.province && (
                  <p className="text-xs text-muted-foreground">
                    {[p.farmer_name, p.subdistrict, p.district, p.province].filter(Boolean).join(', ')}
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
