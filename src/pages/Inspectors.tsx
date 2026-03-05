import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Inspector } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, User, Phone, Mail, Briefcase } from 'lucide-react';

const emptyInspector = { name: '', phone: '', email: '', position: '', photo: '' };

const Inspectors = () => {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyInspector);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchInspectors = async () => {
    const { data, error } = await supabase.from('inspectors').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setInspectors(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInspectors(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }

    if (editId) {
      const { error } = await supabase.from('inspectors').update(form).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Inspector updated'); setDialogOpen(false); }
    } else {
      const { error } = await supabase.from('inspectors').insert([form]);
      if (error) toast.error(error.message);
      else { toast.success('Inspector created'); setDialogOpen(false); }
    }
    setForm(emptyInspector);
    setEditId(null);
    fetchInspectors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inspector?')) return;
    const { error } = await supabase.from('inspectors').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchInspectors(); }
  };

  const openEdit = (ins: Inspector) => {
    setForm({ name: ins.name, phone: ins.phone, email: ins.email, position: ins.position, photo: ins.photo || '' });
    setEditId(ins.id);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setForm(emptyInspector);
    setEditId(null);
    setDialogOpen(true);
  };

  const filtered = inspectors.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspectors</h1>
          <p className="text-muted-foreground text-sm">{inspectors.length} total inspectors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Inspector</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} Inspector</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Position</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
              <div><Label>Photo URL</Label><Input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inspectors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No inspectors found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(ins => (
            <Card key={ins.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  {ins.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {ins.phone && <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{ins.phone}</p>}
                {ins.email && <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{ins.email}</p>}
                {ins.position && <p className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-3.5 w-3.5" />{ins.position}</p>}
                <div className="flex gap-2 pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(ins)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/inspectors/${ins.id}/farmers`)}>View Farmers</Button>
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => handleDelete(ins.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inspectors;
