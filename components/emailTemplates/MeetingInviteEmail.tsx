// components/emailTemplates/MeetingInviteEmail.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  
  interface MeetingInviteEmailProps {
    organizerName: string;
    meetingTitle: string;
    startTime: string;
    duration: number;
    meetLink?: string;
    teamName?: string;
    description?: string;
  }
  
  export const MeetingInviteEmail = ({
    organizerName,
    meetingTitle,
    startTime,
    duration,
    meetLink,
    teamName,
    description,
  }: MeetingInviteEmailProps) => (
    <Html>
      <Head />
      <Preview>Youre invited to {meetingTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Youre Invited to a Meeting</Heading>
          
          <Text style={paragraph}>
            Hello,
          </Text>
          
          <Text style={paragraph}>
            <strong>{organizerName}</strong> has invited you to a meeting
            {teamName ? ` with <strong>${teamName}</strong>` : ''}.
          </Text>
  
          <Section style={detailsBox}>
            <Heading as="h2" style={meetingTitleStyle}>
              {meetingTitle}
            </Heading>
            
            <Text style={detailText}>
              <strong>When:</strong> {startTime}
            </Text>
            
            <Text style={detailText}>
              <strong>Duration:</strong> {duration} minutes
            </Text>
            
            {description && (
              <Text style={detailText}>
                <strong>Description:</strong> {description}
              </Text>
            )}
            
            {meetLink && (
              <>
                <Button style={button} href={meetLink}>
                  Join Meeting
                </Button>
                <Text style={smallText}>
                  Or copy this link: {meetLink}
                </Text>
              </>
            )}
          </Section>
  
          <Text style={footer}>
            This meeting was scheduled via Conferio.
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  // Styles
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px',
    maxWidth: '600px',
  };
  
  const heading = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  };
  
  const paragraph = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '16px',
  };
  
  const detailsBox = {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  };
  
  const meetingTitleStyle = {
    color: '#555',
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: '15px',
  };
  
  const detailText = {
    color: '#333',
    fontSize: '14px',
    lineHeight: '20px',
    marginBottom: '8px',
  };
  
  const button = {
    backgroundColor: '#0070f3',
    borderRadius: '6px',
    color: '#fff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px 24px',
    textDecoration: 'none',
    marginTop: '15px',
  };
  
  const smallText = {
    color: '#666',
    fontSize: '12px',
    marginTop: '10px',
  };
  
  const footer = {
    color: '#666',
    fontSize: '12px',
    marginTop: '20px',
  };
