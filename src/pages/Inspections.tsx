import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Inspection, InspectionType } from '@/types/database';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

const typeLabels: Record<InspectionType, string> = {
  inspection: 'Inspection',
  after_45: 'After 45 Days',
  after_90: 'After 90 Days',
  after_120: 'After 120 Days',
  after_140: 'After 140 Days',
  harvest_plan: 'Harvest Plan',
};

const Inspections = () => {
  const { plantationId, type } = useParams<{ plantationId: string; type: InspectionType }>();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    if (!plantationId || !type) return;
    const { data, error } = await supabase.from('inspections').select('*').eq('plantation_id', plantationId).eq('type', type).order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setInspections(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [plantationId, type]);

  const handleSave = async () => {
    if (!details.trim()) { toast.error('Details are required'); return; }

    if (editId) {
      const { error } = await supabase.from('inspections').update({ details }).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Updated'); setDialogOpen(false); }
    } else {
      const { error } = await supabase.from('inspections').insert([{ plantation_id: plantationId!, type: type!, details }]);
      if (error) toast.error(error.message);
      else { toast.success('Created'); setDialogOpen(false); }
    }
    setDetails('');
    setEditId(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    const { error } = await supabase.from('inspections').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchData(); }
  };

  const openEdit = (ins: Inspection) => { setDetails(ins.details); setEditId(ins.id); setDialogOpen(true); };
  const openCreate = () => { setDetails(''); setEditId(null); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{type ? typeLabels[type] : 'Inspections'}</h1>
          <p className="text-muted-foreground text-sm">{inspections.length} records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} {type ? typeLabels[type] : ''} Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Details *</Label><Textarea rows={5} value={details} onChange={e => setDetails(e.target.value)} placeholder="Enter inspection details..." /></div>
              <Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : inspections.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No records found</p>
      ) : (
        <div className="space-y-4">
          {inspections.map(ins => (
            <Card key={ins.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {format(new Date(ins.created_at), 'PPp')}
                  </span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(ins)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ins.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{ins.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inspections;
