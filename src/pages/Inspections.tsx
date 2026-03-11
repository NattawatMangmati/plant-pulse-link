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
import { Plus, FileText, Trash2, Edit, CalendarIcon, Upload, X } from 'lucide-react';
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

const weekOptions = [
  "29 Mar - 04 Apr 2026","05 Apr - 11 Apr 2026","12 Apr - 18 Apr 2026","19 Apr - 25 Apr 2026",
  "26 Apr - 02 May 2026","03 May - 09 May 2026","10 May - 16 May 2026","17 May - 23 May 2026",
  "24 May - 30 May 2026","31 May - 06 Jun 2026","07 Jun - 13 Jun 2026","14 Jun - 20 Jun 2026",
  "21 Jun - 27 Jun 2026","28 Jun - 04 Jul 2026","05 Jul - 11 Jul 2026","12 Jul - 18 Jul 2026",
  "19 Jul - 25 Jul 2026","26 Jul - 01 Aug 2026","02 Aug - 08 Aug 2026","09 Aug - 15 Aug 2026",
  "16 Aug - 22 Aug 2026","23 Aug - 29 Aug 2026","30 Aug - 05 Sep 2026","06 Sep - 12 Sep 2026",
  "13 Sep - 19 Sep 2026","20 Sep - 26 Sep 2026","27 Sep - 03 Oct 2026","04 Oct - 10 Oct 2026",
  "11 Oct - 17 Oct 2026","18 Oct - 24 Oct 2026","25 Oct - 31 Oct 2026","01 Nov - 07 Nov 2026",
  "08 Nov - 14 Nov 2026","15 Nov - 21 Nov 2026","22 Nov - 28 Nov 2026","29 Nov - 05 Dec 2026",
  "06 Dec - 12 Dec 2026","13 Dec - 19 Dec 2026","20 Dec - 26 Dec 2026","27 Dec - 02 Jan 2027",
  "03 Jan - 09 Jan 2027","10 Jan - 16 Jan 2027","17 Jan - 23 Jan 2027","24 Jan - 30 Jan 2027",
  "31 Jan - 06 Feb 2027","07 Feb - 13 Feb 2027",
];

interface HarvestPlanForm {
  week: string;
  predict_date: Date | undefined;
  actual_date: Date | undefined;
  harvest_plan: string;
  actual_havest: string;
  move_to_previous_week: string;
  postpone_another_week: string;
  move_from_previous_week: string;
  actual_forcing: string;
  out_plan: string;
  low_quality: string;
  sale_elsewhere: string;
  est_error: string;
}

const emptyHarvestPlanForm: HarvestPlanForm = {
  week: '', predict_date: undefined, actual_date: undefined,
  harvest_plan: '', actual_havest: '', move_to_previous_week: '',
  postpone_another_week: '', move_from_previous_week: '', actual_forcing: '',
  out_plan: '', low_quality: '', sale_elsewhere: '', est_error: '',
};

interface InspectionForm {
  รอบติดตาม: string; date: Date | undefined; Environment: string;
  โรค: string; การตาย: string; previous_weight: string;
  sub_small: string; small: string; medium: string;
  large: string; very_large: string; inter_crop: string;
}

const emptyForm: InspectionForm = {
  รอบติดตาม: '', date: undefined, Environment: '', โรค: '', การตาย: '',
  previous_weight: '', sub_small: '', small: '', medium: '',
  large: '', very_large: '', inter_crop: '',
};

interface After60Form {
  'M-Y plot': string; m_y_force: string; Area: string; force_plant: string;
  force_date: Date | undefined; inspection_date: Date | undefined;
  fruiting_row1: string; 'Non-fruiting_row1': string;
  fruiting_row2: string; non_fruiting_row2: string;
  fruiting_row3: string; non_fruiting_row3: string;
  est_harvest_date: Date | undefined; plant_photo: string;
}

const emptyAfter60Form: After60Form = {
  'M-Y plot': '', m_y_force: '', Area: '', force_plant: '',
  force_date: undefined, inspection_date: undefined,
  fruiting_row1: '', 'Non-fruiting_row1': '',
  fruiting_row2: '', non_fruiting_row2: '',
  fruiting_row3: '', non_fruiting_row3: '',
  est_harvest_date: undefined, plant_photo: '',
};

interface After120Form {
  m_y_plot: string; m_y_force: string; area: string; force_plant: string;
  force_date: Date | undefined; inspection_date: Date | undefined;
  large_row1: string; small_row1: string; very_small_row1: string; defect_row1: string; destroyed_row1: string;
  large_row2: string; small_row2: string; very_small_row2: string; defect_row2: string; destroyed_row2: string;
  large_row3: string; small_row3: string; very_small_row3: string; defect_row3: string; destroyed_row3: string;
  nitrate_row1_no1: string; nitrate_row1_no2: string; nitrate_row1_no3: string;
  nitrate_row2_no1: string; nitrate_row2_no2: string; nitrate_row2_no3: string;
  nitrate_row3_no1: string; nitrate_row3_no2: string; nitrate_row3_no3: string;
  large_weight: string; small_weight: string; very_small_weight: string;
  first_prediction_product: string;
  photo: string;
}

const emptyAfter120Form: After120Form = {
  m_y_plot: '', m_y_force: '', area: '', force_plant: '',
  force_date: undefined, inspection_date: undefined,
  large_row1: '', small_row1: '', very_small_row1: '', defect_row1: '', destroyed_row1: '',
  large_row2: '', small_row2: '', very_small_row2: '', defect_row2: '', destroyed_row2: '',
  large_row3: '', small_row3: '', very_small_row3: '', defect_row3: '', destroyed_row3: '',
  nitrate_row1_no1: '', nitrate_row1_no2: '', nitrate_row1_no3: '',
  nitrate_row2_no1: '', nitrate_row2_no2: '', nitrate_row2_no3: '',
  nitrate_row3_no1: '', nitrate_row3_no2: '', nitrate_row3_no3: '',
  large_weight: '1', small_weight: '0.7', very_small_weight: '0.3',
  first_prediction_product: '',
  photo: '',
};

// After140Form is identical structure to After120Form
type After140Form = After120Form;
const emptyAfter140Form: After140Form = { ...emptyAfter120Form };

interface GenericRecord {
  id: string | number;
  created_at: string;
  [key: string]: unknown;
}

interface PlantationData {
  "plot's_month": string | null;
  force_month: string | null;
  area: number | null;
  force_plant: number | null;
  "60_days_after_force": string | null;
  "120_days_after_force": string | null;
  "140_days_after_force": string | null;
}

