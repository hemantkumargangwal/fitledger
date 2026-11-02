import { useState } from 'react';
import { AlertCircle, Check, FileUp, Upload, X } from 'lucide-react';
import ModalForm from './ModalForm';
import Spinner from './Spinner';
import { memberService } from '../services/memberService';

const MemberImportModal = ({ isOpen, onClose, onComplete }) => {
  const [preview, setPreview] = useState(null);
  const [mappings, setMappings] = useState({});
  const [duplicateActions, setDuplicateActions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const reset = () => { setPreview(null); setMappings({}); setDuplicateActions({}); setError(''); setResult(null); };
  const close = () => { if (!loading) { reset(); onClose(); } };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await memberService.previewImport(file);
      setPreview(response); setMappings(response.mappedFields || {});
    } catch (uploadError) { setError(uploadError.response?.data?.error?.message || uploadError.response?.data?.message || 'The file could not be read.'); }
    finally { setLoading(false); event.target.value = ''; }
  };
  const refreshPreview = async () => {
    if (!preview) return;
    setLoading(true); setError('');
    try {
      const response = await memberService.reviewImport({ importId: preview.importId, mappings });
      setPreview(response); setMappings(response.mappedFields || mappings);
    } catch (reviewError) { setError(reviewError.response?.data?.message || 'The import review expired. Upload the file again.'); }
    finally { setLoading(false); }
  };
  const commit = async () => {
    if (!preview) return;
    setLoading(true); setError('');
    try {
      const response = await memberService.commitImport({ importId: preview.importId, mappings, duplicateActions });
      setResult(response); onComplete?.();
    } catch (commitError) { setError(commitError.response?.data?.message || 'Members could not be imported.'); }
    finally { setLoading(false); }
  };

  return <ModalForm isOpen={isOpen} onClose={close} title="Import members" className="sm:!max-w-6xl">
    <div className="space-y-5">
      {!preview && !result && <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-lime-400 hover:bg-lime-50"><FileUp className="mb-3 h-9 w-9 text-lime-700" /><span className="font-bold text-slate-900">Choose CSV or Excel file</span><span className="mt-1 text-sm text-slate-500">CSV, XLS, or XLSX · maximum 5 MB · first sheet is imported</span><input className="sr-only" type="file" accept=".csv,.xls,.xlsx" onChange={upload} disabled={loading} /></label>}
      {loading && <div className="flex items-center justify-center gap-2 py-8 text-slate-600"><Spinner size="sm" />Preparing import review…</div>}
      {error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
      {preview && !result && !loading && <>
        <div className="grid gap-3 sm:grid-cols-4">{[['Rows', preview.summary.totalRows], ['Ready', preview.summary.validRows], ['Duplicates', preview.summary.duplicates], ['Invalid', preview.summary.invalidRows]].map(([label, count]) => <div key={label} className="rounded-xl bg-slate-100 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{count}</p></div>)}</div>
        <div><h3 className="font-extrabold text-slate-900">Check column mapping</h3><p className="mt-1 text-sm text-slate-500">Only mapped fields are imported. Name and mobile must be mapped for a row to be valid.</p><div className="mt-3 max-h-64 overflow-auto rounded-xl border border-slate-200"><table className="min-w-full text-sm"><thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">File column</th><th className="p-3">Import as</th></tr></thead><tbody>{preview.headers.map((header) => <tr key={header} className="border-t border-slate-100"><td className="p-3 font-semibold text-slate-800">{header}</td><td className="p-2"><select className="input !py-2" value={mappings[header] || ''} onChange={(event) => setMappings((current) => ({ ...current, [header]: event.target.value }))}><option value="">Ignore this column</option>{Object.entries(preview.supportedFields).map(([field, label]) => <option key={field} value={field}>{label}</option>)}</select></td></tr>)}</tbody></table></div><p className="mt-2 text-xs text-slate-500">Ignored: {preview.ignoredColumns.length ? preview.ignoredColumns.join(', ') : 'None'}</p></div>
        {preview.rows.some((row) => row.duplicate) && <div><h3 className="font-extrabold text-slate-900">Duplicate review</h3><p className="mt-1 text-sm text-slate-500">Existing records are skipped unless you explicitly choose to update them. Blank imported values never replace existing fields.</p><div className="mt-3 max-h-48 overflow-auto rounded-xl border border-amber-200"><table className="min-w-full text-sm"><tbody>{preview.rows.filter((row) => row.duplicate).map((row) => <tr key={row.rowNumber} className="border-b border-amber-100"><td className="p-3">Row {row.rowNumber}: {row.name || 'Unnamed'} ({row.phone || 'No mobile'})</td><td className="p-2">{row.duplicate.type === 'existing' ? <select className="input !py-2" value={duplicateActions[row.rowNumber] || 'skip'} onChange={(event) => setDuplicateActions((current) => ({ ...current, [row.rowNumber]: event.target.value }))}><option value="skip">Skip existing member</option><option value="update">Update existing non-empty fields</option></select> : <span className="text-amber-700">Skip duplicate in file</span>}</td></tr>)}</tbody></table></div></div>}
        {preview.rows.some((row) => row.errors.length) && <div className="max-h-36 overflow-auto rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{preview.rows.filter((row) => row.errors.length).map((row) => <p key={row.rowNumber}>Row {row.rowNumber}: {row.errors.join(', ')}</p>)}</div>}
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={close} className="btn-secondary">Cancel</button><button type="button" onClick={refreshPreview} className="btn-secondary">Refresh preview</button><button type="button" onClick={commit} disabled={!preview.summary.validRows && !preview.summary.duplicates} className="btn-primary"><Upload className="h-4 w-4" />Import reviewed members</button></div>
      </>}
      {result && <><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex gap-2"><Check className="h-5 w-5 text-emerald-700" /><div><h3 className="font-extrabold text-emerald-900">Import completed</h3><p className="mt-1 text-sm text-emerald-800">Created {result.created}, updated {result.updated}, skipped {result.skipped}, failed {result.failed}.</p></div></div></div><div className="max-h-56 overflow-auto rounded-xl border border-slate-200 p-3 text-sm">{result.details.map((item) => <p key={`${item.rowNumber}-${item.status}`} className="py-1">Row {item.rowNumber}: <span className="font-bold">{item.status}</span>{item.reason ? ` — ${item.reason}` : ''}</p>)}</div><div className="flex justify-end"><button type="button" onClick={close} className="btn-primary">Done</button></div></>}
    </div>
  </ModalForm>;
};

export default MemberImportModal;
