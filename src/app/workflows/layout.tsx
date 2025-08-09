import { ReactNode, Suspense } from 'react';

import { AppLayout } from '@/features/app/AppLayout';

export default function WorkflowsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AppLayout>{children}</AppLayout>
    </Suspense>
  );
}
