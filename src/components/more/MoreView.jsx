import React from 'react';
import { ProfileView } from '../profile/ProfileView';

/**
 * HONEYCHAIN WORKSPACE IDENTITY & SETTINGS (PROFILE)
 *
 * Implements designation-specific workspace profiles:
 * 1. BEEKEEPER: Field, Apiary, Hive, Connected Devices & Telemetry
 * 2. PROCESSOR: Facility, Production floor, SOP, Equipment registry
 * 3. LAB: Scientific, Pure white/blue/green/red, NABL/FSSAI credentials, Methods, Instruments
 * 4. DISTRIBUTOR: Logistics, Delivery, Warehouse, Transport model, QR validation
 *
 * Shares account identity & security while isolating professional workspace contexts.
 */
export const MoreView = () => {
  return <ProfileView />;
};

export default MoreView;
