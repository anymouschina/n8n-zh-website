export const ROUTES_WORKFLOWS = {
  admin: {
    root: () => '/admin/workflows',
    create: () => '/admin/workflows/create',
    view: (params: { id: string }) => `/admin/workflows/${params.id}`,
    edit: (params: { id: string }) => `/admin/workflows/${params.id}/edit`,
  },
  app: {
    root: () => '/app/workflows',
    view: (params: { id: string }) => `/app/workflows/${params.id}`,
    edit: (params: { id: string }) => `/app/workflows/${params.id}/edit`,
  },
  public: {
    showcase: () => '/',
    view: (params: { id: string }) => `/workflows/${params.id}`,
  },
} as const;
