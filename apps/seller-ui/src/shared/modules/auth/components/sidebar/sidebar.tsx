"use client"
import useSidebar from '@/hooks/useSidebar'
import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Box from '../box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import Logo from '@/assets/svgs/logo'
import useSeller from '@/hooks/useSeller'
import SidebarItem from './sidebar.item'
import { BellPlus, BellRing, CalendarPlus, Headset, House, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent, Wallet } from 'lucide-react'
import SidebarMenu from './sidebar.menu'

const SidebarBarWrapper = () => {
    const { activeSideBar, setActiveSidebar } = useSidebar();
    const pathName = usePathname();
    const { seller } = useSeller();

    useEffect(() => {
        setActiveSidebar(pathName);
    }, [pathName, setActiveSidebar]);

    const getIconColor = (route: string) => activeSideBar === route ? "#0085ff" : "#969696"
    return (
        <Box
            css={{
                height: "100vh",
                zIndex: 202,
                position: "sticky",
                padding: "8px",
                top: "0",
                overflowY: "scroll",
                scrollbarWidth: "none",
            }}
            className='sidebar-wrapper'
        >
            <Sidebar.Header>
                <Box>
                    <Link href={"/"} className='flex justify-center text-center gap-2'>
                        <Logo />
                        <Box>
                            <h3 className='text-xl font-medium text-[#ecedee]'>{seller?.shop?.name}</h3>
                            <h5 className='font-medium text-xs text-[#ecedeecf] pl-2 whitespace-nowrap overflow-hidden max-w-[170px]'>
                                {seller?.shop?.address}
                            </h5>
                        </Box>
                    </Link>
                </Box>
            </Sidebar.Header>

            <div className='block my-3 h-full'>
                <Sidebar.Body className='body sidebar'>
                    <SidebarItem
                        title="Dashboard"
                        icon={<House color={getIconColor("/dashboard")} />}
                        isActive={activeSideBar === "/dashboard"}
                        href="/dashboard"
                    />
                    <div className="mt-2 block">
                        <SidebarMenu title='Main Menu'>
                            <SidebarItem
                                isActive={activeSideBar === "/orders"}
                                title='Orders'
                                href='/dashboard/orders'
                                icon={
                                    <ListOrdered size={26} color={getIconColor("/dashboard/accounts")} />
                                }
                            />

                            <SidebarItem
                                isActive={activeSideBar === "/payments"}
                                title='Payments'
                                href='/dashboard/payments'
                                icon={
                                    <Wallet size={26} color={getIconColor("/dashboard/payments")} />
                                }
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Products'>
                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/create-product"}
                                title='Create Product'
                                href='/dashboard/create-product'
                                icon={
                                    <SquarePlus size={26} color={getIconColor("/dashboard/create-product")} />
                                }
                            />

                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/all-products"}
                                title='All Products'
                                href='/dashboard/all-products'
                                icon={
                                    <PackageSearch size={22} color={getIconColor("/dashboard/all-products")} />
                                }
                            />
                        </SidebarMenu>

                        <SidebarMenu title='Events'>
                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/create-event"}
                                title='Create Event'
                                href='/dashboard/create-event'
                                icon={
                                    <CalendarPlus size={22} color={getIconColor("/dashboard/create-event")} />
                                }
                            />
                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/all-events"}
                                title='All Events'
                                href='/dashboard/all-events'
                                icon={
                                    <BellPlus size={22} color={getIconColor("/dashboard/all-events")} />
                                }
                            /> 
                        </SidebarMenu>

                        <SidebarMenu title='Controllers'>
                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/inbox"}
                                title='Inbox'
                                href='/dashboard/inbox'
                                icon={
                                    <Mail size={22} color={getIconColor("/dashboard/inbox")} />
                                }
                            />

                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/settings"}
                                title='Settings'
                                href='/dashboard/settings'
                                icon={
                                    <Settings size={22} color={getIconColor("/dashboard/settings")} />
                                }
                            />

                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/notifications"}
                                title='Notifications'
                                href='/dashboard/notifications'
                                icon={
                                    <BellRing size={22} color={getIconColor("/dashboard/notifications")} />
                                }
                            />
                            
                        </SidebarMenu>

                        <SidebarMenu title='Extras'>
                            <SidebarItem
                                isActive={activeSideBar === "/dashboard/discount-codes"}
                                title='Discount Codes'
                                href='/dashboard/discount-codes'
                                icon={
                                    <TicketPercent size={22} color={getIconColor("/dashboard/discount-codes")} />
                                }
                            />

                            <SidebarItem
                                isActive={activeSideBar === "/logout"}
                                title='Logout'
                                href='/dashboard/logout'
                                icon={
                                    <LogOut size={22} color={getIconColor("/dashboard/logout")} />
                                }
                            />
                        </SidebarMenu>
                    </div>
                </Sidebar.Body>
            </div>
        </Box>
    )
}

export default SidebarBarWrapper