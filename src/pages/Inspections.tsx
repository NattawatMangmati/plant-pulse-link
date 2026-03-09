import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InspectionType } from '@/types/database';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Edit, CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const typeLabels: Record<InspectionType, string> = {
  inspection: 'Inspection',
  after_60: 'After 60 Days',
  after_120: 'After 120 Days',
  after_140: 'After 140 Days',
  harvest_plan: 'Harvest Plan',
};

const tableConfig: Record<InspectionType, { table: string; plantationCol: string }> = {
  inspection: { table: 'inspections', plantationCol: 'plantation_id' },
  after_60: { table: '60days', plantationCol: 'plantationid' },
  after_120: { table: '120days', plantationCol: 'platationid' },
  after_140: { table: '140days', plantationCol: 'platationid' },
  harvest_plan: { table: 'harvest_plan', plantationCol: 'plantationid' },
};

const followUpOptions = ['2 เดือน', '4 เดือน', '6 เดือน', '8 เดือน', '10 เดือน'];

interface InspectionForm {
  รอบติดตาม: string;
  date: Date | undefined;
  Environment: string;
  โรค: string;
  การตาย: string;
  previous_weight: string;
  sub_small: string;
  small: string;
  medium: string;
  large: string;
  very_large: string;
  inter_crop: string;
}

const emptyForm: InspectionForm = {
  รอบติดตาม: '',
  date: undefined,
  Environment: '',
  โรค: '',
  การตาย: '',
  previous_weight: '',
  sub_small: '',
  small: '',
  medium: '',
  large: '',
  very_large: '',
  inter_crop: '',
};

interface GenericRecord {
  id: string | number;
  created_at: string;
  [key: string]: unknown;
}

