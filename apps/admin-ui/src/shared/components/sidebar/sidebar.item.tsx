import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
}

const SidebarItem: React.FC<Props> = ({ title, icon, isActive, href }) => {
  return (
    <Link href={href} className="my-2 block">
      <div className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg ${isActive && "scale-[.98] bg-[#0f3158]  fill-blue-200 hover:!bg-[#0f3158d6]"}`}>
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;