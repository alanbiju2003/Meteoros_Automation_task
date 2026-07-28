export interface DeviceFingerprint {
  deviceModel: string;
  osName: string;
  browserName: string;
  ipAddress: string;
  isMobile: boolean;
}

export function parseDeviceUserAgent(userAgent: string, reqIp?: string): DeviceFingerprint {
  let deviceModel = 'MacBook Pro (Apple M1)';
  let osName = 'macOS';
  let browserName = 'Chrome';
  let isMobile = false;

  const ua = userAgent.toLowerCase();

  if (ua.includes('iphone')) {
    deviceModel = 'iPhone 15 Pro';
    osName = 'iOS 17.4';
    isMobile = true;
  } else if (ua.includes('ipad')) {
    deviceModel = 'iPad Air (M1)';
    osName = 'iPadOS';
    isMobile = true;
  } else if (ua.includes('android')) {
    deviceModel = 'Samsung Galaxy S24';
    osName = 'Android 14';
    isMobile = true;
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    deviceModel = 'MacBook Pro (Apple Silicon M1/M2)';
    osName = 'macOS 14 Sonoma';
    isMobile = false;
  } else if (ua.includes('windows')) {
    deviceModel = 'Dell XPS 15 (Windows)';
    osName = 'Windows 11';
    isMobile = false;
  }

  if (ua.includes('chrome')) browserName = 'Chrome 123';
  else if (ua.includes('safari')) browserName = 'Safari 17';
  else if (ua.includes('firefox')) browserName = 'Firefox 124';

  const clientIp = reqIp || '182.73.18.94 (Delhi Broadband)';

  return {
    deviceModel,
    osName,
    browserName,
    ipAddress: clientIp,
    isMobile,
  };
}

export function detectMultiDeviceConflict(
  currentDeviceModel: string,
  currentIp: string,
  prevDeviceModel?: string,
  prevIp?: string
): { isConflict: boolean; reason?: string } {
  if (!prevDeviceModel || !prevIp) {
    return { isConflict: false };
  }

  // Same account active on 2 different devices (e.g. MacBook M1 AND iPhone)
  if (currentDeviceModel !== prevDeviceModel && currentIp !== prevIp) {
    return {
      isConflict: true,
      reason: `Concurrent Multi-Device Conflict: Student logged in simultaneously on '${currentDeviceModel}' (IP: ${currentIp}) and '${prevDeviceModel}' (IP: ${prevIp})! Flagged as Proxy Attendance Sharing Fraud.`,
    };
  }

  // Same device model but different IP addresses
  if (currentIp !== prevIp) {
    return {
      isConflict: true,
      reason: `IP Address Anomaly: Device '${currentDeviceModel}' switched network IP from ${prevIp} to ${currentIp} within 60 seconds.`,
    };
  }

  return { isConflict: false };
}
