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

const SidebarContainer = styled.aside`
  width: ${props => props.collapsed ? '80px' : '280px'};
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  padding: 2rem 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  transition: width ${props => props.theme.transitions.normal};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    transform: translateX(-100%);
    transition: transform ${props => props.theme.transitions.fast};
  }
`;

// Removed toggle button; sidebar now expands/collapses on hover

const SidebarHeader = styled.div`
  padding: 0 ${props => props.collapsed ? '1rem' : '2rem'} 2rem ${props => props.collapsed ? '1rem' : '2rem'};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  gap: 0.75rem;
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
`;

const LogoImage = styled.img`
  height: ${props => props.collapsed ? '32px' : '36px'};
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
`;

const SidebarContent = styled.div`
  padding: 0 ${props => props.collapsed ? '0.5rem' : '1rem'};
`;

const MenuSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  padding: 0 ${props => props.collapsed ? '0.5rem' : '1rem'};
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  gap: ${props => props.collapsed ? '0' : '0.75rem'};
  padding: ${props => props.collapsed ? '0.75rem 0' : '0.75rem 1rem'};
  margin-bottom: 0.25rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  & > svg {
    flex-shrink: 0;
  }
  
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
          <LogoImage collapsed={collapsed} src="/logo.svg" alt="BlockchainVibe Logo" />
          {!collapsed && 'BlockchainVibe'}
        </Logo>
      </SidebarHeader>
      
      <SidebarContent collapsed={collapsed}>
        <MenuSection>
          {!collapsed && <SectionTitle collapsed={collapsed}>Main</SectionTitle>}
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/dashboard') ? 'active' : ''}
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
          >
            <TrendingUp size={18} />
            {!collapsed && 'Dashboard'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/trending') ? 'active' : ''}
            onClick={() => navigate('/trending')} 
            title="Trending">
            <TrendingUp size={18} />
            {!collapsed && 'Trending'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/for-you') ? 'active' : ''}
            onClick={() => navigate('/for-you')} 
            title="For You">
            <Sparkles size={18} />
            {!collapsed && 'For You'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/news') ? 'active' : ''}
            onClick={() => navigate('/news')} 
            title="News Feed">
            <Newspaper size={18} />
            {!collapsed && 'News Feed'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/saved') ? 'active' : ''}
            onClick={() => navigate('/saved')} 
            title="Saved Articles">
            <Bookmark size={18} />
            {!collapsed && 'Saved Articles'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/liked') ? 'active' : ''}
            onClick={() => navigate('/liked')} 
            title="Liked Articles">
            <Heart size={18} />
            {!collapsed && 'Liked Articles'}
          </MenuItem>
        </MenuSection>

        <MenuSection>
          {!collapsed && <SectionTitle collapsed={collapsed}>Analytics & AI</SectionTitle>}
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/analytics') ? 'active' : ''}
            onClick={() => navigate('/analytics')} 
            title="Analytics">
            <BarChart3 size={18} />
            {!collapsed && 'Analytics'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/ai-insights') ? 'active' : ''}
            onClick={() => navigate('/ai-insights')} 
            title="AI Insights">
            <Sparkles size={18} />
            {!collapsed && 'AI Insights'}
          </MenuItem>
        </MenuSection>

        <MenuSection>
          {!collapsed && <SectionTitle collapsed={collapsed}>Account</SectionTitle>}
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/profile') ? 'active' : ''}
            onClick={() => navigate('/profile')} 
            title="Profile">
            <User size={18} />
            {!collapsed && 'Profile'}
          </MenuItem>
          <MenuItem 
            collapsed={collapsed}
            className={isActive('/settings') ? 'active' : ''}
            onClick={() => navigate('/settings')} 
            title="Settings">
            <Settings size={18} />
            {!collapsed && 'Settings'}
          </MenuItem>
          <MenuItem collapsed={collapsed} onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </MenuItem>
        </MenuSection>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
