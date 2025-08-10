import { ReactNode } from 'react';

import { Metadata, Viewport } from 'next';

import { Document } from '@/app/Document';
import { NextLoader } from '@/app/NextLoader';
import { getEnvHintTitlePrefix } from '@/features/devtools/EnvHint';

export const metadata: Metadata = {
  title: {
    template: `${getEnvHintTitlePrefix()} %s`,
    default: `${getEnvHintTitlePrefix()} n8n中文社区-分享你的agent`,
  },
  applicationName: 'n8n中文社区',
  description: 'n8n中文社区, 共享及备份你的n8n工作流，开源精神长留',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Document>
      <NextLoader />
      {children}
    </Document>
  );
}