const Inspections = () => {
  const { plantationId, type } = useParams<{ plantationId: string; type: InspectionType }>();
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<InspectionForm>(emptyForm);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const config = type ? tableConfig[type] : null;
  const isInspectionTable = type === 'inspection';

  const averageWeight = useMemo(() => {
    const vs = parseFloat(form.sub_small) || 0;
    const s = parseFloat(form.small) || 0;
    const m = parseFloat(form.medium) || 0;
    const l = parseFloat(form.large) || 0;
    const vl = parseFloat(form.very_large) || 0;
    const total = vs + s + m + l + vl;
    if (total === 0) return 0;
    return Math.round(((vs * 1) + (s * 1.5) + (m * 2) + (l * 2.5) + (vl * 3)) / 100 * 100) / 100;
  }, [form.sub_small, form.small, form.medium, form.large, form.very_large]);

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

  const updateField = (field: keyof InspectionForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isInspectionTable) {
      if (!form.รอบติดตาม) { toast.error('กรุณาเลือกรอบติดตาม'); return; }
      if (!form.date) { toast.error('กรุณาเลือกวันที่'); return; }

      const payload: Record<string, unknown> = {
        plantation_id: plantationId!,
        รอบติดตาม: form.รอบติดตาม,
        date: format(form.date, 'yyyy-MM-dd'),
        Environment: form.Environment || null,
        โรค: form.โรค || null,
        การตาย: form.การตาย || null,
        previous_weight: form.previous_weight ? parseFloat(form.previous_weight) : null,
        sub_small: form.sub_small ? parseFloat(form.sub_small) : null,
        small: form.small ? parseFloat(form.small) : null,
        medium: form.medium ? parseFloat(form.medium) : null,
        large: form.large ? parseFloat(form.large) : null,
        very_large: form.very_large ? parseFloat(form.very_large) : null,
        average_weight: averageWeight || null,
        inter_crop: form.inter_crop || null,
      };

      if (editId) {
        const { error } = await supabase.from('inspections').update(payload).eq('id', editId as string);
        if (error) toast.error(error.message);
        else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('inspections').insert([payload] as any);
        if (error) toast.error(error.message);
        else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (config) {
      if (editId) {
        toast.success('Updated');
        setDialogOpen(false);
      } else {
        const insertData: Record<string, unknown> = { [config.plantationCol]: plantationId };
        const { error } = await supabase.from(config.table as any).insert([insertData] as any);
        if (error) toast.error(error.message);
        else { toast.success('Created'); setDialogOpen(false); }
      }
    }
    setForm(emptyForm);
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
    if (isInspectionTable) {
      setForm({
        รอบติดตาม: (rec['รอบติดตาม'] as string) || '',
        date: rec.date ? parseISO(rec.date as string) : undefined,
        Environment: (rec.Environment as string) || '',
        โรค: (rec['โรค'] as string) || '',
        การตาย: (rec['การตาย'] as string) || '',
        previous_weight: rec.previous_weight != null ? String(rec.previous_weight) : '',
        sub_small: rec.sub_small != null ? String(rec.sub_small) : '',
        small: rec.small != null ? String(rec.small) : '',
        medium: rec.medium != null ? String(rec.medium) : '',
        large: rec.large != null ? String(rec.large) : '',
        very_large: rec.very_large != null ? String(rec.very_large) : '',
        inter_crop: (rec.inter_crop as string) || '',
      });
    }
    setEditId(rec.id);
    setDialogOpen(true);
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };

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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} {type ? typeLabels[type] : ''} Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {isInspectionTable ? (
                <>
                  {/* 1. รอบติดตาม */}
                  <div>
                    <Label>รอบติดตาม *</Label>
                    <Select value={form.รอบติดตาม} onValueChange={v => updateField('รอบติดตาม', v)}>
                      <SelectTrigger><SelectValue placeholder="เลือกรอบติดตาม" /></SelectTrigger>
                      <SelectContent>
                        {followUpOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. Date */}
                  <div>
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date ? format(form.date, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.date} onSelect={d => updateField('date', d)} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 3. Environment */}
                  <div>
                    <Label>Environment</Label>
                    <Input value={form.Environment} onChange={e => updateField('Environment', e.target.value)} placeholder="Environment" />
                  </div>

                  {/* 4. โรค */}
                  <div>
                    <Label>โรค</Label>
                    <Input value={form.โรค} onChange={e => updateField('โรค', e.target.value)} placeholder="โรค" />
                  </div>

                  {/* 5. การตาย */}
                  <div>
                    <Label>การตาย</Label>
                    <Input value={form.การตาย} onChange={e => updateField('การตาย', e.target.value)} placeholder="การตาย" />
                  </div>

                  {/* 6. Previous weight */}
                  <div>
                    <Label>Previous weight</Label>
                    <Input type="number" value={form.previous_weight} onChange={e => updateField('previous_weight', e.target.value)} placeholder="0" />
                  </div>

                  {/* 7-11. Size categories */}
                  <div>
                    <Label>Very small ≤ 4.5 cm. (ลูกจิ๋ว)</Label>
                    <Input type="number" value={form.sub_small} onChange={e => updateField('sub_small', e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Small 4.5 {'<'} x ≤ 6 cm. (ลูกเล็ก)</Label>
                    <Input type="number" value={form.small} onChange={e => updateField('small', e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Medium 6 {'<'} x ≤ 8.5 cm. (ลูกกลาง)</Label>
                    <Input type="number" value={form.medium} onChange={e => updateField('medium', e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Large 8.5 {'<'} x ≤ 9.5 cm. (ลูกใหญ่)</Label>
                    <Input type="number" value={form.large} onChange={e => updateField('large', e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Very large {'>'} 9.5 cm. (ลูกใหญ่พิเศษ)</Label>
                    <Input type="number" value={form.very_large} onChange={e => updateField('very_large', e.target.value)} placeholder="0" />
                  </div>

                  {/* 12. Average weight (auto-calculated) */}
                  <div>
                    <Label>Average weight (Kg.)</Label>
                    <Input value={averageWeight} readOnly className="bg-muted" />
                  </div>
                </>
              ) : (
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
                    {isInspectionTable && rec.date
                      ? format(parseISO(rec.date as string), 'PPP')
                      : format(new Date(rec.created_at), 'PPp')}
                    {isInspectionTable && rec['รอบติดตาม'] && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{rec['รอบติดตาม'] as string}</span>
                    )}
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
              {isInspectionTable && (
                <CardContent className="text-sm space-y-1">
                  {rec.Environment && <p><span className="text-muted-foreground">Environment:</span> {rec.Environment as string}</p>}
                  {rec['โรค'] && <p><span className="text-muted-foreground">โรค:</span> {rec['โรค'] as string}</p>}
                  {rec['การตาย'] && <p><span className="text-muted-foreground">การตาย:</span> {rec['การตาย'] as string}</p>}
                  {rec.average_weight != null && <p><span className="text-muted-foreground">Avg weight:</span> {String(rec.average_weight)} Kg.</p>}
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
