import { Link, Section } from '@react-email/components';

import { styles } from '@/emails/styles';

export const Footer = () => {
  return (
    <Section style={styles.footer}>
      <Link style={styles.link} href="https://start-ui.com" target="_blank">
        🚀 n8n中文
      </Link>
      <br />
      Opinionated UI starters
    </Section>
  );
};
