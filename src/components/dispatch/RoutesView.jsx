/**
 * SCREEN — ROUTE OPTIMIZATION WORKSPACE
 *
 * Dedicated Canonical Destination for Delivery Routes
 * Route: /routes
 *
 * Primary Purpose: Multi-stop delivery route optimization, waypoint sequencing, and driver assignment.
 * One User Intent → One Clear Destination.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  MapPin,
  Truck,
  Navigation,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  User,
  Sliders,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const RoutesView = () => {
  const { showToast } = useAppState();

  const routes = [
    {
      id: 'rt-01',
      name: 'North Corridor Organic Route',
      vehicle: 'Eco-Van 04 (Climate Controlled < 24°C)',
      driver: 'David Chen',
      stopsTotal: 4,
      stopsCompleted: 2,
      distanceKm: '42.8 km',
      status: 'active',
      statusLabel: 'En Route · Stop 3 next',
      eta: '14:20 PM'
    },
    {
      id: 'rt-02',
      name: 'Metro Artisanal Retail Run',
      vehicle: 'Refrigerated Sprinter 02',
      driver: 'Maria Santos',
      stopsTotal: 6,
      stopsCompleted: 0,
      distanceKm: '68.5 km',
      status: 'staged',
      statusLabel: 'Staged · Departure 08:30 AM',
      eta: 'Tomorrow'
    }
  ];

  return (
    <div className="routes-view-container">
      {/* 1. Header Banner */}
      <div className="routes-hero card">
        <div className="routes-badge-row">
          <span className="badge badge-honey">Route Logistics</span>
          <StatusBadge status="healthy" label="Fleet Monitoring Active" size="small" />
        </div>
        <h2 className="heading-card" style={{ fontSize: '20px', marginTop: '8px' }}>
          Delivery Route Optimization
        </h2>
        <p className="supporting-text" style={{ fontSize: '13px', marginTop: '4px' }}>
          Sequence multi-drop retail deliveries, verify en-route climate monitoring, and assign certified transport drivers.
        </p>

        <div className="routes-hero-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => showToast('Calculating optimal waypoint sequence…')}
          >
            <Navigation size={15} />
            <span>Optimize Waypoints</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Assigning driver to pending route…')}
          >
            <User size={15} />
            <span>Assign Driver</span>
          </button>
        </div>
      </div>

      {/* 2. Routes List */}
      <div className="routes-list-section">
        <h3 className="routes-sec-title">Active Routes ({routes.length})</h3>

        <div className="routes-list">
          {routes.map((rt) => (
            <div
              key={rt.id}
              className="card route-card"
              onClick={() => showToast(`Opening route waypoints for ${rt.name}…`)}
            >
              <div className="route-card-top">
                <div>
                  <h4 className="route-name">{rt.name}</h4>
                  <span className="route-vehicle">{rt.vehicle}</span>
                </div>
                <StatusBadge
                  status={rt.status === 'active' ? 'healthy' : 'attention'}
                  label={rt.statusLabel}
                  size="small"
                />
              </div>

              <div className="route-stats-grid">
                <div className="r-stat">
                  <span className="r-lbl">Driver</span>
                  <span className="r-val">{rt.driver}</span>
                </div>
                <div className="r-stat">
                  <span className="r-lbl">Progress</span>
                  <span className="r-val">{rt.stopsCompleted} of {rt.stopsTotal} Stops</span>
                </div>
                <div className="r-stat">
                  <span className="r-lbl">Distance</span>
                  <span className="r-val">{rt.distanceKm}</span>
                </div>
              </div>

              <div className="route-card-footer">
                <span className="route-eta">
                  <Clock size={12} /> ETA: {rt.eta}
                </span>
                <div className="route-link">
                  <span>View Waypoint Sequence</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .routes-view-container {
          padding: 16px var(--mobile-pad) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .routes-hero {
          padding: 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-theme-card-border, #D6D9DE);
        }

        .routes-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .climate-pill {
          font-size: 11px;
          color: var(--color-warm-gray);
          background: #FFF;
          padding: 3px 8px;
          border-radius: 12px;
          border: 1px solid var(--color-divider);
        }

        .routes-hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .routes-list-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .routes-sec-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .route-card {
          padding: 16px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .route-card:hover {
          transform: translateY(-1px);
        }

        .route-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .route-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .route-vehicle {
          font-size: 12px;
          color: var(--color-warm-gray);
        }

        .route-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
          padding: 10px;
          background: var(--color-warm-cream, #FFFDF8);
          border-radius: 8px;
        }

        .r-stat {
          display: flex;
          flex-direction: column;
        }

        .r-lbl {
          font-size: 10.5px;
          color: var(--color-warm-gray);
        }

        .r-val {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .route-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid var(--color-divider);
        }

        .route-eta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--color-warm-gray);
        }

        .route-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-honey);
        }
      `}</style>
    </div>
  );
};
