"use client"
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    const device = result.device.type || "Desktop";
    const os = result.os.name;
    const browser = result.browser.name;
    const osVersion = result.os.version;
    const browserVersion = result.browser.version;
    setDeviceInfo(`${device} - ${os} -${osVersion} - ${browser} - ${browserVersion}`);
  }, []);

  return deviceInfo;
};

export default useDeviceTracking;