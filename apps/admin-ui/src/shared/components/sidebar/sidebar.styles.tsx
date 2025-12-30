"use client";

import styled from "styled-components";

interface SidebarWrapperProps {
  $isCollapsed?: boolean;
}

interface SidebarOverlayProps {
  $isVisible?: boolean;
}

const SidebarWrapper = styled.div<SidebarWrapperProps>`
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 202;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow-y: auto;
  scrollbar-width: none;
  
  width: ${({ $isCollapsed }) => ($isCollapsed ? "64px" : "260px")};
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    position: fixed;
    left: ${({ $isCollapsed }) => ($isCollapsed ? "-260px" : "0")};
    box-shadow: ${({ $isCollapsed }) =>
    $isCollapsed ? "none" : "2px 0 8px rgba(0, 0, 0, 0.1)"};
  }
`;

const Header = styled.div<SidebarWrapperProps>`
  padding: ${({ $isCollapsed }) => ($isCollapsed ? "16px 8px" : "16px 20px")};
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "space-between")};
  gap: 12px;
  min-height: 64px;
  transition: all 0.3s ease;
`;

const Body = styled.div<SidebarWrapperProps>`
  padding: ${({ $isCollapsed }) => ($isCollapsed ? "8px 4px" : "16px 12px")};
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.3s ease;
`;

const Footer = styled.div<SidebarWrapperProps>`
  padding: ${({ $isCollapsed }) => ($isCollapsed ? "12px 8px" : "16px 20px")};
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "flex-start")};
  gap: 12px;
  transition: all 0.3s ease;
`;

const Overlay = styled.div<SidebarOverlayProps>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 201;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = {
  Wrapper: SidebarWrapper,
  Header,
  Body,
  Footer,
  Overlay,
};

export default Sidebar;
