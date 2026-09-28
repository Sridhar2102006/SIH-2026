import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Plus, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { REGULATORY_STANDARDS } from '../../services/regulatoryRulesEngine';

const INITIAL_METHODS = [
  {
    methodId: 'FSSAI-METH-03-01',
    methodName: 'Determination of Moisture Content by Refractometry',
    parameter: 'MOISTURE',
    analyte: 'Moisture (%)',
    productCategory: 'Honey & Beehive Products',
    referenceSource: 'FSSAI Manual of Methods of Analysis of Foods - Honey (Manual 03)',
    methodVersion: 'v2026.1',
    effectiveDate: '2026-01-01',
    status: 'ACTIVE',
    equipmentRequirement: 'EQ-REFR-001 (Digital Precision Honey Refractometer)',
    accreditationScope: 'NABL ISO/IEC 17025 Accredited',
    isAccredited: true,
    regulatoryLimit: '<= 20.0% w/w (FSS Regulations 2026)',
    measurementRange: '13.0% - 25.0%',
    uncertainty: '± 0.2%'
  },
  {
    methodId: 'FSSAI-METH-03-02',
    methodName: 'Determination of Hydroxymethylfurfural (HMF) by Spectrophotometry',
    parameter: 'HMF',
    analyte: 'HMF (mg/kg)',
    productCategory: 'Honey & Beehive Products',
    referenceSource: 'FSSAI Manual of Methods of Analysis of Foods - Honey (Manual 03) / Winkler',
    methodVersion: 'v2026.1',
    effectiveDate: '2026-01-01',
    status: 'ACTIVE',
    equipmentRequirement: 'EQ-UVVIS-002 (Dual-Beam UV-Vis Spectrophotometer)',
    accreditationScope: 'NABL ISO/IEC 17025 Accredited',
    isAccredited: true,
    regulatoryLimit: '<= 80.0 mg/kg (Tropical Climate Limit)',
    measurementRange: '1.0 - 150.0 mg/kg',
    uncertainty: '± 1.5 mg/kg'
  },
  {
    methodId: 'FSSAI-METH-03-03',
    methodName: 'Determination of Diastase Activity by Phadebas Method',
    parameter: 'DIASTASE',
    analyte: 'Diastase Activity (Schade Units)',
    productCategory: 'Honey & Beehive Products',
    referenceSource: 'FSSAI Manual of Methods of Analysis of Foods - Honey (Manual 03) / Phadebas',
    methodVersion: 'v2026.1',
    effectiveDate: '2026-01-01',
    status: 'ACTIVE',
    equipmentRequirement: 'EQ-UVVIS-002 (Dual-Beam UV-Vis Spectrophotometer)',
    accreditationScope: 'NABL ISO/IEC 17025 Accredited',
    isAccredited: true,
    regulatoryLimit: '>= 8.0 Schade Units (FSS Regulations 2026)',
    measurementRange: '3.0 - 50.0 Schade Units',
    uncertainty: '± 0.4 Schade'
  },
  {
    methodId: 'FSSAI-METH-03-04',
    methodName: 'Determination of Electrical Conductivity',
    parameter: 'CONDUCTIVITY',
    analyte: 'Electrical Conductivity (mS/cm)',
    productCategory: 'Honey & Beehive Products',
    referenceSource: 'FSSAI Manual of Methods of Analysis of Foods - Honey (Manual 03) / ISO 13965',
    methodVersion: 'v2026.1',
    effectiveDate: '2026-01-01',
    status: 'ACTIVE',
    equipmentRequirement: 'EQ-COND-003 (Precision Benchtop Conductivity Meter)',
    accreditationScope: 'NABL ISO/IEC 17025 Accredited',
    isAccredited: true,
    regulatoryLimit: '<= 0.8 mS/cm (Floral Honey Standard)',
    measurementRange: '0.1 - 2.0 mS/cm',
    uncertainty: '± 0.02 mS/cm'
  },
  {
    methodId: 'AOAC-METH-998.12',
    methodName: 'C4 Plant Sugars Adulteration by Stable Carbon Isotope Ratio (EA-IRMS)',
    parameter: 'C4_SUGARS',
    analyte: 'Delta 13C Isotope Ratio (%)',
    productCategory: 'Honey & Beehive Products',
    referenceSource: 'AOAC Official Method 998.12 / EA-IRMS Standard Protocol',
    methodVersion: 'v2025.2',
    effectiveDate: '2025-06-15',
    status: 'RESEARCH_ONLY',
    equipmentRequirement: 'EQ-EA-IRMS-004 (Elemental Analyzer Isotope Ratio MS)',
    accreditationScope: 'Research Protocol (Non-Accredited Scope)',
    isAccredited: false,
    regulatoryLimit: '<= 7.0% Apparent C4 Sugars',
    measurementRange: '0.0% - 40.0%',
    uncertainty: '± 0.5%'
  },
  {
    methodId: 'MELISS-METH-01',
    methodName: 'Botanical & Floral Origin Verification by Melissopalynology',
    parameter: 'POLLEN',
    analyte: 'Dominant Pollen Frequency (%)',
    productCategory: 'Honey & Beehive Products',
    referenceSource: 'Louveaux et al. International Commission for Bee Botany (ICBB)',
    methodVersion: 'v2024.1',
    effectiveDate: '2024-03-01',
    status: 'ACTIVE',
    equipmentRequirement: 'EQ-MICR-005 (Research Phase-Contrast Microscope)',
    accreditationScope: 'NABL ISO/IEC 17025 Accredited',
    isAccredited: true,
    regulatoryLimit: '>= 80% Unifloral Dominance',
    measurementRange: '0% - 100%',
    uncertainty: '± 3.0%'
  }
];

