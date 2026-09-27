import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const AdaptiveWorkspacePreviewScreen = ({
  workspacePreview = {},
  onContinue
}) => {
  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1 className="screen-title">Your HoneyChain workspace</h1>
        <p className="screen-subtitle">
          We've composed your navigation, dashboard, and tools around your confirmed capabilities.
        </p>
      </div>

      <div className="workspace-tools-accordion">
        {Object.entries(workspacePreview.groupedModules || {}).map(([category, modules]) => (
          <div key={category} className="workspace-group-card">
            <span className="workspace-cat-label">{category}</span>
            <div className="workspace-modules-list">
              {modules.map(mod => (
                <div key={mod.id} className="workspace-mod-row">
                  <div className="mod-left">
                    <CheckCircle2 size={16} color="var(--color-healthy, #10B981)" />
                    <div className="mod-details">
                      <span className="mod-title">{mod.name}</span>
                      <span className="mod-desc">{mod.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>Continue to Confirmation</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
