"use client"
import React, { useEffect } from "react";
import useSidebar from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import useAdmin from "@/hooks/useAdmin";
import Box from "../box";
import Sidebar from "./sidebar.styles";
import Link from "next/link";
import { BellPlus, BellRing, FileClock, House, ListOrdered, LogOut, PackageSearchIcon, PencilRuler, Settings, Store, Users, WalletCards } from "lucide-react";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin } = useAdmin();

  const getIconColor = (route: string) => activeSidebar === route ? "#0085ff" : "#969696";

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0px",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wraper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex items-center gap-2 text-center">
            <Box>
              <h3 className="text-white text-xl font-medium">{admin?.name}</h3>
              <h5 className="text- pl-2 text-sm font-medium">{admin?.email}</h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="blcok my-3 h-full">
        <Sidebar.Body>
          <SidebarItem
            title="Dashboard"
            icon={<House fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/orders"}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />

              <SidebarItem
                isActive={activeSidebar === "/dashboard/payments"}
                title="Payments"
                href="/dashboard/payments"
                icon={
                  <WalletCards
                    size={26}
                    color={getIconColor("/dashboard/payments")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/products"}
                title="Products"
                href="/dashboard/products"
                icon={
                  <PackageSearchIcon
                    size={26}
                    color={getIconColor("/dashboard/products")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/events"}
                title="Events"
                href="/dashboard/events"
                icon={
                  <BellPlus
                    size={26}
                    color={getIconColor("/dashboard/events")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/users"}
                title="Users"
                href="/dashboard/users"
                icon={
                  <Users
                    size={26}
                    color={getIconColor("/dashboard/users ")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/sellers"}
                title="Sellers"
                href="/dashboard/sellers"
                icon={
                  <Store
                    size={26}
                    color={getIconColor("/dashboard/sellers")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/loggers"}
                title="Loggers"
                href="/dashboard/loggers"
                icon={
                  <FileClock
                    size={26}
                    color={getIconColor("/dashboard/loggers")}
                  />
                }
              />

              <SidebarItem
                isActive={activeSidebar === "/dashboard/management"}
                title="Management"
                href="/dashboard/management"
                icon={
                  <Settings
                    size={26}
                    color={getIconColor("/dashboard/management")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={26}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />

            </SidebarMenu>
            <SidebarMenu title="Customization">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/customization"}
                title="Customization"
                href="/dashboard/customization"
                icon={
                  <PencilRuler
                    size={26}
                    color={getIconColor("/dashboard/customization")}
                  />
                }
              />

            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === "/logout"}
                title="Logout"
                href="/logout"
                icon={
                  <LogOut
                    size={26}
                    color={getIconColor("/logout")}
                  />
                }
              />

            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  )
}

export default SidebarWrapper