const Inspections = () => {
  const { plantationId, type } = useParams<{ plantationId: string; type: InspectionType }>();
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<InspectionForm>(emptyForm);
  const [after60Form, setAfter60Form] = useState<After60Form>(emptyAfter60Form);
  const [after120Form, setAfter120Form] = useState<After120Form>(emptyAfter120Form);
  const [after140Form, setAfter140Form] = useState<After140Form>(emptyAfter140Form);
  const [harvestForm, setHarvestForm] = useState<HarvestPlanForm>(emptyHarvestPlanForm);
  const [plantationData, setPlantationData] = useState<PlantationData | null>(null);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading60Photo, setUploading60Photo] = useState(false);
  const [uploading120Photo, setUploading120Photo] = useState(false);
  const [uploading140Photo, setUploading140Photo] = useState(false);

  const config = type ? tableConfig[type] : null;
  const isInspectionTable = type === 'inspection';
  const isAfter60 = type === 'after_60';
  const isAfter120 = type === 'after_120';
  const isAfter140 = type === 'after_140';
  const isHarvestPlan = type === 'harvest_plan';

  // ===== Inspection auto-calc =====
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

  // ===== After 60 auto-calc =====
  const totalRow1_60 = useMemo(() => (parseFloat(after60Form.fruiting_row1) || 0) + (parseFloat(after60Form['Non-fruiting_row1']) || 0), [after60Form.fruiting_row1, after60Form['Non-fruiting_row1']]);
  const totalRow2_60 = useMemo(() => (parseFloat(after60Form.fruiting_row2) || 0) + (parseFloat(after60Form.non_fruiting_row2) || 0), [after60Form.fruiting_row2, after60Form.non_fruiting_row2]);
  const totalRow3_60 = useMemo(() => (parseFloat(after60Form.fruiting_row3) || 0) + (parseFloat(after60Form.non_fruiting_row3) || 0), [after60Form.fruiting_row3, after60Form.non_fruiting_row3]);
  const totalFruiting = useMemo(() => (parseFloat(after60Form.fruiting_row1) || 0) + (parseFloat(after60Form.fruiting_row2) || 0) + (parseFloat(after60Form.fruiting_row3) || 0), [after60Form.fruiting_row1, after60Form.fruiting_row2, after60Form.fruiting_row3]);
  const totalNonFruiting = useMemo(() => (parseFloat(after60Form['Non-fruiting_row1']) || 0) + (parseFloat(after60Form.non_fruiting_row2) || 0) + (parseFloat(after60Form.non_fruiting_row3) || 0), [after60Form['Non-fruiting_row1'], after60Form.non_fruiting_row2, after60Form.non_fruiting_row3]);
  const totalAll_60 = totalRow1_60 + totalRow2_60 + totalRow3_60;
  const fruitingPerc = useMemo(() => totalAll_60 === 0 ? 0 : Math.round((totalFruiting / totalAll_60) * 100 * 100) / 100, [totalFruiting, totalAll_60]);
  const nonFruitingPerc = useMemo(() => totalAll_60 === 0 ? 0 : Math.round((totalNonFruiting / totalAll_60) * 100 * 100) / 100, [totalNonFruiting, totalAll_60]);
  const productivePlant = useMemo(() => Math.round((fruitingPerc * (parseFloat(after60Form.force_plant) || 0)) / 100), [fruitingPerc, after60Form.force_plant]);
  // Fixed: est_products = ((totalFruiting * force_plant) / 100) rounded to 2 decimals
  const estProducts = useMemo(() => Math.round((fruitingPerc * (parseFloat(after60Form.force_plant) || 0)) / 100), [fruitingPerc, after60Form.force_plant]);

  // ===== After 120 auto-calc =====
  const p = (v: string) => parseFloat(v) || 0;
  
  const totalRow1_120 = useMemo(() => p(after120Form.large_row1) + p(after120Form.small_row1) + p(after120Form.very_small_row1) + p(after120Form.defect_row1) + p(after120Form.destroyed_row1), [after120Form.large_row1, after120Form.small_row1, after120Form.very_small_row1, after120Form.defect_row1, after120Form.destroyed_row1]);
  const totalRow2_120 = useMemo(() => p(after120Form.large_row2) + p(after120Form.small_row2) + p(after120Form.very_small_row2) + p(after120Form.defect_row2) + p(after120Form.destroyed_row2), [after120Form.large_row2, after120Form.small_row2, after120Form.very_small_row2, after120Form.defect_row2, after120Form.destroyed_row2]);
  const totalRow3_120 = useMemo(() => p(after120Form.large_row3) + p(after120Form.small_row3) + p(after120Form.very_small_row3) + p(after120Form.defect_row3) + p(after120Form.destroyed_row3), [after120Form.large_row3, after120Form.small_row3, after120Form.very_small_row3, after120Form.defect_row3, after120Form.destroyed_row3]);

  const avgNitrateRow1 = useMemo(() => { const vals = [p(after120Form.nitrate_row1_no1), p(after120Form.nitrate_row1_no2), p(after120Form.nitrate_row1_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after120Form.nitrate_row1_no1, after120Form.nitrate_row1_no2, after120Form.nitrate_row1_no3]);
  const avgNitrateRow2 = useMemo(() => { const vals = [p(after120Form.nitrate_row2_no1), p(after120Form.nitrate_row2_no2), p(after120Form.nitrate_row2_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after120Form.nitrate_row2_no1, after120Form.nitrate_row2_no2, after120Form.nitrate_row2_no3]);
  const avgNitrateRow3 = useMemo(() => { const vals = [p(after120Form.nitrate_row3_no1), p(after120Form.nitrate_row3_no2), p(after120Form.nitrate_row3_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after120Form.nitrate_row3_no1, after120Form.nitrate_row3_no2, after120Form.nitrate_row3_no3]);

  const avgNitrateNo1 = useMemo(() => { const vals = [p(after120Form.nitrate_row1_no1), p(after120Form.nitrate_row2_no1), p(after120Form.nitrate_row3_no1)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after120Form.nitrate_row1_no1, after120Form.nitrate_row2_no1, after120Form.nitrate_row3_no1]);
  const avgNitrateNo2 = useMemo(() => { const vals = [p(after120Form.nitrate_row1_no2), p(after120Form.nitrate_row2_no2), p(after120Form.nitrate_row3_no2)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after120Form.nitrate_row1_no2, after120Form.nitrate_row2_no2, after120Form.nitrate_row3_no2]);
  const avgNitrateNo3 = useMemo(() => { const vals = [p(after120Form.nitrate_row1_no3), p(after120Form.nitrate_row2_no3), p(after120Form.nitrate_row3_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after120Form.nitrate_row1_no3, after120Form.nitrate_row2_no3, after120Form.nitrate_row3_no3]);

  const avgTotalNitrate = useMemo(() => (avgNitrateRow1 + avgNitrateRow2 + avgNitrateRow3) > 0 ? Math.round((avgNitrateRow1 + avgNitrateRow2 + avgNitrateRow3) / 3 * 100) / 100 : 0, [avgNitrateRow1, avgNitrateRow2, avgNitrateRow3]);

  const totalLarge = useMemo(() => p(after120Form.large_row1) + p(after120Form.large_row2) + p(after120Form.large_row3), [after120Form.large_row1, after120Form.large_row2, after120Form.large_row3]);
  const totalSmall = useMemo(() => p(after120Form.small_row1) + p(after120Form.small_row2) + p(after120Form.small_row3), [after120Form.small_row1, after120Form.small_row2, after120Form.small_row3]);
  const totalVerySmall = useMemo(() => p(after120Form.very_small_row1) + p(after120Form.very_small_row2) + p(after120Form.very_small_row3), [after120Form.very_small_row1, after120Form.very_small_row2, after120Form.very_small_row3]);
  const totalDefect = useMemo(() => p(after120Form.defect_row1) + p(after120Form.defect_row2) + p(after120Form.defect_row3), [after120Form.defect_row1, after120Form.defect_row2, after120Form.defect_row3]);
  const totalDestroyed = useMemo(() => p(after120Form.destroyed_row1) + p(after120Form.destroyed_row2) + p(after120Form.destroyed_row3), [after120Form.destroyed_row1, after120Form.destroyed_row2, after120Form.destroyed_row3]);
  const totalAll_120 = totalRow1_120 + totalRow2_120 + totalRow3_120;
  const goodProducts = totalAll_120 - (totalDefect + totalDestroyed);
  const largePerc = goodProducts > 0 ? Math.round((totalLarge / goodProducts) * 100 * 100) / 100 : 0;
  const smallPerc = goodProducts > 0 ? Math.round((totalSmall / goodProducts) * 100 * 100) / 100 : 0;
  const verySmallPerc = goodProducts > 0 ? Math.round((totalVerySmall / goodProducts) * 100 * 100) / 100 : 0;
  const defectPerc = totalAll_120 > 0 ? Math.round((totalDefect / totalAll_120) * 100 * 100) / 100 : 0;
  const destroyedPerc = totalAll_120 > 0 ? Math.round((totalDestroyed / totalAll_120) * 100 * 100) / 100 : 0;
  const normalPerc = totalAll_120 > 0 ? Math.round((goodProducts / totalAll_120) * 100 * 100) / 100 : 0;

  const largeW = p(after120Form.large_weight) || 1;
  const smallW = p(after120Form.small_weight) || 0.7;
  const verySmallW = p(after120Form.very_small_weight) || 0.3;
  const firstPred = p(after120Form.first_prediction_product);
  const predictionProductKg = useMemo(() => {
    const normalFrac = normalPerc / 100;
    const largeFrac = largePerc / 100;
    const smallFrac = smallPerc / 100;
    const vsFrac = verySmallPerc / 100;
    return Math.round(((largeFrac * (firstPred * normalFrac)) * largeW + (smallFrac * (firstPred * normalFrac)) * smallW + (vsFrac * (firstPred * normalFrac)) * verySmallW) * 100) / 100;
  }, [largePerc, smallPerc, verySmallPerc, normalPerc, firstPred, largeW, smallW, verySmallW]);

  // ===== After 140 auto-calc =====
  const totalRow1_140 = useMemo(() => p(after140Form.large_row1) + p(after140Form.small_row1) + p(after140Form.very_small_row1) + p(after140Form.defect_row1) + p(after140Form.destroyed_row1), [after140Form.large_row1, after140Form.small_row1, after140Form.very_small_row1, after140Form.defect_row1, after140Form.destroyed_row1]);
  const totalRow2_140 = useMemo(() => p(after140Form.large_row2) + p(after140Form.small_row2) + p(after140Form.very_small_row2) + p(after140Form.defect_row2) + p(after140Form.destroyed_row2), [after140Form.large_row2, after140Form.small_row2, after140Form.very_small_row2, after140Form.defect_row2, after140Form.destroyed_row2]);
  const totalRow3_140 = useMemo(() => p(after140Form.large_row3) + p(after140Form.small_row3) + p(after140Form.very_small_row3) + p(after140Form.defect_row3) + p(after140Form.destroyed_row3), [after140Form.large_row3, after140Form.small_row3, after140Form.very_small_row3, after140Form.defect_row3, after140Form.destroyed_row3]);

  const avgNitrateRow1_140 = useMemo(() => { const vals = [p(after140Form.nitrate_row1_no1), p(after140Form.nitrate_row1_no2), p(after140Form.nitrate_row1_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after140Form.nitrate_row1_no1, after140Form.nitrate_row1_no2, after140Form.nitrate_row1_no3]);
  const avgNitrateRow2_140 = useMemo(() => { const vals = [p(after140Form.nitrate_row2_no1), p(after140Form.nitrate_row2_no2), p(after140Form.nitrate_row2_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after140Form.nitrate_row2_no1, after140Form.nitrate_row2_no2, after140Form.nitrate_row2_no3]);
  const avgNitrateRow3_140 = useMemo(() => { const vals = [p(after140Form.nitrate_row3_no1), p(after140Form.nitrate_row3_no2), p(after140Form.nitrate_row3_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after140Form.nitrate_row3_no1, after140Form.nitrate_row3_no2, after140Form.nitrate_row3_no3]);

  const avgNitrateNo1_140 = useMemo(() => { const vals = [p(after140Form.nitrate_row1_no1), p(after140Form.nitrate_row2_no1), p(after140Form.nitrate_row3_no1)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after140Form.nitrate_row1_no1, after140Form.nitrate_row2_no1, after140Form.nitrate_row3_no1]);
  const avgNitrateNo2_140 = useMemo(() => { const vals = [p(after140Form.nitrate_row1_no2), p(after140Form.nitrate_row2_no2), p(after140Form.nitrate_row3_no2)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after140Form.nitrate_row1_no2, after140Form.nitrate_row2_no2, after140Form.nitrate_row3_no2]);
  const avgNitrateNo3_140 = useMemo(() => { const vals = [p(after140Form.nitrate_row1_no3), p(after140Form.nitrate_row2_no3), p(after140Form.nitrate_row3_no3)]; return vals.some(v => v > 0) ? Math.round((vals[0] + vals[1] + vals[2]) / 3 * 100) / 100 : 0; }, [after140Form.nitrate_row1_no3, after140Form.nitrate_row2_no3, after140Form.nitrate_row3_no3]);

  const avgTotalNitrate_140 = useMemo(() => (avgNitrateRow1_140 + avgNitrateRow2_140 + avgNitrateRow3_140) > 0 ? Math.round((avgNitrateRow1_140 + avgNitrateRow2_140 + avgNitrateRow3_140) / 3 * 100) / 100 : 0, [avgNitrateRow1_140, avgNitrateRow2_140, avgNitrateRow3_140]);

  const totalLarge_140 = useMemo(() => p(after140Form.large_row1) + p(after140Form.large_row2) + p(after140Form.large_row3), [after140Form.large_row1, after140Form.large_row2, after140Form.large_row3]);
  const totalSmall_140 = useMemo(() => p(after140Form.small_row1) + p(after140Form.small_row2) + p(after140Form.small_row3), [after140Form.small_row1, after140Form.small_row2, after140Form.small_row3]);
  const totalVerySmall_140 = useMemo(() => p(after140Form.very_small_row1) + p(after140Form.very_small_row2) + p(after140Form.very_small_row3), [after140Form.very_small_row1, after140Form.very_small_row2, after140Form.very_small_row3]);
  const totalDefect_140 = useMemo(() => p(after140Form.defect_row1) + p(after140Form.defect_row2) + p(after140Form.defect_row3), [after140Form.defect_row1, after140Form.defect_row2, after140Form.defect_row3]);
  const totalDestroyed_140 = useMemo(() => p(after140Form.destroyed_row1) + p(after140Form.destroyed_row2) + p(after140Form.destroyed_row3), [after140Form.destroyed_row1, after140Form.destroyed_row2, after140Form.destroyed_row3]);
  const totalAll_140 = totalRow1_140 + totalRow2_140 + totalRow3_140;
  const goodProducts_140 = totalAll_140 - (totalDefect_140 + totalDestroyed_140);
  const largePerc_140 = goodProducts_140 > 0 ? Math.round((totalLarge_140 / goodProducts_140) * 100 * 100) / 100 : 0;
  const smallPerc_140 = goodProducts_140 > 0 ? Math.round((totalSmall_140 / goodProducts_140) * 100 * 100) / 100 : 0;
  const verySmallPerc_140 = goodProducts_140 > 0 ? Math.round((totalVerySmall_140 / goodProducts_140) * 100 * 100) / 100 : 0;
  const defectPerc_140 = totalAll_140 > 0 ? Math.round((totalDefect_140 / totalAll_140) * 100 * 100) / 100 : 0;
  const destroyedPerc_140 = totalAll_140 > 0 ? Math.round((totalDestroyed_140 / totalAll_140) * 100 * 100) / 100 : 0;
  const normalPerc_140 = totalAll_140 > 0 ? Math.round((goodProducts_140 / totalAll_140) * 100 * 100) / 100 : 0;

  const largeW_140 = p(after140Form.large_weight) || 1;
  const smallW_140 = p(after140Form.small_weight) || 0.7;
  const verySmallW_140 = p(after140Form.very_small_weight) || 0.3;
  const firstPred_140 = p(after140Form.first_prediction_product);
  const predictionProductKg_140 = useMemo(() => {
    const normalFrac = normalPerc_140 / 100;
    const largeFrac = largePerc_140 / 100;
    const smallFrac = smallPerc_140 / 100;
    const vsFrac = verySmallPerc_140 / 100;
    return Math.round(((largeFrac * (firstPred_140 * normalFrac)) * largeW_140 + (smallFrac * (firstPred_140 * normalFrac)) * smallW_140 + (vsFrac * (firstPred_140 * normalFrac)) * verySmallW_140) * 100) / 100;
  }, [largePerc_140, smallPerc_140, verySmallPerc_140, normalPerc_140, firstPred_140, largeW_140, smallW_140, verySmallW_140]);

  // ===== Photo uploads =====
  const handle60PhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading60Photo(true);
    const filePath = `${plantationId}/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('60D photo').upload(filePath, file);
    if (error) { toast.error(error.message); setUploading60Photo(false); return; }
    const { data: urlData } = supabase.storage.from('60D photo').getPublicUrl(filePath);
    updateAfter60Field('plant_photo', urlData.publicUrl);
    setUploading60Photo(false);
  };

  const handle120PhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading120Photo(true);
    const filePath = `${plantationId}/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('120D photo').upload(filePath, file);
    if (error) { toast.error(error.message); setUploading120Photo(false); return; }
    const { data: urlData } = supabase.storage.from('120D photo').getPublicUrl(filePath);
    updateAfter120Field('photo', urlData.publicUrl);
    setUploading120Photo(false);
  };

  const handle140PhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading140Photo(true);
    const filePath = `${plantationId}/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('140D photo').upload(filePath, file);
    if (error) { toast.error(error.message); setUploading140Photo(false); return; }
    const { data: urlData } = supabase.storage.from('140D photo').getPublicUrl(filePath);
    updateAfter140Field('photo', urlData.publicUrl);
    setUploading140Photo(false);
  };

  // ===== Fetch plantation data =====
  useEffect(() => {
    const fetchPlantation = async () => {
      if (!plantationId) return;
      const { data, error } = await supabase
        .from('plantations')
        .select("\"plot's_month\", force_month, area, force_plant, \"60_days_after_force\", \"120_days_after_force\", \"140_days_after_force\"")
        .eq('id', plantationId)
        .single();
      if (!error && data) setPlantationData(data as PlantationData);
    };
    fetchPlantation();
  }, [plantationId]);

  // Auto-fill after60Form
  useEffect(() => {
    if (plantationData && dialogOpen && !editId && isAfter60) {
      setAfter60Form(prev => ({
        ...prev,
        'M-Y plot': plantationData["plot's_month"] || '',
        m_y_force: plantationData.force_month || '',
        Area: plantationData.area != null ? String(plantationData.area) : '',
        force_plant: plantationData.force_plant != null ? String(plantationData.force_plant) : '',
        force_date: plantationData["60_days_after_force"] ? parseISO(plantationData["60_days_after_force"]) : undefined,
      }));
    }
  }, [plantationData, dialogOpen, editId, isAfter60]);

  // Auto-fill after120Form + fetch est_products from 60days
  useEffect(() => {
    if (plantationData && dialogOpen && !editId && isAfter120) {
      setAfter120Form(prev => ({
        ...prev,
        m_y_plot: plantationData["plot's_month"] || '',
        m_y_force: plantationData.force_month || '',
        area: plantationData.area != null ? String(plantationData.area) : '',
        force_plant: plantationData.force_plant != null ? String(plantationData.force_plant) : '',
        force_date: plantationData["120_days_after_force"] ? parseISO(plantationData["120_days_after_force"]) : undefined,
      }));
      const fetch60 = async () => {
        const { data } = await supabase
          .from('60days')
          .select('est_products')
          .eq('plantationid', plantationId!)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data?.est_products != null) {
          setAfter120Form(prev => ({ ...prev, first_prediction_product: String(data.est_products) }));
        }
      };
      fetch60();
    }
  }, [plantationData, dialogOpen, editId, isAfter120, plantationId]);

  // Auto-fill after140Form + fetch est_products from 60days
  useEffect(() => {
    if (plantationData && dialogOpen && !editId && isAfter140) {
      setAfter140Form(prev => ({
        ...prev,
        m_y_plot: plantationData["plot's_month"] || '',
        m_y_force: plantationData.force_month || '',
        area: plantationData.area != null ? String(plantationData.area) : '',
        force_plant: plantationData.force_plant != null ? String(plantationData.force_plant) : '',
        force_date: plantationData["140_days_after_force"] ? parseISO(plantationData["140_days_after_force"]) : undefined,
      }));
      const fetch60 = async () => {
        const { data } = await supabase
          .from('60days')
          .select('est_products')
          .eq('plantationid', plantationId!)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data?.est_products != null) {
          setAfter140Form(prev => ({ ...prev, first_prediction_product: String(data.est_products) }));
        }
      };
      fetch60();
    }
  }, [plantationData, dialogOpen, editId, isAfter140, plantationId]);

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

  const updateField = (field: keyof InspectionForm, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const updateAfter60Field = (field: keyof After60Form, value: any) => setAfter60Form(prev => ({ ...prev, [field]: value }));
  const updateAfter120Field = (field: keyof After120Form, value: any) => setAfter120Form(prev => ({ ...prev, [field]: value }));
  const updateAfter140Field = (field: keyof After140Form, value: any) => setAfter140Form(prev => ({ ...prev, [field]: value }));
  const updateHarvestField = (field: keyof HarvestPlanForm, value: any) => setHarvestForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (isInspectionTable) {
      if (!form.รอบติดตาม) { toast.error('กรุณาเลือกรอบติดตาม'); return; }
      if (!form.date) { toast.error('กรุณาเลือกวันที่'); return; }
      const payload: Record<string, unknown> = {
        plantation_id: plantationId!,
        รอบติดตาม: form.รอบติดตาม,
        date: format(form.date, 'yyyy-MM-dd'),
        Environment: form.Environment || null,
        โรค: form.โรค || null, การตาย: form.การตาย || null,
        previous_weight: form.previous_weight ? parseFloat(form.previous_weight) : null,
        sub_small: form.sub_small ? parseFloat(form.sub_small) : null,
        small: form.small ? parseFloat(form.small) : null,
        medium: form.medium ? parseFloat(form.medium) : null,
        large: form.large ? parseFloat(form.large) : null,
        very_large: form.very_large ? parseFloat(form.very_large) : null,
        average_weight: averageWeight || null, inter_crop: form.inter_crop || null,
      };
      if (editId) {
        const { error } = await supabase.from('inspections').update(payload).eq('id', editId as string);
        if (error) toast.error(error.message); else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('inspections').insert([payload] as any);
        if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (isAfter60 && config) {
      const payload: Record<string, unknown> = {
        id: editId || crypto.randomUUID(), plantationid: plantationId!,
        'M-Y plot': after60Form['M-Y plot'] || null, m_y_force: after60Form.m_y_force || null,
        Area: after60Form.Area ? parseFloat(after60Form.Area) : null,
        force_plant: after60Form.force_plant ? parseFloat(after60Form.force_plant) : null,
        force_date: after60Form.force_date ? format(after60Form.force_date, 'yyyy-MM-dd') : null,
        inspection_date: after60Form.inspection_date ? format(after60Form.inspection_date, 'yyyy-MM-dd') : null,
        fruiting_row1: after60Form.fruiting_row1 ? parseFloat(after60Form.fruiting_row1) : null,
        'Non-fruiting_row1': after60Form['Non-fruiting_row1'] ? parseFloat(after60Form['Non-fruiting_row1']) : null,
        total_row1: totalRow1_60 || null,
        fruiting_row2: after60Form.fruiting_row2 ? parseFloat(after60Form.fruiting_row2) : null,
        'non-fruiting_row2': after60Form.non_fruiting_row2 ? parseFloat(after60Form.non_fruiting_row2) : null,
        total_row2: totalRow2_60 || null,
        fruiting_row3: after60Form.fruiting_row3 ? parseFloat(after60Form.fruiting_row3) : null,
        'non-fruiting_row3': after60Form.non_fruiting_row3 ? parseFloat(after60Form.non_fruiting_row3) : null,
        total_row3: totalRow3_60 || null,
        total_fruiting: totalFruiting || null,
        'total_non-fruiting': totalNonFruiting || null,
        total_all: totalAll_60 || null,
        fruiting_perc: fruitingPerc || null, 'non-fruiting_perc': nonFruitingPerc || null,
        productive_plant: productivePlant || null,
        est_harvest_date: after60Form.est_harvest_date ? format(after60Form.est_harvest_date, 'yyyy-MM-dd') : null,
        est_products: estProducts || null, plant_photo: after60Form.plant_photo || null,
      };
      if (editId) {
        const { error } = await supabase.from('60days').update(payload).eq('id', editId as string);
        if (error) toast.error(error.message); else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('60days').insert([payload] as any);
        if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (isAfter120 && config) {
      const payload: Record<string, unknown> = {
        id: editId || crypto.randomUUID(), platationid: plantationId!,
        m_y_plot: after120Form.m_y_plot || null, m_y_force: after120Form.m_y_force || null,
        area: after120Form.area ? parseFloat(after120Form.area) : null,
        force_plant: after120Form.force_plant ? parseFloat(after120Form.force_plant) : null,
        force_date: after120Form.force_date ? format(after120Form.force_date, 'yyyy-MM-dd') : null,
        inspection_date: after120Form.inspection_date ? format(after120Form.inspection_date, 'yyyy-MM-dd') : null,
        large_row1: p(after120Form.large_row1) || null, small_row1: p(after120Form.small_row1) || null,
        very_small_row1: p(after120Form.very_small_row1) || null, defect_row1: p(after120Form.defect_row1) || null,
        destroyed_row1: p(after120Form.destroyed_row1) || null, total_row1: totalRow1_120 || null,
        large_row2: p(after120Form.large_row2) || null, small_row2: p(after120Form.small_row2) || null,
        very_small_row2: p(after120Form.very_small_row2) || null, defect_row2: p(after120Form.defect_row2) || null,
        destroyed_row2: p(after120Form.destroyed_row2) || null, total_row2: totalRow2_120 || null,
        large_row3: p(after120Form.large_row3) || null, small_row3: p(after120Form.small_row3) || null,
        very_small_row3: p(after120Form.very_small_row3) || null, defect_row3: p(after120Form.defect_row3) || null,
        destroyed_row3: p(after120Form.destroyed_row3) || null, total_row3: totalRow3_120 || null,
        nitrate_row1_no1: p(after120Form.nitrate_row1_no1) || null, nitrate_row1_no2: p(after120Form.nitrate_row1_no2) || null,
        nitrate_row1_no3: p(after120Form.nitrate_row1_no3) || null, avg_nitrate_row1: avgNitrateRow1 || null,
        nitrate_row2_no1: p(after120Form.nitrate_row2_no1) || null, nitrate_row2_no2: p(after120Form.nitrate_row2_no2) || null,
        nitrate_row2_no3: p(after120Form.nitrate_row2_no3) || null, avg_nitrate_row2: avgNitrateRow2 || null,
        nitrate_row3_no1: p(after120Form.nitrate_row3_no1) || null, nitrate_row3_no2: p(after120Form.nitrate_row3_no2) || null,
        nitrate_row3_no3: p(after120Form.nitrate_row3_no3) || null, avg_nitrate_row3: avgNitrateRow3 || null,
        avg_nitrate_no1: avgNitrateNo1 || null, avg_nitrate_no2: avgNitrateNo2 || null,
        avg_nitrate_no3: avgNitrateNo3 || null, avg_total_nitrate: avgTotalNitrate || null,
        total_large: totalLarge || null, total_small: totalSmall || null,
        total_very_small: totalVerySmall || null, total_defect: totalDefect || null,
        total_destroyed: totalDestroyed || null, total_all: totalAll_120 || null,
        large_perc: largePerc || null, small_perc: smallPerc || null,
        very_small_perc: verySmallPerc || null, defect_perc: defectPerc || null,
        destroyed_perc: destroyedPerc || null, normal_perc: normalPerc || null,
        good_products: goodProducts || null,
        large_weight: p(after120Form.large_weight) || 1,
        small_weight: p(after120Form.small_weight) || 0.7,
        very_small_weight: p(after120Form.very_small_weight) || 0.3,
        first_prediction_product: p(after120Form.first_prediction_product) || null,
        prediction_product_kg: predictionProductKg || null,
        photo: after120Form.photo || null,
      };
      if (editId) {
        const { error } = await supabase.from('120days').update(payload).eq('id', editId as string);
        if (error) toast.error(error.message); else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('120days').insert([payload] as any);
        if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (isAfter140 && config) {
      const payload: Record<string, unknown> = {
        id: editId || crypto.randomUUID(), platationid: plantationId!,
        m_y_plot: after140Form.m_y_plot || null, m_y_force: after140Form.m_y_force || null,
        area: after140Form.area ? parseFloat(after140Form.area) : null,
        force_plant: after140Form.force_plant ? parseFloat(after140Form.force_plant) : null,
        force_date: after140Form.force_date ? format(after140Form.force_date, 'yyyy-MM-dd') : null,
        inspection_date: after140Form.inspection_date ? format(after140Form.inspection_date, 'yyyy-MM-dd') : null,
        large_row1: p(after140Form.large_row1) || null, small_row1: p(after140Form.small_row1) || null,
        very_small_row1: p(after140Form.very_small_row1) || null, defect_row1: p(after140Form.defect_row1) || null,
        destroyed_row1: p(after140Form.destroyed_row1) || null, total_row1: totalRow1_140 || null,
        large_row2: p(after140Form.large_row2) || null, small_row2: p(after140Form.small_row2) || null,
        very_small_row2: p(after140Form.very_small_row2) || null, defect_row2: p(after140Form.defect_row2) || null,
        destroyed_row2: p(after140Form.destroyed_row2) || null, total_row2: totalRow2_140 || null,
        large_row3: p(after140Form.large_row3) || null, small_row3: p(after140Form.small_row3) || null,
        very_small_row3: p(after140Form.very_small_row3) || null, defect_row3: p(after140Form.defect_row3) || null,
        destroyed_row3: p(after140Form.destroyed_row3) || null, total_row3: totalRow3_140 || null,
        nitrate_row1_no1: p(after140Form.nitrate_row1_no1) || null, nitrate_row1_no2: p(after140Form.nitrate_row1_no2) || null,
        nitrate_row1_no3: p(after140Form.nitrate_row1_no3) || null, avg_nitrate_row1: avgNitrateRow1_140 || null,
        nitrate_row2_no1: p(after140Form.nitrate_row2_no1) || null, nitrate_row2_no2: p(after140Form.nitrate_row2_no2) || null,
        nitrate_row2_no3: p(after140Form.nitrate_row2_no3) || null, avg_nitrate_row2: avgNitrateRow2_140 || null,
        nitrate_row3_no1: p(after140Form.nitrate_row3_no1) || null, nitrate_row3_no2: p(after140Form.nitrate_row3_no2) || null,
        nitrate_row3_no3: p(after140Form.nitrate_row3_no3) || null, avg_nitrate_row3: avgNitrateRow3_140 || null,
        avg_nitrate_no1: avgNitrateNo1_140 || null, avg_nitrate_no2: avgNitrateNo2_140 || null,
        avg_nitrate_no3: avgNitrateNo3_140 || null, avg_total_nitrate: avgTotalNitrate_140 || null,
        total_large: totalLarge_140 || null, total_small: totalSmall_140 || null,
        total_very_small: totalVerySmall_140 || null, total_defect: totalDefect_140 || null,
        total_destroyed: totalDestroyed_140 || null, total_all: totalAll_140 || null,
        large_perc: largePerc_140 || null, small_perc: smallPerc_140 || null,
        very_small_perc: verySmallPerc_140 || null, defect_perc: defectPerc_140 || null,
        destroyed_perc: destroyedPerc_140 || null, normal_perc: normalPerc_140 || null,
        good_products: goodProducts_140 || null,
        large_weight: p(after140Form.large_weight) || 1,
        small_weight: p(after140Form.small_weight) || 0.7,
        very_small_weight: p(after140Form.very_small_weight) || 0.3,
        first_prediction_product: p(after140Form.first_prediction_product) || null,
        prediction_product_kg: predictionProductKg_140 || null,
        photo: after140Form.photo || null,
      };
      if (editId) {
        const { error } = await supabase.from('140days').update(payload).eq('id', editId as string);
        if (error) toast.error(error.message); else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('140days').insert([payload] as any);
        if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (isHarvestPlan && config) {
      const payload: Record<string, unknown> = {
        id: editId || crypto.randomUUID(), plantationid: plantationId!,
        week: harvestForm.week || null,
        predict_date: harvestForm.predict_date ? format(harvestForm.predict_date, 'yyyy-MM-dd') : null,
        actual_date: harvestForm.actual_date ? format(harvestForm.actual_date, 'yyyy-MM-dd') : null,
        harvest_plan: harvestForm.harvest_plan ? parseFloat(harvestForm.harvest_plan) : null,
        actual_havest: harvestForm.actual_havest ? parseFloat(harvestForm.actual_havest) : null,
        move_to_previous_week: harvestForm.move_to_previous_week ? parseFloat(harvestForm.move_to_previous_week) : null,
        postpone_another_week: harvestForm.postpone_another_week ? parseFloat(harvestForm.postpone_another_week) : null,
        move_from_previous_week: harvestForm.move_from_previous_week ? parseFloat(harvestForm.move_from_previous_week) : null,
        actual_forcing: harvestForm.actual_forcing ? parseFloat(harvestForm.actual_forcing) : null,
        out_plan: harvestForm.out_plan ? parseFloat(harvestForm.out_plan) : null,
        low_quality: harvestForm.low_quality ? parseFloat(harvestForm.low_quality) : null,
        sale_elsewhere: harvestForm.sale_elsewhere ? parseFloat(harvestForm.sale_elsewhere) : null,
        est_error: harvestForm.est_error ? parseFloat(harvestForm.est_error) : null,
      };
      if (editId) {
        const { error } = await supabase.from('harvest_plan').update(payload).eq('id', editId as string);
        if (error) toast.error(error.message); else { toast.success('Updated'); setDialogOpen(false); }
      } else {
        const { error } = await supabase.from('harvest_plan').insert([payload] as any);
        if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); }
      }
    } else if (config) {
      if (editId) { toast.success('Updated'); setDialogOpen(false); }
      else {
        const insertData: Record<string, unknown> = { [config.plantationCol]: plantationId };
        const { error } = await supabase.from(config.table as any).insert([insertData] as any);
        if (error) toast.error(error.message); else { toast.success('Created'); setDialogOpen(false); }
      }
    }
    setForm(emptyForm); setAfter60Form(emptyAfter60Form); setAfter120Form(emptyAfter120Form);
    setAfter140Form(emptyAfter140Form); setHarvestForm(emptyHarvestPlanForm); setEditId(null); fetchData();
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this record?')) return;
    if (!config) return;
    const { error } = await supabase.from(config.table as any).delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); fetchData(); }
  };

  const openEdit = (rec: GenericRecord) => {
    if (isInspectionTable) {
      setForm({
        รอบติดตาม: (rec['รอบติดตาม'] as string) || '', date: rec.date ? parseISO(rec.date as string) : undefined,
        Environment: (rec.Environment as string) || '', โรค: (rec['โรค'] as string) || '',
        การตาย: (rec['การตาย'] as string) || '', previous_weight: rec.previous_weight != null ? String(rec.previous_weight) : '',
        sub_small: rec.sub_small != null ? String(rec.sub_small) : '', small: rec.small != null ? String(rec.small) : '',
        medium: rec.medium != null ? String(rec.medium) : '', large: rec.large != null ? String(rec.large) : '',
        very_large: rec.very_large != null ? String(rec.very_large) : '', inter_crop: (rec.inter_crop as string) || '',
      });
    } else if (isAfter60) {
      setAfter60Form({
        'M-Y plot': (rec['M-Y plot'] as string) || '', m_y_force: (rec.m_y_force as string) || '',
        Area: rec.Area != null ? String(rec.Area) : '', force_plant: rec.force_plant != null ? String(rec.force_plant) : '',
        force_date: rec.force_date ? parseISO(rec.force_date as string) : undefined,
        inspection_date: rec.inspection_date ? parseISO(rec.inspection_date as string) : undefined,
        fruiting_row1: rec.fruiting_row1 != null ? String(rec.fruiting_row1) : '',
        'Non-fruiting_row1': rec['Non-fruiting_row1'] != null ? String(rec['Non-fruiting_row1']) : '',
        fruiting_row2: rec.fruiting_row2 != null ? String(rec.fruiting_row2) : '',
        non_fruiting_row2: rec['non-fruiting_row2'] != null ? String(rec['non-fruiting_row2']) : '',
        fruiting_row3: rec.fruiting_row3 != null ? String(rec.fruiting_row3) : '',
        non_fruiting_row3: rec['non-fruiting_row3'] != null ? String(rec['non-fruiting_row3']) : '',
        est_harvest_date: rec.est_harvest_date ? parseISO(rec.est_harvest_date as string) : undefined,
        plant_photo: (rec.plant_photo as string) || '',
      });
    } else if (isAfter120) {
      setAfter120Form({
        m_y_plot: (rec.m_y_plot as string) || '', m_y_force: (rec.m_y_force as string) || '',
        area: rec.area != null ? String(rec.area) : '', force_plant: rec.force_plant != null ? String(rec.force_plant) : '',
        force_date: rec.force_date ? parseISO(rec.force_date as string) : undefined,
        inspection_date: rec.inspection_date ? parseISO(rec.inspection_date as string) : undefined,
        large_row1: rec.large_row1 != null ? String(rec.large_row1) : '', small_row1: rec.small_row1 != null ? String(rec.small_row1) : '',
        very_small_row1: rec.very_small_row1 != null ? String(rec.very_small_row1) : '', defect_row1: rec.defect_row1 != null ? String(rec.defect_row1) : '',
        destroyed_row1: rec.destroyed_row1 != null ? String(rec.destroyed_row1) : '',
        large_row2: rec.large_row2 != null ? String(rec.large_row2) : '', small_row2: rec.small_row2 != null ? String(rec.small_row2) : '',
        very_small_row2: rec.very_small_row2 != null ? String(rec.very_small_row2) : '', defect_row2: rec.defect_row2 != null ? String(rec.defect_row2) : '',
        destroyed_row2: rec.destroyed_row2 != null ? String(rec.destroyed_row2) : '',
        large_row3: rec.large_row3 != null ? String(rec.large_row3) : '', small_row3: rec.small_row3 != null ? String(rec.small_row3) : '',
        very_small_row3: rec.very_small_row3 != null ? String(rec.very_small_row3) : '', defect_row3: rec.defect_row3 != null ? String(rec.defect_row3) : '',
        destroyed_row3: rec.destroyed_row3 != null ? String(rec.destroyed_row3) : '',
        nitrate_row1_no1: rec.nitrate_row1_no1 != null ? String(rec.nitrate_row1_no1) : '',
        nitrate_row1_no2: rec.nitrate_row1_no2 != null ? String(rec.nitrate_row1_no2) : '',
        nitrate_row1_no3: rec.nitrate_row1_no3 != null ? String(rec.nitrate_row1_no3) : '',
        nitrate_row2_no1: rec.nitrate_row2_no1 != null ? String(rec.nitrate_row2_no1) : '',
        nitrate_row2_no2: rec.nitrate_row2_no2 != null ? String(rec.nitrate_row2_no2) : '',
        nitrate_row2_no3: rec.nitrate_row2_no3 != null ? String(rec.nitrate_row2_no3) : '',
        nitrate_row3_no1: rec.nitrate_row3_no1 != null ? String(rec.nitrate_row3_no1) : '',
        nitrate_row3_no2: rec.nitrate_row3_no2 != null ? String(rec.nitrate_row3_no2) : '',
        nitrate_row3_no3: rec.nitrate_row3_no3 != null ? String(rec.nitrate_row3_no3) : '',
        large_weight: rec.large_weight != null ? String(rec.large_weight) : '1',
        small_weight: rec.small_weight != null ? String(rec.small_weight) : '0.7',
        very_small_weight: rec.very_small_weight != null ? String(rec.very_small_weight) : '0.3',
        first_prediction_product: rec.first_prediction_product != null ? String(rec.first_prediction_product) : '',
        photo: (rec.photo as string) || '',
      });
    } else if (isAfter140) {
      setAfter140Form({
        m_y_plot: (rec.m_y_plot as string) || '', m_y_force: (rec.m_y_force as string) || '',
        area: rec.area != null ? String(rec.area) : '', force_plant: rec.force_plant != null ? String(rec.force_plant) : '',
        force_date: rec.force_date ? parseISO(rec.force_date as string) : undefined,
        inspection_date: rec.inspection_date ? parseISO(rec.inspection_date as string) : undefined,
        large_row1: rec.large_row1 != null ? String(rec.large_row1) : '', small_row1: rec.small_row1 != null ? String(rec.small_row1) : '',
        very_small_row1: rec.very_small_row1 != null ? String(rec.very_small_row1) : '', defect_row1: rec.defect_row1 != null ? String(rec.defect_row1) : '',
        destroyed_row1: rec.destroyed_row1 != null ? String(rec.destroyed_row1) : '',
        large_row2: rec.large_row2 != null ? String(rec.large_row2) : '', small_row2: rec.small_row2 != null ? String(rec.small_row2) : '',
        very_small_row2: rec.very_small_row2 != null ? String(rec.very_small_row2) : '', defect_row2: rec.defect_row2 != null ? String(rec.defect_row2) : '',
        destroyed_row2: rec.destroyed_row2 != null ? String(rec.destroyed_row2) : '',
        large_row3: rec.large_row3 != null ? String(rec.large_row3) : '', small_row3: rec.small_row3 != null ? String(rec.small_row3) : '',
        very_small_row3: rec.very_small_row3 != null ? String(rec.very_small_row3) : '', defect_row3: rec.defect_row3 != null ? String(rec.defect_row3) : '',
        destroyed_row3: rec.destroyed_row3 != null ? String(rec.destroyed_row3) : '',
        nitrate_row1_no1: rec.nitrate_row1_no1 != null ? String(rec.nitrate_row1_no1) : '',
        nitrate_row1_no2: rec.nitrate_row1_no2 != null ? String(rec.nitrate_row1_no2) : '',
        nitrate_row1_no3: rec.nitrate_row1_no3 != null ? String(rec.nitrate_row1_no3) : '',
        nitrate_row2_no1: rec.nitrate_row2_no1 != null ? String(rec.nitrate_row2_no1) : '',
        nitrate_row2_no2: rec.nitrate_row2_no2 != null ? String(rec.nitrate_row2_no2) : '',
        nitrate_row2_no3: rec.nitrate_row2_no3 != null ? String(rec.nitrate_row2_no3) : '',
        nitrate_row3_no1: rec.nitrate_row3_no1 != null ? String(rec.nitrate_row3_no1) : '',
        nitrate_row3_no2: rec.nitrate_row3_no2 != null ? String(rec.nitrate_row3_no2) : '',
        nitrate_row3_no3: rec.nitrate_row3_no3 != null ? String(rec.nitrate_row3_no3) : '',
        large_weight: rec.large_weight != null ? String(rec.large_weight) : '1',
        small_weight: rec.small_weight != null ? String(rec.small_weight) : '0.7',
        very_small_weight: rec.very_small_weight != null ? String(rec.very_small_weight) : '0.3',
        first_prediction_product: rec.first_prediction_product != null ? String(rec.first_prediction_product) : '',
        photo: (rec.photo as string) || '',
      });
    } else if (isHarvestPlan) {
      setHarvestForm({
        week: (rec.week as string) || '',
        predict_date: rec.predict_date ? parseISO(rec.predict_date as string) : undefined,
        actual_date: rec.actual_date ? parseISO(rec.actual_date as string) : undefined,
        harvest_plan: rec.harvest_plan != null ? String(rec.harvest_plan) : '',
        actual_havest: rec.actual_havest != null ? String(rec.actual_havest) : '',
        move_to_previous_week: rec.move_to_previous_week != null ? String(rec.move_to_previous_week) : '',
        postpone_another_week: rec.postpone_another_week != null ? String(rec.postpone_another_week) : '',
        move_from_previous_week: rec.move_from_previous_week != null ? String(rec.move_from_previous_week) : '',
        actual_forcing: rec.actual_forcing != null ? String(rec.actual_forcing) : '',
        out_plan: rec.out_plan != null ? String(rec.out_plan) : '',
        low_quality: rec.low_quality != null ? String(rec.low_quality) : '',
        sale_elsewhere: rec.sale_elsewhere != null ? String(rec.sale_elsewhere) : '',
        est_error: rec.est_error != null ? String(rec.est_error) : '',
      });
    }
    setEditId(rec.id); setDialogOpen(true);
  };

  const openCreate = () => {
    setForm(emptyForm); setAfter60Form(emptyAfter60Form); setAfter120Form(emptyAfter120Form);
    setAfter140Form(emptyAfter140Form); setHarvestForm(emptyHarvestPlanForm); setEditId(null); setDialogOpen(true);
  };

  const renderDatePicker = (label: string, value: Date | undefined, onChange: (d: Date | undefined) => void) => (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderNumInput = (label: string, value: string, onChange: (v: string) => void, readOnly = false) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0" readOnly={readOnly} className={readOnly ? 'bg-muted' : ''} />
    </div>
  );

  const renderReadOnly = (label: string, value: string | number) => (
    <div>
      <Label>{label}</Label>
      <Input value={value} readOnly className="bg-muted" />
    </div>
  );

  // Reusable 120/140 form renderer
  const render120_140Form = (
    formData: After120Form,
    updateFn: (field: keyof After120Form, value: any) => void,
    calcs: {
      totalRow1: number; totalRow2: number; totalRow3: number;
      avgNR1: number; avgNR2: number; avgNR3: number;
      avgNN1: number; avgNN2: number; avgNN3: number; avgTotalN: number;
      tLarge: number; tSmall: number; tVS: number; tDefect: number; tDestroyed: number;
      tAll: number; gProducts: number;
      lPerc: number; sPerc: number; vsPerc: number; dPerc: number; destPerc: number; nPerc: number;
      predKg: number;
    },
    photoUploader: (e: React.ChangeEvent<HTMLInputElement>) => void,
    uploadingPhoto: boolean,
    bucketLabel: string
  ) => (
    <>
      {renderReadOnly("Plot's month", formData.m_y_plot)}
      {renderReadOnly('Force month', formData.m_y_force)}
      {renderReadOnly('Area', formData.area)}
      {renderReadOnly('Force plant', formData.force_plant)}
      {renderReadOnly('Force date', formData.force_date ? format(formData.force_date, 'PPP') : '')}
      {renderDatePicker('Inspection date', formData.inspection_date, d => updateFn('inspection_date', d))}

      {/* Row 1 */}
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-sm mb-2">แถวที่ 1</p>
        <div className="grid grid-cols-2 gap-2">
          {renderNumInput('ลูกใหญ่', formData.large_row1, v => updateFn('large_row1', v))}
          {renderNumInput('ลูกเล็ก', formData.small_row1, v => updateFn('small_row1', v))}
          {renderNumInput('ลูกจิ๋ว', formData.very_small_row1, v => updateFn('very_small_row1', v))}
          {renderNumInput('ตำหนิอื่นๆ', formData.defect_row1, v => updateFn('defect_row1', v))}
          {renderNumInput('สัตว์ทำลาย', formData.destroyed_row1, v => updateFn('destroyed_row1', v))}
          {renderNumInput('ผลรวมแถวที่1', String(calcs.totalRow1), () => {}, true)}
        </div>
      </div>

      {/* Row 2 */}
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-sm mb-2">แถวที่ 2</p>
        <div className="grid grid-cols-2 gap-2">
          {renderNumInput('ลูกใหญ่', formData.large_row2, v => updateFn('large_row2', v))}
          {renderNumInput('ลูกเล็ก', formData.small_row2, v => updateFn('small_row2', v))}
          {renderNumInput('ลูกจิ๋ว', formData.very_small_row2, v => updateFn('very_small_row2', v))}
          {renderNumInput('ตำหนิอื่นๆ', formData.defect_row2, v => updateFn('defect_row2', v))}
          {renderNumInput('สัตว์ทำลาย', formData.destroyed_row2, v => updateFn('destroyed_row2', v))}
          {renderNumInput('ผลรวมแถวที่2', String(calcs.totalRow2), () => {}, true)}
        </div>
      </div>

      {/* Row 3 */}
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-sm mb-2">แถวที่ 3</p>
        <div className="grid grid-cols-2 gap-2">
          {renderNumInput('ลูกใหญ่', formData.large_row3, v => updateFn('large_row3', v))}
          {renderNumInput('ลูกเล็ก', formData.small_row3, v => updateFn('small_row3', v))}
          {renderNumInput('ลูกจิ๋ว', formData.very_small_row3, v => updateFn('very_small_row3', v))}
          {renderNumInput('ตำหนิอื่นๆ', formData.defect_row3, v => updateFn('defect_row3', v))}
          {renderNumInput('สัตว์ทำลาย', formData.destroyed_row3, v => updateFn('destroyed_row3', v))}
          {renderNumInput('ผลรวมแถวที่3', String(calcs.totalRow3), () => {}, true)}
        </div>
      </div>

      {/* Nitrate Row 1 */}
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-sm mb-2">ไนเตรท แถวที่ 1</p>
        <div className="grid grid-cols-2 gap-2">
          {renderNumInput('ลูกที่1', formData.nitrate_row1_no1, v => updateFn('nitrate_row1_no1', v))}
          {renderNumInput('ลูกที่2', formData.nitrate_row1_no2, v => updateFn('nitrate_row1_no2', v))}
          {renderNumInput('ลูกที่3', formData.nitrate_row1_no3, v => updateFn('nitrate_row1_no3', v))}
          {renderNumInput('ค่าเฉลี่ย', String(calcs.avgNR1), () => {}, true)}
        </div>
      </div>

      {/* Nitrate Row 2 */}
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-sm mb-2">ไนเตรท แถวที่ 2</p>
        <div className="grid grid-cols-2 gap-2">
          {renderNumInput('ลูกที่1', formData.nitrate_row2_no1, v => updateFn('nitrate_row2_no1', v))}
          {renderNumInput('ลูกที่2', formData.nitrate_row2_no2, v => updateFn('nitrate_row2_no2', v))}
          {renderNumInput('ลูกที่3', formData.nitrate_row2_no3, v => updateFn('nitrate_row2_no3', v))}
          {renderNumInput('ค่าเฉลี่ย', String(calcs.avgNR2), () => {}, true)}
        </div>
      </div>

      {/* Nitrate Row 3 */}
      <div className="border-t pt-3 mt-3">
        <p className="font-semibold text-sm mb-2">ไนเตรท แถวที่ 3</p>
        <div className="grid grid-cols-2 gap-2">
          {renderNumInput('ลูกที่1', formData.nitrate_row3_no1, v => updateFn('nitrate_row3_no1', v))}
          {renderNumInput('ลูกที่2', formData.nitrate_row3_no2, v => updateFn('nitrate_row3_no2', v))}
          {renderNumInput('ลูกที่3', formData.nitrate_row3_no3, v => updateFn('nitrate_row3_no3', v))}
          {renderNumInput('ค่าเฉลี่ย', String(calcs.avgNR3), () => {}, true)}
        </div>
      </div>

      {/* Nitrate averages */}
      <div className="border-t pt-3 mt-3 space-y-3">
        {renderReadOnly('ค่าเฉลี่ยไนเตรทลูกที่1', calcs.avgNN1)}
        {renderReadOnly('ค่าเฉลี่ยไนเตรทลูกที่2', calcs.avgNN2)}
        {renderReadOnly('ค่าเฉลี่ยไนเตรทลูกที่3', calcs.avgNN3)}
        {renderReadOnly('ค่าเฉลี่ยไนเตรทรวม', calcs.avgTotalN)}
      </div>

      {/* Totals & percentages */}
      <div className="border-t pt-3 mt-3 space-y-3">
        {renderReadOnly('ผลรวมลูกใหญ่', calcs.tLarge)}
        {renderReadOnly('ผลรวมลูกเล็ก', calcs.tSmall)}
        {renderReadOnly('ผลรวมลูกจิ๋ว', calcs.tVS)}
        {renderReadOnly('ผลรวมตำหนิอื่นๆ', calcs.tDefect)}
        {renderReadOnly('ผลรวมสัตว์ทำลาย', calcs.tDestroyed)}
        {renderReadOnly('เปอร์เซนต์ลูกใหญ่ (%)', calcs.lPerc)}
        {renderReadOnly('เปอร์เซนต์ลูกเล็ก (%)', calcs.sPerc)}
        {renderReadOnly('เปอร์เซนต์ลูกจิ๋ว (%)', calcs.vsPerc)}
        {renderReadOnly('เปอร์เซนต์ตำหนิอื่นๆ (%)', calcs.dPerc)}
        {renderReadOnly('เปอร์เซนต์สัตว์ทำลาย (%)', calcs.destPerc)}
        {renderReadOnly('เปอร์เซนต์ลูกปกติ (%)', calcs.nPerc)}
        {renderReadOnly('ลูกปกติ (good_products)', calcs.gProducts)}
        {renderReadOnly('ผลรวมทั้งหมด (total_all)', calcs.tAll)}
      </div>

      {/* Weights */}
      <div className="border-t pt-3 mt-3 space-y-3">
        {renderNumInput('น้ำหนักเฉลี่ยลูกใหญ่ (default 1.0)', formData.large_weight, v => updateFn('large_weight', v))}
        {renderNumInput('น้ำหนักเฉลี่ยลูกเล็ก (default 0.7)', formData.small_weight, v => updateFn('small_weight', v))}
        {renderNumInput('น้ำหนักเฉลี่ยลูกจิ๋ว (default 0.3)', formData.very_small_weight, v => updateFn('very_small_weight', v))}
      </div>

      {/* Prediction */}
      <div className="border-t pt-3 mt-3 space-y-3">
        {renderReadOnly('ผลผลิตที่คาดหมายครั้งแรก', formData.first_prediction_product)}
        {renderReadOnly('ผลผลิตที่คาดหมาย (Kg.)', calcs.predKg)}
      </div>

      {/* Photo */}
      <div className="border-t pt-3 mt-3">
        <Label>Photo</Label>
        {formData.photo && (
          <div className="relative w-full h-48 rounded-md overflow-hidden border border-border mb-2">
            <img src={formData.photo} alt={bucketLabel} className="w-full h-full object-cover" />
            <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => updateFn('photo', '')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <Button variant="outline" size="sm" asChild disabled={uploadingPhoto}>
            <span><Upload className="h-4 w-4 mr-1" />{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={photoUploader} disabled={uploadingPhoto} />
        </label>
      </div>
    </>
  );

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
                  <div>
                    <Label>รอบติดตาม *</Label>
                    <Select value={form.รอบติดตาม} onValueChange={v => updateField('รอบติดตาม', v)}>
                      <SelectTrigger><SelectValue placeholder="เลือกรอบติดตาม" /></SelectTrigger>
                      <SelectContent>{followUpOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {renderDatePicker('Date *', form.date, d => updateField('date', d))}
                  <div><Label>Environment</Label><Input value={form.Environment} onChange={e => updateField('Environment', e.target.value)} placeholder="Environment" /></div>
                  <div><Label>โรค</Label><Input value={form.โรค} onChange={e => updateField('โรค', e.target.value)} placeholder="โรค" /></div>
                  <div><Label>การตาย</Label><Input value={form.การตาย} onChange={e => updateField('การตาย', e.target.value)} placeholder="การตาย" /></div>
                  <div><Label>Previous weight</Label><Input type="number" value={form.previous_weight} onChange={e => updateField('previous_weight', e.target.value)} placeholder="0" /></div>
                  <div><Label>Very small ≤ 4.5 cm. (ลูกจิ๋ว)</Label><Input type="number" value={form.sub_small} onChange={e => updateField('sub_small', e.target.value)} placeholder="0" /></div>
                  <div><Label>Small 4.5 {'<'} x ≤ 6 cm. (ลูกเล็ก)</Label><Input type="number" value={form.small} onChange={e => updateField('small', e.target.value)} placeholder="0" /></div>
                  <div><Label>Medium 6 {'<'} x ≤ 8.5 cm. (ลูกกลาง)</Label><Input type="number" value={form.medium} onChange={e => updateField('medium', e.target.value)} placeholder="0" /></div>
                  <div><Label>Large 8.5 {'<'} x ≤ 9.5 cm. (ลูกใหญ่)</Label><Input type="number" value={form.large} onChange={e => updateField('large', e.target.value)} placeholder="0" /></div>
                  <div><Label>Very large {'>'} 9.5 cm. (ลูกใหญ่พิเศษ)</Label><Input type="number" value={form.very_large} onChange={e => updateField('very_large', e.target.value)} placeholder="0" /></div>
                  {renderReadOnly('Average weight (Kg.)', averageWeight)}
                </>
              ) : isAfter60 ? (
                <>
                  {renderReadOnly("Plot's month (M-Y plot)", after60Form['M-Y plot'])}
                  {renderReadOnly('Force month', after60Form.m_y_force)}
                  {renderReadOnly('Area', after60Form.Area)}
                  {renderReadOnly('Force plant', after60Form.force_plant)}
                  {renderReadOnly('Force date', after60Form.force_date ? format(after60Form.force_date, 'PPP') : '')}
                  {renderDatePicker('Inspection date', after60Form.inspection_date, d => updateAfter60Field('inspection_date', d))}
                  <div className="border-t pt-3 mt-3">
                    <p className="font-semibold text-sm mb-2">แถวที่ 1</p>
                    <div className="grid grid-cols-3 gap-2">
                      {renderNumInput('ต้นที่ออกผล', after60Form.fruiting_row1, v => updateAfter60Field('fruiting_row1', v))}
                      {renderNumInput('ต้นที่ไม่ออกผล', after60Form['Non-fruiting_row1'], v => updateAfter60Field('Non-fruiting_row1', v))}
                      {renderNumInput('ผลรวม', String(totalRow1_60), () => {}, true)}
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <p className="font-semibold text-sm mb-2">แถวที่ 2</p>
                    <div className="grid grid-cols-3 gap-2">
                      {renderNumInput('ต้นที่ออกผล', after60Form.fruiting_row2, v => updateAfter60Field('fruiting_row2', v))}
                      {renderNumInput('ต้นที่ไม่ออกผล', after60Form.non_fruiting_row2, v => updateAfter60Field('non_fruiting_row2', v))}
                      {renderNumInput('ผลรวม', String(totalRow2_60), () => {}, true)}
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <p className="font-semibold text-sm mb-2">แถวที่ 3</p>
                    <div className="grid grid-cols-3 gap-2">
                      {renderNumInput('ต้นที่ออกผล', after60Form.fruiting_row3, v => updateAfter60Field('fruiting_row3', v))}
                      {renderNumInput('ต้นที่ไม่ออกผล', after60Form.non_fruiting_row3, v => updateAfter60Field('non_fruiting_row3', v))}
                      {renderNumInput('ผลรวม', String(totalRow3_60), () => {}, true)}
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3 space-y-3">
                    {renderReadOnly('ผลรวมต้นที่ออกผล', totalFruiting)}
                    {renderReadOnly('ผลรวมต้นที่ไม่ออกผล', totalNonFruiting)}
                    {renderReadOnly('ผลรวมทั้งหมด', totalAll_60)}
                    {renderReadOnly('เปอร์เซนต์ต้นที่ออกผล (%)', fruitingPerc)}
                    {renderReadOnly('เปอร์เซนต์ต้นที่ไม่ออกผล (%)', nonFruitingPerc)}
                    {renderReadOnly('จำนวนต้นที่ให้ผลผลิต', productivePlant)}
                    {renderDatePicker('คาดหมายวันเก็บผลผลิต', after60Form.est_harvest_date, d => updateAfter60Field('est_harvest_date', d))}
                    {renderReadOnly('คาดหมายผลผลิตเบื้องต้น', estProducts)}
                    <div>
                      <Label>Photo</Label>
                      {after60Form.plant_photo && (
                        <div className="relative w-full h-48 rounded-md overflow-hidden border border-border mb-2">
                          <img src={after60Form.plant_photo} alt="Plant" className="w-full h-full object-cover" />
                          <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => updateAfter60Field('plant_photo', '')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Button variant="outline" size="sm" asChild disabled={uploading60Photo}>
                          <span><Upload className="h-4 w-4 mr-1" />{uploading60Photo ? 'Uploading...' : 'Upload Photo'}</span>
                        </Button>
                        <input type="file" accept="image/*" className="hidden" onChange={handle60PhotoUpload} disabled={uploading60Photo} />
                      </label>
                    </div>
                  </div>
                </>
              ) : isAfter120 ? (
                render120_140Form(after120Form, updateAfter120Field, {
                  totalRow1: totalRow1_120, totalRow2: totalRow2_120, totalRow3: totalRow3_120,
                  avgNR1: avgNitrateRow1, avgNR2: avgNitrateRow2, avgNR3: avgNitrateRow3,
                  avgNN1: avgNitrateNo1, avgNN2: avgNitrateNo2, avgNN3: avgNitrateNo3, avgTotalN: avgTotalNitrate,
                  tLarge: totalLarge, tSmall: totalSmall, tVS: totalVerySmall, tDefect: totalDefect, tDestroyed: totalDestroyed,
                  tAll: totalAll_120, gProducts: goodProducts,
                  lPerc: largePerc, sPerc: smallPerc, vsPerc: verySmallPerc, dPerc: defectPerc, destPerc: destroyedPerc, nPerc: normalPerc,
                  predKg: predictionProductKg,
                }, handle120PhotoUpload, uploading120Photo, '120D')
              ) : isAfter140 ? (
                render120_140Form(after140Form, updateAfter140Field, {
                  totalRow1: totalRow1_140, totalRow2: totalRow2_140, totalRow3: totalRow3_140,
                  avgNR1: avgNitrateRow1_140, avgNR2: avgNitrateRow2_140, avgNR3: avgNitrateRow3_140,
                  avgNN1: avgNitrateNo1_140, avgNN2: avgNitrateNo2_140, avgNN3: avgNitrateNo3_140, avgTotalN: avgTotalNitrate_140,
                  tLarge: totalLarge_140, tSmall: totalSmall_140, tVS: totalVerySmall_140, tDefect: totalDefect_140, tDestroyed: totalDestroyed_140,
                  tAll: totalAll_140, gProducts: goodProducts_140,
                  lPerc: largePerc_140, sPerc: smallPerc_140, vsPerc: verySmallPerc_140, dPerc: defectPerc_140, destPerc: destroyedPerc_140, nPerc: normalPerc_140,
                  predKg: predictionProductKg_140,
                }, handle140PhotoUpload, uploading140Photo, '140D')
              ) : isHarvestPlan ? (
                <>
                  <div>
                    <Label>Week *</Label>
                    <Select value={harvestForm.week} onValueChange={v => updateHarvestField('week', v)}>
                      <SelectTrigger><SelectValue placeholder="เลือกสัปดาห์" /></SelectTrigger>
                      <SelectContent>{weekOptions.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {renderDatePicker('Predict date', harvestForm.predict_date, d => updateHarvestField('predict_date', d))}
                  {renderDatePicker('Actual date', harvestForm.actual_date, d => updateHarvestField('actual_date', d))}
                  <div><Label>แผนการส่ง (harvest_plan)</Label><Input type="number" value={harvestForm.harvest_plan} onChange={e => updateHarvestField('harvest_plan', e.target.value)} placeholder="0" /></div>
                  <div><Label>ส่งจริง (actual_havest)</Label><Input type="number" value={harvestForm.actual_havest} onChange={e => updateHarvestField('actual_havest', e.target.value)} placeholder="0" /></div>
                  <div><Label>เก็บเข้ามาก่อน (move_to_previous_week)</Label><Input type="number" value={harvestForm.move_to_previous_week} onChange={e => updateHarvestField('move_to_previous_week', e.target.value)} placeholder="0" /></div>
                  <div><Label>เลื่อนไปสัปดาห์อื่น (postpone_another_week)</Label><Input type="number" value={harvestForm.postpone_another_week} onChange={e => updateHarvestField('postpone_another_week', e.target.value)} placeholder="0" /></div>
                  <div><Label>มาจากสัปดาห์ก่อน (move_from_previous_week)</Label><Input type="number" value={harvestForm.move_from_previous_week} onChange={e => updateHarvestField('move_from_previous_week', e.target.value)} placeholder="0" /></div>
                  <div><Label>บังคับจริง (actual_forcing)</Label><Input type="number" value={harvestForm.actual_forcing} onChange={e => updateHarvestField('actual_forcing', e.target.value)} placeholder="0" /></div>
                  <div><Label>นอกแผน (out_plan)</Label><Input type="number" value={harvestForm.out_plan} onChange={e => updateHarvestField('out_plan', e.target.value)} placeholder="0" /></div>
                  <div><Label>คุณภาพต่ำ (low_quality)</Label><Input type="number" value={harvestForm.low_quality} onChange={e => updateHarvestField('low_quality', e.target.value)} placeholder="0" /></div>
                  <div><Label>ขายที่อื่น (sale_elsewhere)</Label><Input type="number" value={harvestForm.sale_elsewhere} onChange={e => updateHarvestField('sale_elsewhere', e.target.value)} placeholder="0" /></div>
                  <div><Label>ประเมิณคลาดเคลื่อน (est_error)</Label><Input type="number" value={harvestForm.est_error} onChange={e => updateHarvestField('est_error', e.target.value)} placeholder="0" /></div>
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
                      : (isAfter60 || isAfter120 || isAfter140) && rec.inspection_date
                      ? format(parseISO(rec.inspection_date as string), 'PPP')
                      : isHarvestPlan && rec.week
                      ? (rec.week as string)
                      : format(new Date(rec.created_at), 'PPp')}
                    {isInspectionTable && rec['รอบติดตาม'] && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{rec['รอบติดตาม'] as string}</span>
                    )}
                    {isHarvestPlan && rec.week && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{rec.week as string}</span>
                    )}
                  </span>
                  <div className="flex gap-1">
                    {(isInspectionTable || isAfter60 || isAfter120 || isAfter140 || isHarvestPlan) && (
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
              {isAfter60 && (
                <CardContent className="text-sm space-y-1">
                  {rec['M-Y plot'] && <p><span className="text-muted-foreground">Plot's month:</span> {rec['M-Y plot'] as string}</p>}
                  {rec.Area != null && <p><span className="text-muted-foreground">Area:</span> {String(rec.Area)}</p>}
                  {rec.total_fruiting != null && <p><span className="text-muted-foreground">ผลรวมต้นที่ออก:</span> {String(rec.total_fruiting)}</p>}
                  {rec['total_non-fruiting'] != null && <p><span className="text-muted-foreground">ผลรวมต้นที่ไม่ออก:</span> {String(rec['total_non-fruiting'])}</p>}
                  {rec.total_all != null && <p><span className="text-muted-foreground">ผลรวมทั้งหมด:</span> {String(rec.total_all)}</p>}
                  {rec.fruiting_perc != null && <p><span className="text-muted-foreground">ออกผล:</span> {String(rec.fruiting_perc)}%</p>}
                  {rec.productive_plant != null && <p><span className="text-muted-foreground">ต้นที่ให้ผลผลิต:</span> {String(rec.productive_plant)}</p>}
                  {rec.plant_photo && <img src={rec.plant_photo as string} alt="Plant" className="w-full h-32 object-cover rounded-md mt-2" />}
                </CardContent>
              )}
              {(isAfter120 || isAfter140) && (
                <CardContent className="text-sm space-y-1">
                  {rec.m_y_plot && <p><span className="text-muted-foreground">Plot's month:</span> {rec.m_y_plot as string}</p>}
                  {rec.area != null && <p><span className="text-muted-foreground">Area:</span> {String(rec.area)}</p>}
                  {rec.total_all != null && <p><span className="text-muted-foreground">ผลรวมทั้งหมด:</span> {String(rec.total_all)}</p>}
                  {rec.good_products != null && <p><span className="text-muted-foreground">ลูกปกติ:</span> {String(rec.good_products)}</p>}
                  {rec.normal_perc != null && <p><span className="text-muted-foreground">ปกติ:</span> {String(rec.normal_perc)}%</p>}
                  {rec.avg_total_nitrate != null && <p><span className="text-muted-foreground">ไนเตรทเฉลี่ย:</span> {String(rec.avg_total_nitrate)}</p>}
                  {rec.prediction_product_kg != null && <p><span className="text-muted-foreground">คาดหมาย (Kg.):</span> {String(rec.prediction_product_kg)}</p>}
                  {rec.photo && <img src={rec.photo as string} alt={isAfter120 ? '120D' : '140D'} className="w-full h-32 object-cover rounded-md mt-2" />}
                </CardContent>
              )}
              {isHarvestPlan && (
                <CardContent className="text-sm space-y-1">
                  {rec.predict_date && <p><span className="text-muted-foreground">Predict date:</span> {format(parseISO(rec.predict_date as string), 'PPP')}</p>}
                  {rec.actual_date && <p><span className="text-muted-foreground">Actual date:</span> {format(parseISO(rec.actual_date as string), 'PPP')}</p>}
                  {rec.harvest_plan != null && <p><span className="text-muted-foreground">แผนการส่ง:</span> {String(rec.harvest_plan)}</p>}
                  {rec.actual_havest != null && <p><span className="text-muted-foreground">ส่งจริง:</span> {String(rec.actual_havest)}</p>}
                  {rec.actual_forcing != null && <p><span className="text-muted-foreground">บังคับจริง:</span> {String(rec.actual_forcing)}</p>}
                  {rec.est_error != null && <p><span className="text-muted-foreground">ประเมิณคลาดเคลื่อน:</span> {String(rec.est_error)}</p>}
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
