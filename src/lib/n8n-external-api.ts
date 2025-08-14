// n8n外部API调用工具
export interface N8NWorkflowData {
  nodes: Record<string, any>;
  connections: Record<string, any>;
  pinData?: Record<string, any>;
  meta?: Record<string, any>;
}
const N8N_EXTERNAL_API_URL = process.env.N8N_EXTERNAL_API_URL
const N8N_EXTERNAL_API_KEY = process.env.N8N_EXTERNAL_API_KEY

export interface CreateWorkflowRequest {
  userId: string;
  workflowName: string;
  workflowJson: N8NWorkflowData;
  description?: string;
  active?: boolean;
  settings?: Record<string, any>;
  projectId?: string;
  folderId?: string;
}

export interface CreateWorkflowResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// 获取外部API配置
function getExternalApiConfig() {
  const apiUrl = N8N_EXTERNAL_API_URL
  const apiKey = N8N_EXTERNAL_API_KEY

  if (!apiUrl || !apiKey) {
    throw new Error('N8N external API configuration is missing. Please check N8N_EXTERNAL_API_URL and N8N_EXTERNAL_API_KEY environment variables.');
  }

  return { apiUrl, apiKey };
}

// 创建用户（如果需要）
export async function createUserInExternalAPI(email: string, firstName?: string, lastName?: string): Promise<any> {
  const { apiUrl, apiKey } = getExternalApiConfig();

  const response = await fetch(`${apiUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email:email,
      firstName: firstName || '用户',
      lastName: lastName || '',
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create user: ${errorData.message || response.statusText}`);
  }
  return response.json()
}

// 为用户创建工作流
export async function createWorkflowInExternalAPI(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
  const { apiUrl, apiKey } = getExternalApiConfig();
  console.warn('外部APIURL', apiUrl);
  const response = await fetch(`${apiUrl}/users/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create workflow: ${errorData.message || response.statusText}`);
  }

  return response.json();
}

// 获取当前用户的ID（从本地系统映射到外部API）
export function getExternalUserId(): string {
  // 这里需要根据实际的用户映射逻辑来实现
  // 暂时使用一个简单的映射：将本地用户ID映射为外部用户ID
  // 在实际应用中，可能需要建立一个映射表或者使用统一的用户ID体系
  return localStorage.getItem('externalUserId') || 'default-user-id';
}

// 设置外部用户ID
export function setExternalUserId(userId: string): void {
  localStorage.setItem('externalUserId', userId);
}

// 工作流数据转换：将本地工作流格式转换为n8n格式
export function transformWorkflowData(localWorkflowData: any): N8NWorkflowData {
  if (!localWorkflowData) {
    // 创建一个基本的n8n工作流结构
    return {
      nodes: {
        'schedule-trigger': {
          id: 'schedule-trigger',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          position: [-6016, 432],
          parameters: {
            rule: {
              interval: [
                {
                  field: 'minutes',
                  minutesInterval: 30,
                },
              ],
            },
          },
          typeVersion: 1.2,
        },
      },
      connections: {
        'schedule-trigger': {
          main: [
            [
              {
                node: 'No node yet',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
      },
      pinData: {},
      meta: {
        templateId: '',
        templateTitle: '',
        templateDescription: '',
        importedAt: new Date().toISOString(),
      },
    };
  }

  // 如果已经有工作流数据，确保它符合n8n格式
  return {
    nodes: localWorkflowData.nodes || {},
    connections: localWorkflowData.connections || {},
    pinData: localWorkflowData.pinData || {},
    meta: {
      ...localWorkflowData.meta,
      templateId: localWorkflowData.meta?.templateId || '',
      templateTitle: localWorkflowData.meta?.templateTitle || '',
      templateDescription: localWorkflowData.meta?.templateDescription || '',
      importedAt: new Date().toISOString(),
    },
  };
}
