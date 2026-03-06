import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Inspector } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Plus, Search, User, Phone, Mail, Briefcase, Upload, X } from 'lucide-react';

const emptyForm = { Name: '', 'Full name': '', phone: '', email: '', position: '', photo: '' };

const Inspectors = () => {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchInspectors = async () => {
    const { data, error } = await supabase.from('inspectors').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setInspectors((data as unknown as Inspector[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchInspectors(); }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('Inspector photo')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('Inspector photo')
      .getPublicUrl(fileName);

    setForm(prev => ({ ...prev, photo: urlData.publicUrl }));
    setUploading(false);
    toast.success('Photo uploaded');
  };

  const removePhoto = () => {
    setForm(prev => ({ ...prev, photo: '' }));
  };

  const handleSave = async () => {
    if (!form['Full name'].trim()) { toast.error('Full name is required'); return; }

    const payload = {
      Name: form.Name,
      'Full name': form['Full name'],
      phone: form.phone,
      email: form.email,
      position: form.position,
      photo: form.photo,
    };

    if (editId) {
      const { error } = await supabase.from('inspectors').update(payload).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Inspector updated'); setDialogOpen(false); }
    } else {
      const { error } = await supabase.from('inspectors').insert([payload]);
      if (error) toast.error(error.message);
      else { toast.success('Inspector created'); setDialogOpen(false); }
    }
    setForm(emptyForm);
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
    setForm({
      Name: ins.Name || '',
      'Full name': ins['Full name'] || '',
      phone: ins.phone || '',
      email: ins.email || '',
      position: ins.position || '',
      photo: ins.photo || '',
    });
    setEditId(ins.id);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const filtered = inspectors.filter(i =>
    (i['Full name'] || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.Name || '').toLowerCase().includes(search.toLowerCase())
  );

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
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {form.photo ? (
                      <AvatarImage src={form.photo} alt="Inspector photo" />
                    ) : null}
                    <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : form.photo ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {form.photo && (
                      <Button type="button" variant="ghost" size="sm" onClick={removePhoto} className="text-destructive">
                        <X className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div><Label>Full Name *</Label><Input value={form['Full name']} onChange={e => setForm({ ...form, 'Full name': e.target.value })} /></div>
              <div><Label>Name</Label><Input value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Position</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
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
                  <Avatar className="h-9 w-9">
                    {ins.photo ? <AvatarImage src={ins.photo} alt={ins['Full name'] || ''} /> : null}
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                   <div>
                     <div>{ins['Full name'] || ins.Name}</div>
                     {ins.Name && ins['Full name'] && <div className="text-sm font-normal text-muted-foreground">{ins.Name}</div>}
                   </div>
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
