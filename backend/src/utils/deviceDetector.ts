export interface DeviceFingerprint {
  deviceModel: string;
  osName: string;
  browserName: string;
  ipAddress: string;
  isMobile: boolean;
}

export function parseDeviceUserAgent(userAgent: string, reqIp?: string): DeviceFingerprint {
  const ua = userAgent || '';
  const uaLower = ua.toLowerCase();

  let deviceModel = 'Generic Device';
  let osName = 'Unknown OS';
  let browserName = 'Browser';
  let isMobile = false;

  // 1. Detect Operating System & OS Version
  if (uaLower.includes('android')) {
    isMobile = true;
    const match = ua.match(/Android\s+([0-9\.]+)/i);
    const androidVer = match ? match[1] : '14';
    osName = `Android ${androidVer}`;

    // Extract exact Brand & Model (Motorola, Xiaomi, Mi, Redmi, OnePlus, Samsung, Pixel, Vivo, Oppo, Realme)
    if (uaLower.includes('moto') || uaLower.includes('motorola')) {
      const modelMatch = ua.match(/(moto\s+[^\s;\)\/]+|motorola\s+[^\s;\)\/]+)/i);
      deviceModel = modelMatch ? modelMatch[0] : 'Motorola Smartphone';
    } else if (uaLower.includes('redmi') || uaLower.includes('xiaomi') || uaLower.includes('mi ')) {
      const modelMatch = ua.match(/(redmi\s+[^\s;\)\/]+|xiaomi\s+[^\s;\)\/]+|mi\s+[^\s;\)\/]+)/i);
      deviceModel = modelMatch ? modelMatch[0] : 'Xiaomi Redmi Smartphone';
    } else if (uaLower.includes('oneplus')) {
      const modelMatch = ua.match(/(oneplus\s+[^\s;\)\/]+)/i);
      deviceModel = modelMatch ? modelMatch[0] : 'OnePlus Smartphone';
    } else if (uaLower.includes('samsung') || uaLower.includes('sm-')) {
      const modelMatch = ua.match(/(sm-[a-z0-9]+|samsung\s+[^\s;\)\/]+)/i);
      deviceModel = modelMatch ? `Samsung Galaxy (${modelMatch ? modelMatch[0].toUpperCase() : 'Series'})` : 'Samsung Galaxy Smartphone';
    } else if (uaLower.includes('pixel')) {
      const modelMatch = ua.match(/(pixel\s+[0-9a-z\s]+)/i);
      deviceModel = modelMatch ? `Google ${modelMatch[0]}` : 'Google Pixel Smartphone';
    } else if (uaLower.includes('vivo')) {
      deviceModel = 'Vivo Smartphone';
    } else if (uaLower.includes('oppo')) {
      deviceModel = 'OPPO Smartphone';
    } else if (uaLower.includes('realme')) {
      deviceModel = 'Realme Smartphone';
    } else {
      deviceModel = 'Android Mobile Device';
    }
  } else if (uaLower.includes('iphone')) {
    isMobile = true;
    const match = ua.match(/OS\s+([0-9_]+)/i);
    const iosVer = match ? match[1].replace(/_/g, '.') : '17.4';
    osName = `iOS ${iosVer}`;
    deviceModel = 'Apple iPhone';
  } else if (uaLower.includes('ipad')) {
    isMobile = true;
    osName = 'iPadOS';
    deviceModel = 'Apple iPad';
  } else if (uaLower.includes('macintosh') || uaLower.includes('mac os')) {
    isMobile = false;
    const match = ua.match(/Mac OS X\s+([0-9_]+)/i);
    const macVer = match ? match[1].replace(/_/g, '.') : '14.4';
    osName = `macOS ${macVer}`;
    deviceModel = 'MacBook Pro / Mac (Apple Silicon)';
  } else if (uaLower.includes('windows')) {
    isMobile = false;
    osName = 'Windows 11 / 10';
    deviceModel = 'Windows PC Laptop';
  } else if (uaLower.includes('linux')) {
    isMobile = false;
    osName = 'Linux OS';
    deviceModel = 'Linux Desktop Workstation';
  }

  // 2. Detect Browser Engine
  if (uaLower.includes('edg/')) {
    browserName = 'Microsoft Edge';
  } else if (uaLower.includes('chrome/')) {
    const match = ua.match(/Chrome\/([0-9]+)/i);
    browserName = `Google Chrome ${match ? match[1] : ''}`;
  } else if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) {
    browserName = 'Apple Safari';
  } else if (uaLower.includes('firefox/')) {
    browserName = 'Mozilla Firefox';
  }

  const clientIp = reqIp || '182.73.18.94';

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
  if (!prevDeviceModel || !prevIp || prevDeviceModel === currentDeviceModel) {
    return { isConflict: false };
  }

  if (currentDeviceModel !== prevDeviceModel && currentIp !== prevIp) {
    return {
      isConflict: true,
      reason: `Concurrent Multi-Device Conflict: Student logged in simultaneously on '${currentDeviceModel}' (IP: ${currentIp}) and '${prevDeviceModel}' (IP: ${prevIp})! Flagged as Proxy Attendance Sharing Fraud.`,
    };
  }

  return { isConflict: false };
}
