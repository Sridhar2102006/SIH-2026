const fs = require('fs');
const path = 'D:/SIH-2026/src/components/more/WorkSetupModal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace imports
content = content.replace(
  /import\s*\{\s*CAPABILITIES,\s*DESIGNATIONS,\s*WORKSPACE_MODULES,\s*evaluateCapabilities,\s*resolveAccessProfile,\s*ACCESS_POLICY_VERSION\s*\}\s*from\s*'\.\.\/\.\.\/services\/capabilityEngine';/,
  `import {
  CAPABILITY_CATALOG,
  CAPABILITY_MAP,
  CapabilityRegistry
} from '../../services/capabilityRegistry';
import {
  CANONICAL_DESIGNATION_POLICY,
  evaluateCanonicalDesignationEligibility
} from '../../services/designationEngine';
import {
  WORKSPACE_MODULE_REGISTRY,
  resolvePermissionsAndModules,
  ACCESS_POLICY_VERSION
} from '../../services/capabilityEngine';`
);

// Replace CAPABILITIES references with user-accessible canonical capabilities
content = content.replace(
  'const filteredCapabilities = useMemo(() => {\n    return CAPABILITIES.filter(cap => {',
  'const accessibleCapabilities = useMemo(() => CAPABILITY_CATALOG.filter(c => !["SYSTEM_ONLY", "PRIVILEGED"].includes(c.capabilityClass)), []);\n  const filteredCapabilities = useMemo(() => {\n    return accessibleCapabilities.filter(cap => {'
);

// Replace evaluation with canonical eligibility
content = content.replace(
  'const evaluation = useMemo(() => {\n    return evaluateCapabilities(selectedCaps);\n  }, [selectedCaps]);',
  `const evaluation = useMemo(() => {
    const res = evaluateCanonicalDesignationEligibility(selectedCaps);
    return {
      contextMessage: res.suggestions.length > 0 ? "Matches " + res.suggestions.map(s => s.name).join(' + ') : 'Select tasks to establish your workspace profile',
      suggestedDesignations: res.suggestions,
      suggestedDesignationIds: res.suggestions.map(s => s.designationId),
      evaluations: res.evaluations
    };
  }, [selectedCaps]);`
);

// Update toggleCap to handle dependencies
content = content.replace(
  /const toggleCap = \(id\) => \{[\s\S]*?setConfirmedDesigs\(evalResult\.suggestedDesignationIds\);[\s\S]*?return updated;\s*\}\);\s*\};/,
  `const toggleCap = (id) => {
    setSelectedCaps(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.length > 1 ? prev.filter(c => c !== id) : prev;
      } else {
        const depResult = CapabilityRegistry.resolveCapabilityDependencies([id]);
        updated = Array.from(new Set([...prev, id, ...depResult.dependencies]));
      }
      const evalRes = evaluateCanonicalDesignationEligibility(updated);
      if (evalRes.suggestions && evalRes.suggestions.length > 0) {
        setConfirmedDesigs(evalRes.suggestions.map(s => s.designationId));
      }
      return updated;
    });
  };`
);

// Replace DESIGNATIONS iteration with CANONICAL_DESIGNATION_POLICY
content = content.replace(
  /DESIGNATIONS\.map\(d => \{/g,
  'CANONICAL_DESIGNATION_POLICY.map(d => {'
);

content = content.replace(
  /DESIGNATIONS\.find\(item => item\.id === desigId\)/g,
  'CANONICAL_DESIGNATION_POLICY.find(item => item.id === desigId)'
);

content = content.replace(
  /WORKSPACE_MODULES\.find\(m => m\.id === id\)/g,
  'WORKSPACE_MODULE_REGISTRY.find(m => m.id === id)'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully modernized WorkSetupModal.jsx');
