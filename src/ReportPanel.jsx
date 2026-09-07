import React, { useState } from 'react';
import { Download, FileCheck2, LoaderCircle } from 'lucide-react';
import { evidenceTasks, progressSummary, taskStatus } from './evidence.js';
import { downloadFile } from './storage.js';

export function ReportPanel({ profile, work, setWork, busy, onBackup }) {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const stats = progressSummary(work);
  async function downloadReport() {
    setExporting(true); setMessage('');
    try {
      const { createReport, reportFilename } = await import('./report.js');
      const doc = createReport(profile, work);
      downloadFile(reportFilename(profile), doc.output('arraybuffer'), 'application/pdf');
      setMessage('Your PDF is ready. Find it in Downloads or Files, then attach it to your Teams assignment.');
    } catch (error) { setMessage(error.message || 'The PDF could not be made. Download your lesson backup to keep your work.'); }
    finally { setExporting(false); }
  }
  return <div className="report-panel">
    <div className="report-identity"><FileCheck2 size={25}/><div><b>{profile.name}</b><span>{profile.className} · Lesson 1</span></div></div>
    <p className="modal-intro">Keep a record of what you tried, tested and learned. Your PDF includes your code, recent attempts, check results and explanations.</p>
    <div className="report-stats"><div><b>{stats.tasks}</b><span>tasks with work</span></div><div><b>{stats.passed}<small> / 6</small></b><span>practice checks passed</span></div><div><b>{stats.runs}</b><span>recorded runs</span></div></div>
    <label className="field-label" htmlFor="report-reflection">One test I tried… My next step…</label>
    <textarea id="report-reflection" rows={3} maxLength={6000} value={work.reflection || ''} onChange={e => setWork(old => ({ ...old, reflection: e.target.value }))} placeholder="I tested… because… Next I want to…"/>
    <details className="report-included"><summary>See the tasks in my report ({stats.tasks})</summary>{evidenceTasks(work).length ? evidenceTasks(work).map(task => <div key={task.id}><b>{task.title}</b><span>{taskStatus(task, work)}</span></div>) : <p>Run or edit a program to start collecting evidence.</p>}</details>
    <p className="report-note">The report shows the latest 8 attempts per task and keeps total run and check counts. You can add “Explain my program” notes below the editor. Checks are practice feedback; your explanation helps your teacher understand your learning.</p>
    {busy && <p role="status">Finish or stop your program before downloading the report.</p>}
    <button className="primary-button full" disabled={busy || exporting} onClick={downloadReport}>{exporting ? <LoaderCircle className="spin" size={18}/> : <Download size={18}/>} {exporting ? 'Making your PDF…' : 'Download my learning report (PDF)'}</button>
    {message && <p className="report-message" role="status">{message}</p>}
    <div className="teams-steps"><h3>Hand it in on Teams</h3><ol><li>Download your PDF.</li><li>Open your teacher’s assignment in Teams and attach the PDF from Downloads or Files.</li><li>Select <b>Turn in</b> when you are ready.</li></ol><p>This app does not submit work to Teams for you.</p></div>
    <button className="text-button" onClick={onBackup}><Download size={16}/> Download a lesson backup too</button>
  </div>;
}
