import { getHaversineDistance } from './geofence.js';

export interface GPSTrustResult {
  trustScore: number; // 0 - 100%
  reasons: string[];
  isSpoofed: boolean;
  spoofReason?: string;
  calculatedSpeedKmH: number;
}

export interface AttendanceConfidenceResult {
  confidenceScore: number; // 0 - 100%
  explainability: {
    insideGeofence: boolean;
    gpsAccurate: boolean;
    deviceTrusted: boolean;
    stationary: boolean;
    continuousSignal: boolean;
  };
  reasons: string[];
}

export function calculateGPSTrustScore(
  accuracyMeters: number,
  batteryLevel: number,
  speedMs: number,
  networkType: string,
  currentLat: number,
  currentLng: number,
  prevLat?: number,
  prevLng?: number,
  timeDiffSeconds?: number
): GPSTrustResult {
  let trustScore = 100;
  const reasons: string[] = [];
  let isSpoofed = false;
  let spoofReason = '';
  let calculatedSpeedKmH = (speedMs || 0) * 3.6;

  // 1. Accuracy Penalty
  if (accuracyMeters <= 10) {
    reasons.push('High GPS Precision (<= 10m) ✅');
  } else if (accuracyMeters <= 50) {
    trustScore -= 10;
    reasons.push('Moderate GPS Accuracy (10m - 50m)');
  } else if (accuracyMeters <= 150) {
    trustScore -= 30;
    reasons.push('Low GPS Accuracy (50m - 150m) ⚠️');
  } else {
    trustScore -= 55;
    reasons.push('Poor GPS Accuracy (> 150m) 🔴');
  }

  // 2. Battery Impact
  if (batteryLevel < 15) {
    trustScore -= 15;
    reasons.push('Critical Battery Level (< 15%) ⚠️');
  } else {
    reasons.push(`Healthy Battery Level (${batteryLevel}%) ✅`);
  }

  // 3. Network Signal Quality
  if (networkType === 'WiFi 5G' || networkType === '4G/LTE') {
    reasons.push(`Strong Connection (${networkType}) ✅`);
  } else {
    trustScore -= 10;
    reasons.push(`Weak Network Signal (${networkType})`);
  }

  // 4. GPS Teleportation / Spoofing Detection
  if (prevLat !== undefined && prevLng !== undefined && timeDiffSeconds && timeDiffSeconds > 0) {
    const distanceMeters = getHaversineDistance(currentLat, currentLng, prevLat, prevLng);
    const distanceKm = distanceMeters / 1000;
    const hours = timeDiffSeconds / 3600;
    calculatedSpeedKmH = distanceKm / hours;

    // If speed > 120 km/h for a student on campus, flag as Mock Location / GPS Teleportation Spoof!
    if (calculatedSpeedKmH > 120) {
      isSpoofed = true;
      spoofReason = `Impossible Speed Detected: ${Math.round(calculatedSpeedKmH)} km/h (${Math.round(distanceMeters)}m in ${Math.round(timeDiffSeconds)}s) - Flagged as Mock Location Teleportation Fraud!`;
      trustScore = Math.max(10, trustScore - 60);
      reasons.push('🔴 MOCK LOCATION / GPS SPOOF DETECTED');
    }
  }

  trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));

  return {
    trustScore,
    reasons,
    isSpoofed,
    spoofReason,
    calculatedSpeedKmH: Math.round(calculatedSpeedKmH),
  };
}

export function calculateAttendanceConfidence(
  trustScore: number,
  distanceMeters: number,
  geofenceRadiusMeters: number,
  speedKmH: number,
  isDeviceKnown: boolean = true
): AttendanceConfidenceResult {
  const insideGeofence = distanceMeters <= geofenceRadiusMeters;
  const gpsAccurate = trustScore >= 70;
  const stationary = speedKmH < 15;
  const continuousSignal = true;

  const explainability = {
    insideGeofence,
    gpsAccurate,
    deviceTrusted: isDeviceKnown,
    stationary,
    continuousSignal,
  };

  let score = 0;
  if (insideGeofence) score += 40;
  if (gpsAccurate) score += 25;
  if (isDeviceKnown) score += 15;
  if (stationary) score += 10;
  if (continuousSignal) score += 10;

  const reasons: string[] = [];
  if (insideGeofence) reasons.push('Inside Verified 500m Campus Geofence ✅');
  else reasons.push('Outside Campus Geofence 🔴');

  if (gpsAccurate) reasons.push(`High GPS Trust Score (${trustScore}%) ✅`);
  else reasons.push(`Low GPS Trust Score (${trustScore}%) ⚠️`);

  if (stationary) reasons.push('Stationary / Campus Walking Pace ✅');
  else reasons.push('High Moving Speed ⚠️');

  return {
    confidenceScore: Math.round(score),
    explainability,
    reasons,
  };
}

export function calculateDeviceHealthScore(
  batteryLevel: number,
  gpsEnabled: boolean,
  appVersion: string,
  networkType: string
): number {
  let score = 100;
  if (!gpsEnabled) score -= 40;
  if (batteryLevel < 20) score -= 25;
  if (networkType === 'Offline' || networkType === 'Unknown') score -= 25;
  if (appVersion !== 'v2.1.0') score -= 10;
  return Math.max(0, Math.min(100, score));
}
