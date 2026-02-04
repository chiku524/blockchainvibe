import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const UAgentsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.primary}30;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.primary};
`;

const ChartArea = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: 1rem 0;
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 0.25rem;
`;

const Bar = styled(motion.div)`
  width: 100%;
  background: linear-gradient(180deg, 
    ${props => props.theme.colors.primary} 0%, 
    ${props => props.theme.colors.secondary} 100%
  );
  border-radius: 4px 4px 0 0;
  position: relative;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: scaleY(1.05);
    box-shadow: 0 4px 20px ${props => props.theme.colors.primary}40;
  }
`;

const BarValue = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  white-space: nowrap;
  
  ${Bar}:hover & {
    opacity: 1;
  }
`;

const BarLabel = styled.div`
  margin-top: 0.5rem;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.surface}90;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
`;

const InteractiveChart = ({ data, title = "Reading Trends", onDataUpdate }) => {
  const [isLoading] = useState(false);
  const [chartData, setChartData] = useState(data || []);
  const chartRef = useRef(null);

  // Pass-through: real processing happens server-side
  const processDataWithUAgents = async (rawData) => {
    return rawData;
  };

  useEffect(() => {
    if (data && data.length > 0) {
      processDataWithUAgents(data).then(setChartData);
    }
  }, [data]);

  const maxValue = Math.max(...chartData.map(item => (item && typeof item.value === 'number' ? item.value : 0)), 1);
  const hasData = chartData.some(item => item && (item.value || 0) > 0);

  const handleBarClick = (item, index) => {
    if (onDataUpdate) {
      onDataUpdate({
        ...item,
        index,
        timestamp: new Date().toISOString()
      });
    }
  };

  const displayData = Array.isArray(chartData) && chartData.length > 0
    ? chartData
    : [
        { label: 'Sun', value: 0 },
        { label: 'Mon', value: 0 },
        { label: 'Tue', value: 0 },
        { label: 'Wed', value: 0 },
        { label: 'Thu', value: 0 },
        { label: 'Fri', value: 0 },
        { label: 'Sat', value: 0 },
      ];

  return (
    <ChartContainer ref={chartRef}>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        <UAgentsBadge>
          <Brain size={16} />
          <Zap size={16} />
          <span>uAgents AI</span>
        </UAgentsBadge>
      </ChartHeader>
      
      <ChartArea>
        {displayData.map((item, index) => {
          const val = item && typeof item.value === 'number' ? item.value : 0;
          const label = item && item.label != null ? item.label : '';
          return (
            <BarContainer key={`${label}-${index}`}>
              <Bar
                initial={{ height: 0 }}
                animate={{ height: `${(val / maxValue) * 100}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                onClick={() => handleBarClick(item, index)}
                whileHover={{ scaleY: 1.05 }}
              >
                <BarValue>{val}</BarValue>
              </Bar>
              <BarLabel>{label}</BarLabel>
            </BarContainer>
          );
        })}
      </ChartArea>
      {!hasData && displayData.length > 0 && (
        <LoadingText style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', marginTop: 0 }}>
          No reading data yet — read articles to see trends
        </LoadingText>
      )}
      
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>uAgents AI processing data...</LoadingText>
        </LoadingOverlay>
      )}
    </ChartContainer>
  );
};

export default InteractiveChart;
