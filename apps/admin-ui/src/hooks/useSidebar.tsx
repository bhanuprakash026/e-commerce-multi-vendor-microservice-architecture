import { activeSideBarItem } from "@/configs/constants";
import { useAtom } from "jotai";
import React from "react";

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem)
  return { activeSidebar, setActiveSidebar }
}

export default useSidebar
