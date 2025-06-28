"use client"

import { activeSideBarItem } from "@/configs/constants";
import { useAtom } from "jotai";
const useSidebar = () => {
    const [activeSideBar, setActiveSidebar] = useAtom(activeSideBarItem);
    return { activeSideBar, setActiveSidebar };
}

export default useSidebar