export const MethodRegisterView = () => {
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState('ALL'); // 'ALL' | 'ACCREDITED' | 'RESEARCH'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered methods
  const filteredMethods = useMemo(() => {
    return methods.filter(m => {
      const matchesSearch = 
        m.methodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.methodId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.analyte.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.referenceSource.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesScope = 
        filterScope === 'ALL' ||
        (filterScope === 'ACCREDITED' && m.isAccredited) ||
        (filterScope === 'RESEARCH' && !m.isAccredited);

      return matchesSearch && matchesScope;
    });
  }, [methods, searchQuery, filterScope]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Official Analytical Register
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                FSSAI Manual 03 v2026.1 Active
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Test Method Register
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Versioned analytical methods aligned with the FSSAI Laboratory Manual for Honey and NABL ISO/IEC 17025 accreditation scope.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register New Method
            </button>
          </div>
        </div>

        {/* Regulatory Banner */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">ISO/IEC 17025 Scope Isolation Principle:</span> Unaccredited methods or research protocols are strictly tagged as <span className="font-mono font-medium text-slate-800">RESEARCH_ONLY</span>. HoneyChain report builders automatically prevent unaccredited analytical results from claiming NABL accreditation on official Certificates of Analysis (CoA).
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search method ID, parameter, analyte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">Accreditation:</span>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Methods ({methods.length})</option>
            <option value="ACCREDITED">NABL Accredited Only</option>
            <option value="RESEARCH">Research / Non-Accredited Only</option>
          </select>
        </div>
      </div>

      {/* Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMethods.map((m) => (
          <div
            key={m.methodId}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-sm transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {m.methodId}
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate-500 font-semibold">
                    {m.methodVersion}
                  </span>
                </div>
                {m.isAccredited ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Accredited
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Research Scope
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                {m.methodName}
              </h3>

              {/* Details List */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Analyte & Parameter:</span>
                  <span className="font-semibold text-slate-900">{m.analyte}</span>
                </div>
                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reference Standard:</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{m.referenceSource}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Regulatory Threshold:</span>
                  <span className="font-mono font-bold text-slate-900">{m.regulatoryLimit}</span>
                </div>
                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Required Equipment:</span>
                  <span className="font-medium text-blue-700 text-right">{m.equipmentRequirement}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Uncertainty (k=2):</span>
                  <span className="font-mono text-slate-700">{m.uncertainty}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Effective: {m.effectiveDate}
              </span>
              <button
                onClick={() => setSelectedMethod(m)}
                className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
              >
                Inspect Protocol
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Inspection Modal */}
      {selectedMethod && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs text-blue-600 font-bold">{selectedMethod.methodId} ({selectedMethod.methodVersion})</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedMethod.methodName}</h3>
              </div>
              <button 
                onClick={() => setSelectedMethod(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Standard Manual:</span>
                  <span className="font-semibold text-slate-800">{selectedMethod.referenceSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Accreditation Category:</span>
                  <span className="font-semibold text-slate-800">{selectedMethod.accreditationScope}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Validated Range:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedMethod.measurementRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Measurement Uncertainty:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedMethod.uncertainty}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-semibold text-blue-900 mb-1">Standard Calibration Prerequisite:</div>
                <p className="text-xs text-blue-800">
                  Before launching analysis under {selectedMethod.methodId}, instrument calibration certificates for {selectedMethod.equipmentRequirement} must be in an <span className="font-semibold underline">ACTIVE</span> state with calibration expiry verified.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMethod(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Method Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Register New Analytical Method</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const isAcc = formData.get('isAccredited') === 'true';
                const newMethod = {
                  methodId: formData.get('methodId') || `METH-${Date.now().toString().slice(-4)}`,
                  methodName: formData.get('methodName'),
                  parameter: formData.get('parameter'),
                  analyte: formData.get('analyte'),
                  productCategory: 'Honey & Beehive Products',
                  referenceSource: formData.get('referenceSource'),
                  methodVersion: formData.get('methodVersion') || 'v1.0',
                  effectiveDate: new Date().toISOString().split('T')[0],
                  status: isAcc ? 'ACTIVE' : 'RESEARCH_ONLY',
                  equipmentRequirement: formData.get('equipment'),
                  accreditationScope: isAcc ? 'NABL ISO/IEC 17025 Accredited' : 'Research Protocol (Non-Accredited)',
                  isAccredited: isAcc,
                  regulatoryLimit: formData.get('regulatoryLimit'),
                  measurementRange: 'Operational Range Defined in SOP',
                  uncertainty: '± 1.0%'
                };
                setMethods([newMethod, ...methods]);
                setIsAddModalOpen(false);
              }}
              className="py-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Method Identifier</label>
                <input
                  name="methodId"
                  required
                  placeholder="e.g. FSSAI-METH-03-05"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Standard Method Title</label>
                <input
                  name="methodName"
                  required
                  placeholder="e.g. Determination of Free Acidity in Honey by Titrimetry"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Analyte</label>
                  <input
                    name="analyte"
                    required
                    placeholder="e.g. Free Acidity (meq/kg)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Parameter Code</label>
                  <input
                    name="parameter"
                    required
                    placeholder="e.g. FREE_ACIDITY"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reference Standard</label>
                  <input
                    name="referenceSource"
                    required
                    placeholder="FSSAI Honey Manual 03 / AOAC"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Method Version</label>
                  <input
                    name="methodVersion"
                    required
                    defaultValue="v2026.1"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Equipment Requirement</label>
                <input
                  name="equipment"
                  required
                  placeholder="e.g. EQ-TITR-006 (Automatic Potentiometric Titrator)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Regulatory Threshold Limit</label>
                <input
                  name="regulatoryLimit"
                  required
                  placeholder="e.g. <= 50.0 meq/kg (FSS Regulations)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Accreditation Scope Status</label>
                <select
                  name="isAccredited"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="true">NABL ISO/IEC 17025 Accredited Scope</option>
                  <option value="false">Non-Accredited / Research Protocol Only</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MethodRegisterView;
