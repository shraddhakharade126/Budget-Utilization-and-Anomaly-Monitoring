import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { DataSourceItem } from '../../types';
import { Database, ExternalLink, ShieldCheck, FileText, Info } from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [disclaimer, setDisclaimer] = useState('');

  useEffect(() => {
    api.getDataSources().then((res) => {
      if (res.success) {
        setSources(res.sources);
        setDisclaimer(res.disclaimer);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>📑</span> Official Open Data Sources &amp; Transparency Disclosures
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Public finance frameworks, statutory audit alignment, and open data citations
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-xl flex items-start gap-3.5 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-white">Institutional Governance &amp; Statutory Standards</h3>
          <p className="text-blue-200/90 leading-relaxed font-sans">
            {disclaimer ||
              'This enterprise public finance portal monitors budget appropriations, departmental vouchers, and anomalous expenditure velocity. Data structures, classification schemes, and anomaly rules are aligned with public financial standards published by the Ministry of Finance and the Comptroller & Auditor General of India.'}
          </p>
        </div>
      </div>

      {/* Cited Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {src.sourceYear}
                </span>
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h4 className="text-sm font-bold text-white">{src.sourceName}</h4>
              <p className="text-xs text-slate-300 font-mono text-[11px]">
                Doc: {src.sourceDocument}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">{src.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-500" /> Public Domain Statutory Record
            </div>
          </div>
        ))}
      </div>

      {/* Standards & Accounting Nomenclature */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" /> Statutory Classification Schema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Demand for Grants</span>
            <p className="mt-1 text-slate-200">
              Departmental estimates approved by legislative authority representing expenditure ceilings.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Disbursement Voucher</span>
            <p className="mt-1 text-slate-200">
              Individual bill or sanction order debited against specific major/minor scheme expenditure heads.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Lapse Risk Window</span>
            <p className="mt-1 text-slate-200">
              Unspent scheme balances that face statutory surrender at fiscal year closure on March 31st.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
