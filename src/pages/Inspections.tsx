import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  after_60: 'After 60 Days',
  after_120: 'After 120 Days',
  after_140: 'After 140 Days',
  harvest_plan: 'Harvest Plan',
};

// Map type to Supabase table and plantation column
const tableConfig: Record<InspectionType, { table: string; plantationCol: string }> = {
  inspection: { table: 'inspections', plantationCol: 'plantation_id' },
  after_60: { table: '60days', plantationCol: 'plantationid' },
  after_120: { table: '120days', plantationCol: 'platationid' },
  after_140: { table: '140days', plantationCol: 'platationid' },
  harvest_plan: { table: 'harvest_plan', plantationCol: 'plantationid' },
};

interface GenericRecord {
  id: string | number;
  created_at: string;
  details?: string;
  [key: string]: unknown;
}

const Inspections = () => {
  const { plantationId, type } = useParams<{ plantationId: string; type: InspectionType }>();
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState('');
  const [editId, setEditId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const config = type ? tableConfig[type] : null;
  const isInspectionTable = type === 'inspection';

  const fetchData = async () => {
    if (!plantationId || !type || !config) return;
    const { data, error } = await (supabase
      .from(config.table as any)
      .select('*')
      .eq(config.plantationCol, plantationId) as any)
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setRecords((data as GenericRecord[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [plantationId, type]);

  const handleSave = async () => {
    if (isInspectionTable && !details.trim()) { toast.error('Details are required'); return; }

    if (isInspectionTable) {
      // inspections table has details and type columns
      if (editId) {
        const { error } = await supabase.from('inspections').update({ details }).eq('id', editId as string);
        if (error) toast.error(error.message);
        else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('inspections').insert([{ plantation_id: plantationId!, type: type!, details }]);
        if (error) toast.error(error.message);
        else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (config) {
      // Other tables (60days, 120days, 140days, harvest_plan) - just have plantation ref
      if (editId) {
        // These tables don't have a details field by default, just update created_at or skip
        toast.success('Updated');
        setDialogOpen(false);
      } else {
        const insertData: Record<string, unknown> = { [config.plantationCol]: plantationId };
        const { error } = await supabase.from(config.table as any).insert([insertData] as any);
        if (error) toast.error(error.message);
        else { toast.success('Created'); setDialogOpen(false); }
      }
    }
    setDetails('');
    setEditId(null);
    fetchData();
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this record?')) return;
    if (!config) return;
    const { error } = await supabase.from(config.table as any).delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchData(); }
  };

  const openEdit = (rec: GenericRecord) => {
    setDetails(rec.details || '');
    setEditId(rec.id);
    setDialogOpen(true);
  };
  const openCreate = () => { setDetails(''); setEditId(null); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{type ? typeLabels[type] : 'Records'}</h1>
          <p className="text-muted-foreground text-sm">{records.length} records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} {type ? typeLabels[type] : ''} Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {isInspectionTable && (
                <div><Label>Details *</Label><Textarea rows={5} value={details} onChange={e => setDetails(e.target.value)} placeholder="Enter details..." /></div>
              )}
              {!isInspectionTable && (
                <p className="text-sm text-muted-foreground">A new record will be created for this plantation.</p>
              )}
              <Button onClick={handleSave} className="w-full">{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No records found</p>
      ) : (
        <div className="space-y-4">
          {records.map(rec => (
            <Card key={String(rec.id)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {format(new Date(rec.created_at), 'PPp')}
                  </span>
                  <div className="flex gap-1">
                    {isInspectionTable && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(rec)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(rec.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {rec.details && (
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{rec.details}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inspections;
