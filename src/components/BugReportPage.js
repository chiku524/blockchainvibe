import React, { useState } from 'react';
import styled from 'styled-components';
import { Bug, AlertCircle, Info } from 'lucide-react';
import Navigation from './Navigation';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
  z-index: 2;
  isolation: isolate;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 1rem 3rem;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 6rem 1.5rem 4rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 8rem 2rem 4rem;
  }
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 4rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 0.75rem;
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['4xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['5xl']};
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
  padding: 0 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize.xl};
  }
`;

const BugReportForm = styled.form`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
    margin-bottom: 3rem;
  }
`;

const FormTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize['2xl']};
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  font-family: inherit;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme.gradients.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  font-size: ${props => props.theme.fontSize.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const InfoSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.semibold};
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoList = styled.ul`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.8;
  margin: 0;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const LinkText = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BugReportPage = () => {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    category: 'news',
    priority: 'normal',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    environment: '',
    frequency: 'sometimes'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const bugReport = `
**Bug Title**: ${formData.title}

**Category**: ${formData.category}
**Priority**: ${formData.priority}

**Description**: 
${formData.description}

**Steps to Reproduce**:
${formData.steps}

**Expected Behavior**:
${formData.expected}

**Actual Behavior**:
${formData.actual}

**Environment**:
${formData.environment}

**Frequency**: ${formData.frequency}
    `;
    
    const githubUrl = `https://github.com/chiku524/ai-news-agent/issues/new?title=${encodeURIComponent(formData.title)}&body=${encodeURIComponent(bugReport)}`;
    window.open(githubUrl, '_blank');
  };

  return (
    <PageContainer>
      <AnimatedBackground />
      <Navigation theme={theme} onThemeChange={setTheme} />
      <ContentContainer>
        <Hero>
          <HeroTitle>Report a Bug</HeroTitle>
          <HeroSubtitle>
            Found a bug? Help us improve BlockchainVibe by reporting it! 
            This guide will help you submit a clear, helpful bug report.
          </HeroSubtitle>
        </Hero>

        <InfoSection>
          <InfoTitle>
            <Info size={20} />
            Bug Report Channels
          </InfoTitle>
          <InfoList>
            <li>
              <LinkText href="https://github.com/chiku524/ai-news-agent/issues" target="_blank" rel="noreferrer">
                GitHub Issues
              </LinkText>
              {' '} - Preferred for technical bugs
            </li>
            <li>
              <LinkText href="mailto:support@blockchainvibe.news?subject=BUG%20REPORT">
                Email Support
              </LinkText>
              {' '} - Include "BUG REPORT" in subject
            </li>
            <li>
              <LinkText href="/docs/contact-us">
                Contact Form
              </LinkText>
              {' '} - Use the contact form for bug reports
            </li>
          </InfoList>
        </InfoSection>

        <BugReportForm onSubmit={handleSubmit}>
          <FormTitle>Bug Report Form</FormTitle>
          
          <FormGroup>
            <FormLabel htmlFor="bug-title">Bug Title *</FormLabel>
            <FormInput
              id="bug-title"
              name="title"
              type="text"
              required
              placeholder="Brief description of the bug"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-category">Category *</FormLabel>
            <FormSelect
              id="bug-category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="account">Account & Authentication</option>
              <option value="news">News & Articles</option>
              <option value="personalization">Personalization</option>
              <option value="analytics">Analytics & Insights</option>
              <option value="ui">UI & Design</option>
              <option value="performance">Performance</option>
              <option value="other">Other</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-priority">Priority</FormLabel>
            <FormSelect
              id="bug-priority"
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-description">Description *</FormLabel>
            <FormTextarea
              id="bug-description"
              name="description"
              required
              placeholder="Clear description of what happened vs. what you expected"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-steps">Steps to Reproduce *</FormLabel>
            <FormTextarea
              id="bug-steps"
              name="steps"
              required
              placeholder="1. First step&#10;2. Second step&#10;3. Third step"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-expected">Expected Behavior *</FormLabel>
            <FormTextarea
              id="bug-expected"
              name="expected"
              required
              placeholder="What should happen"
              value={formData.expected}
              onChange={(e) => setFormData({ ...formData, expected: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-actual">Actual Behavior *</FormLabel>
            <FormTextarea
              id="bug-actual"
              name="actual"
              required
              placeholder="What actually happened"
              value={formData.actual}
              onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-environment">Environment</FormLabel>
            <FormTextarea
              id="bug-environment"
              name="environment"
              placeholder="Browser: Chrome 120&#10;OS: Windows 11&#10;Device: Desktop"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="bug-frequency">Frequency</FormLabel>
            <FormSelect
              id="bug-frequency"
              name="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            >
              <option value="always">Always</option>
              <option value="sometimes">Sometimes</option>
              <option value="once">Once</option>
            </FormSelect>
          </FormGroup>

          <SubmitButton type="submit">
            <Bug size={18} />
            Submit Bug Report on GitHub
          </SubmitButton>
        </BugReportForm>

        <InfoSection>
          <InfoTitle>
            <AlertCircle size={20} />
            Tips for a Good Bug Report
          </InfoTitle>
          <InfoList>
            <li>Be specific and clear in your description</li>
            <li>Include steps to reproduce the issue</li>
            <li>Provide screenshots if possible</li>
            <li>Include error messages or console logs</li>
            <li>Mention your environment (browser, OS, device)</li>
            <li>Check if the bug has already been reported</li>
          </InfoList>
        </InfoSection>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default BugReportPage;

