import { Suspense } from 'react';

import { PageN8nShowcase } from '@/features/n8n-showcase/PageN8nShowcase';

export default function Page() {
  return (
    <Suspense>
      <PageN8nShowcase />
    </Suspense>
  );
}
