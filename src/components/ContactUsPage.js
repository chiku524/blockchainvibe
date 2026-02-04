import React, { useState } from 'react';
import styled from 'styled-components';
import { Mail, MessageSquare, Clock, Send } from 'lucide-react';
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
  max-width: 1200px;
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    gap: 3rem;
    margin-bottom: 4rem;
  }
`;

const ContactCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
  }
`;

const ContactType = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.xl};
    margin-bottom: 1rem;
  }
`;

const ContactInfo = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.8;
`;

const ContactEmail = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeight.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const ResponseTime = styled.div`
  margin-top: 1rem;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const FormInput = styled.input`
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormSelect = styled.select`
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
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
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
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
  
  &:active {
    transform: translateY(0);
  }
`;

const ContactUsPage = () => {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    category: 'support',
    message: '',
    priority: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to the backend
        const mailtoLink = `mailto:support@blockchainvibe.news?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nCategory: ${formData.category}\nPriority: ${formData.priority}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoLink;
  };

  const contactMethods = [
    {
      type: 'General Inquiries',
      email: 'info@blockchainvibe.news',
      responseTime: '24-48 hours (business days)',
      icon: <Mail size={20} />
    },
    {
      type: 'Support & Help',
      email: 'support@blockchainvibe.news',
      responseTime: '24-48 hours (business days)',
      icon: <MessageSquare size={20} />
    },
    {
      type: 'Privacy & Data Protection',
      email: 'privacy@blockchainvibe.news',
      responseTime: '30 days (as required by GDPR)',
      icon: <Mail size={20} />
    },
    {
      type: 'Legal & Terms',
      email: 'legal@blockchainvibe.news',
      responseTime: '5-7 business days',
      icon: <Mail size={20} />
    },
    {
      type: 'Business & Partnerships',
      email: 'business@blockchainvibe.news',
      responseTime: '3-5 business days',
      icon: <Mail size={20} />
    },
    {
      type: 'Security Issues',
      email: 'security@blockchainvibe.news',
      responseTime: '24 hours for security issues',
      icon: <Mail size={20} />
    }
  ];

  return (
    <PageContainer>
      <AnimatedBackground />
      <Navigation theme={theme} onThemeChange={setTheme} />
      <ContentContainer>
        <Hero>
          <HeroTitle>Contact Us</HeroTitle>
          <HeroSubtitle>
            We're here to help! Reach out to us through any of the following channels 
            for support, questions, feedback, or general inquiries.
          </HeroSubtitle>
        </Hero>

        <ContentGrid>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'inherit' }}>
              Contact Information
            </h2>
            {contactMethods.map((method, index) => (
              <ContactCard key={index} style={{ marginBottom: '1.5rem' }}>
                <ContactType>
                  {method.icon}
                  {method.type}
                </ContactType>
                <ContactInfo>
                  <ContactEmail href={`mailto:${method.email}`}>
                    {method.email}
                  </ContactEmail>
                  <ResponseTime>
                    <Clock size={16} />
                    {method.responseTime}
                  </ResponseTime>
                </ContactInfo>
              </ContactCard>
            ))}
          </div>

          <ContactCard>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'inherit' }}>
              Send us a Message
            </h2>
            <ContactForm onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel>Name *</FormLabel>
                <FormInput
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Email *</FormLabel>
                <FormInput
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Category *</FormLabel>
                <FormSelect
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="support">Support Request</option>
                  <option value="general">General Inquiry</option>
                  <option value="business">Business Inquiry</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="privacy">Privacy Inquiry</option>
                  <option value="other">Other</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Priority</FormLabel>
                <FormSelect
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Message *</FormLabel>
                <FormTextarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                />
              </FormGroup>
              <SubmitButton type="submit">
                <Send size={18} />
                Send Message
              </SubmitButton>
            </ContactForm>
          </ContactCard>
        </ContentGrid>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default ContactUsPage;

