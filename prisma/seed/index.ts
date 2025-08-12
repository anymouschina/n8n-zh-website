import {
  WorkflowCategory,
  WorkflowComplexity,
  WorkflowStatus,
  WorkflowTriggerType,
} from '@prisma/client';
import { createRepositories } from 'prisma/seed/models/repository';
import { createUsers } from 'prisma/seed/models/user';
import { prisma } from 'prisma/seed/utils';

async function createSampleWorkflows() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return;

  const sampleWorkflows = [
    {
      title: '邮件自动化营销系统',
      description:
        '自动发送个性化营销邮件，包含客户行为追踪、A/B测试和转化率优化功能，帮助企业提升营销效果。',
      category: WorkflowCategory.CONTENT_AUTOMATION,
      complexity: WorkflowComplexity.INTERMEDIATE,
      triggerType: WorkflowTriggerType.SCHEDULED,
      status: WorkflowStatus.PUBLISHED,
      nodeCount: 12,
      viewCount: 1256,
      downloadCount: 234,
      likeCount: 89,
      workflowData: {
        name: '邮件营销自动化',
        nodes: {
          node1: { parameters: { operation: 'email' } },
          node2: { parameters: { operation: 'data' } },
        },
      },
      createdById: users[0].id,
      tags: ['邮件营销', '自动化', 'CRM', 'A/B测试'],
    },
    {
      title: '社交媒体内容发布管理',
      description:
        '自动化管理多个社交媒体平台的内容发布，包括定时发布、互动监控、数据分析等功能，提升品牌曝光度。',
      category: WorkflowCategory.SOCIAL_MEDIA,
      complexity: WorkflowComplexity.ADVANCED,
      triggerType: WorkflowTriggerType.WEBHOOK,
      status: WorkflowStatus.PUBLISHED,
      nodeCount: 18,
      viewCount: 892,
      downloadCount: 156,
      likeCount: 67,
      workflowData: {
        name: '社交媒体管理',
        nodes: {
          node1: { parameters: { operation: 'social' } },
          node2: { parameters: { operation: 'post' } },
        },
      },
      createdById: users[1]?.id || users[0].id,
      tags: ['社交媒体', '内容发布', '数据分析', '自动化'],
    },
    {
      title: '电商订单处理自动化',
      description:
        '自动处理电商平台的新订单，包括订单验证、库存更新、物流通知和客户确认，提升订单处理效率。',
      category: WorkflowCategory.COMMUNICATION,
      complexity: WorkflowComplexity.BUSINESS,
      triggerType: WorkflowTriggerType.WEBHOOK,
      status: WorkflowStatus.PUBLISHED,
      nodeCount: 25,
      viewCount: 2156,
      downloadCount: 423,
      likeCount: 156,
      workflowData: {
        name: '电商订单处理',
        nodes: {
          node1: { parameters: { operation: 'order' } },
          node2: { parameters: { operation: 'inventory' } },
        },
      },
      createdById: users[2]?.id || users[0].id,
      tags: ['电商', '订单处理', '物流', '自动化'],
    },
    {
      title: '客户服务聊天机器人',
      description:
        '智能客户服务聊天机器人，可以自动回答常见问题、转接人工客服、记录对话历史，提供24/7客户支持。',
      category: WorkflowCategory.COMMUNICATION,
      complexity: WorkflowComplexity.INTERMEDIATE,
      triggerType: WorkflowTriggerType.MANUAL,
      status: WorkflowStatus.PUBLISHED,
      nodeCount: 8,
      viewCount: 1567,
      downloadCount: 298,
      likeCount: 134,
      workflowData: {
        name: '聊天机器人',
        nodes: {
          node1: { parameters: { operation: 'chat' } },
          node2: { parameters: { operation: 'ai' } },
        },
      },
      createdById: users[0].id,
      tags: ['客服', '聊天机器人', 'AI', '自动化'],
    },
    {
      title: '财务数据自动报表',
      description:
        '自动从多个财务系统收集数据，生成月度报表和财务分析，包括图表展示和异常检测功能。',
      category: WorkflowCategory.FINANCE,
      complexity: WorkflowComplexity.ADVANCED,
      triggerType: WorkflowTriggerType.SCHEDULED,
      status: WorkflowStatus.PUBLISHED,
      nodeCount: 15,
      viewCount: 734,
      downloadCount: 123,
      likeCount: 45,
      workflowData: {
        name: '财务报表生成',
        nodes: {
          node1: { parameters: { operation: 'finance' } },
          node2: { parameters: { operation: 'report' } },
        },
      },
      createdById: users[1]?.id || users[0].id,
      tags: ['财务', '报表', '数据分析', '自动化'],
    },
  ];

  for (const workflowData of sampleWorkflows) {
    // 首先创建所有需要的标签
    const tagCreates = workflowData.tags.map((tagName) => ({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    }));

    await prisma.workflowTag.createMany({
      data: workflowData.tags.map((tagName) => ({ name: tagName })),
      skipDuplicates: true,
    });

    // 然后创建工作流
    const workflow = await prisma.workflow.create({
      data: {
        title: workflowData.title,
        description: workflowData.description,
        category: workflowData.category,
        complexity: workflowData.complexity,
        triggerType: workflowData.triggerType,
        status: workflowData.status,
        nodeCount: workflowData.nodeCount,
        viewCount: workflowData.viewCount,
        downloadCount: workflowData.downloadCount,
        likeCount: workflowData.likeCount,
        workflowData: workflowData.workflowData,
        createdById: workflowData.createdById,
        tags: {
          connect: workflowData.tags.map((tagName) => ({ name: tagName })),
        },
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ), // 过去30天内随机时间
        updatedAt: new Date(),
      },
    });

    console.log(`创建工作流: ${workflow.title}`);
  }
}

async function main() {
  await createRepositories();
  await createUsers();
  // await createSampleWorkflows();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
