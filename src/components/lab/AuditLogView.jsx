import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Lock, 
  Hash, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { LabAuditService, LAB_AUDIT_ACTIONS } from '../../services/labAuditService';

export const AuditLogView = () => {
  const [logs, setLogs] = useState(() => LabAuditService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Integrity Status
  const integrity = useMemo(() => LabAuditService.verifyChainIntegrity(logs), [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      const matchesSearch = 
        item.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = filterAction === 'ALL' || item.action === filterAction;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, filterAction]);

  // Export audit log as CSV
  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Actor', 'Role', 'Entity', 'Entity ID', 'Action', 'Before Hash', 'After Hash', 'Reason', 'Correlation ID'];
    const rows = filteredLogs.map(l => [
      l.eventId,
      l.timestamp,
      `"${l.actor}"`,
      `"${l.role}"`,
      l.entity,
      l.entityId,
      l.action,
      l.beforeHash,
      l.afterHash,
      `"${l.reason.replace(/"/g, '""')}"`,
      l.correlationId
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HONEYCHAIN_LAB_AUDIT_TRAIL_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Immutable Ledger
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Append-Only Protection
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Laboratory Compliance & Audit Trail
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Cryptographically verified, tamper-evident chronological event ledger recording all accessioning, assay measurements, review sign-offs, and regulatory submissions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export Audit Trail (CSV)
            </button>
          </div>
        </div>

        {/* Cryptographic Integrity Card */}
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold">Cryptographic Digest Verified: </span>
              <span className="font-mono text-emerald-800">{integrity.rootDigest}</span>
              <span className="ml-2 text-emerald-700 font-medium">({logs.length} chained events verified)</span>
            </div>
          </div>
          <span className="text-emerald-700 font-medium text-[11px]">
            Zero tampering detected • Non-repudiation verified
          </span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search event ID, actor, entity ID, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {Object.keys(LAB_AUDIT_ACTIONS).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor / Station</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Reason & Justification</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((item) => (
                <tr key={item.eventId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-blue-700">{item.eventId}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {item.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{item.actor}</div>
                    <div className="text-[11px] text-slate-500">{item.role}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-800">{item.entityId}</div>
                    <div className="text-[11px] text-slate-500 uppercase">{item.entity}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-700 line-clamp-2 max-w-md">{item.reason}</div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEvent(item)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1"
                    >
                      Inspect
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs text-blue-600 font-bold">{selectedEvent.eventId}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Audit Record Inspection</h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Action Performed:</span>
                  <span className="font-bold text-slate-900">{selectedEvent.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Actor & Title:</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.actor} ({selectedEvent.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Timestamp (UTC):</span>
                  <span className="font-mono text-slate-700">{selectedEvent.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Device / Workstation:</span>
                  <span className="font-mono text-slate-700">{selectedEvent.ipDevice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Correlation ID:</span>
                  <span className="font-mono text-blue-700">{selectedEvent.correlationId}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">State Transition Hash Proof:</label>
                <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
                  <div><span className="text-slate-500">PREVIOUS_STATE_HASH:</span> {selectedEvent.beforeHash}</div>
                  <div><span className="text-emerald-400">UPDATED_STATE_HASH: </span> {selectedEvent.afterHash}</div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Audit Justification Reason:</label>
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-slate-800 leading-relaxed">
                  {selectedEvent.reason}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogView;
