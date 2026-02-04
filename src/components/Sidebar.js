import React from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  Newspaper, 
  Bookmark, 
  Heart, 
  BarChart3, 
  User, 
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';

const SIDEBAR_WIDTH_COLLAPSED = 80;
const SIDEBAR_WIDTH_EXPANDED = 280;
const ICON_BOX_SIZE = 24;

const SidebarContainer = styled.aside`
  width: ${props => props.collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED}px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  padding: 0.75rem 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

  /* Hide scrollbar by default; show on hover if content overflows (e.g. small viewports) */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 2px;
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 0.75rem 0.75rem 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 0.5rem;
  flex-shrink: 0;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  gap: 0.5rem;
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  min-height: 32px;
`;

const LogoImage = styled.img`
  height: 32px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
`;

const SidebarContent = styled.div`
  padding: 0 0.75rem;
  flex: 1;
  min-height: 0;
`;

const MenuSection = styled.div`
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  padding: 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? 0 : 1};
  max-width: ${props => props.collapsed ? 0 : '100%'};
  transition: opacity 0.2s ease, max-width 0.25s ease;
`;

const IconBox = styled.div`
  width: ${ICON_BOX_SIZE}px;
  min-width: ${ICON_BOX_SIZE}px;
  height: ${ICON_BOX_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MenuLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? 0 : 1};
  max-width: ${props => props.collapsed ? 0 : '200px'};
  transition: opacity 0.2s ease, max-width 0.25s ease;
  font-size: ${props => props.theme.fontSize.sm};
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.45rem 0.5rem;
  margin-bottom: 0.125rem;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.primary};
  }

  &.active {
    background: ${props => props.theme.colors.primary}10;
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.fontWeight.medium};
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profileCompleted');
    navigate('/');
  };

  return (
    <SidebarContainer 
      collapsed={collapsed}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      
      <SidebarHeader collapsed={collapsed}>
        <Logo collapsed={collapsed} onClick={() => navigate('/dashboard')}>
          <LogoImage src="/logo.svg" alt="BlockchainVibe Logo" />
          <MenuLabel collapsed={collapsed}>BlockchainVibe</MenuLabel>
        </Logo>
      </SidebarHeader>
      
      <SidebarContent collapsed={collapsed}>
        <MenuSection>
          <SectionTitle collapsed={collapsed}>Main</SectionTitle>
          <MenuItem
            className={isActive('/dashboard') ? 'active' : ''}
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
          >
            <IconBox><TrendingUp size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Dashboard</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/trending') ? 'active' : ''}
            onClick={() => navigate('/trending')}
            title="Trending"
          >
            <IconBox><TrendingUp size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Trending</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/for-you') ? 'active' : ''}
            onClick={() => navigate('/for-you')}
            title="For You"
          >
            <IconBox><Sparkles size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>For You</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/news') ? 'active' : ''}
            onClick={() => navigate('/news')}
            title="News Feed"
          >
            <IconBox><Newspaper size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>News Feed</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/saved') ? 'active' : ''}
            onClick={() => navigate('/saved')}
            title="Saved Articles"
          >
            <IconBox><Bookmark size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Saved Articles</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/liked') ? 'active' : ''}
            onClick={() => navigate('/liked')}
            title="Liked Articles"
          >
            <IconBox><Heart size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Liked Articles</MenuLabel>
          </MenuItem>
        </MenuSection>

        <MenuSection>
          <SectionTitle collapsed={collapsed}>Analytics & AI</SectionTitle>
          <MenuItem
            className={isActive('/analytics') ? 'active' : ''}
            onClick={() => navigate('/analytics')}
            title="Analytics"
          >
            <IconBox><BarChart3 size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Analytics</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/ai-insights') ? 'active' : ''}
            onClick={() => navigate('/ai-insights')}
            title="AI Insights"
          >
            <IconBox><Sparkles size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>AI Insights</MenuLabel>
          </MenuItem>
        </MenuSection>

        <MenuSection>
          <SectionTitle collapsed={collapsed}>Account</SectionTitle>
          <MenuItem
            className={isActive('/profile') ? 'active' : ''}
            onClick={() => navigate('/profile')}
            title="Profile"
          >
            <IconBox><User size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Profile</MenuLabel>
          </MenuItem>
          <MenuItem
            className={isActive('/settings') ? 'active' : ''}
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <IconBox><Settings size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Settings</MenuLabel>
          </MenuItem>
          <MenuItem onClick={handleLogout} title="Logout">
            <IconBox><LogOut size={18} /></IconBox>
            <MenuLabel collapsed={collapsed}>Logout</MenuLabel>
          </MenuItem>
        </MenuSection>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
