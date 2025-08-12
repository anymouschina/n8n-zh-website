import { NextResponse } from 'next/server';
import RSS from 'rss';

// 直接从数据库获取真实数据
async function getPublishedWorkflows() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const workflows = await prisma.workflow.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        createdBy: { select: { id: true, name: true } },
        tags: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return workflows.map((workflow) => ({
      ...workflow,
      tags: workflow.tags.map((tag) => tag.name),
      // 确保workflowData存在，如果为null则设置一个默认结构
      workflowData: workflow.workflowData || {
        name: workflow.title,
        nodes: {},
        connections: {},
        settings: {},
        staticData: {},
        meta: {
          templateId: workflow.id,
          templateTitle: workflow.title,
          templateDescription: workflow.description,
          importedAt: new Date().toISOString(),
        },
      },
    }));
  } catch (error) {
    console.error('获取工作流数据失败:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // 获取真实的数据库数据
    const workflows = await getPublishedWorkflows();

    console.log(
      `RSS feed 生成成功，包含 ${workflows.length} 个工作流（数据库真实数据）`
    );

    const feed = new RSS({
      title: 'n8n中文社区 - 最新工作流',
      description: 'n8n中文社区最新发布的n8n工作流模板',
      feed_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/rss`,
      site_url: process.env.NEXT_PUBLIC_BASE_URL,
      language: 'zh-CN',
      pubDate: new Date(),
      ttl: 60,
      custom_namespaces: {
        n8n: 'http://n8n.io/rss-extensions',
      },
    });

    workflows.forEach((workflow) => {
      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/workflows/${workflow.id}`;
      const creator = workflow.createdBy?.name || '匿名用户';

      feed.item({
        title: workflow.title,
        description: workflow.description,
        url: link,
        guid: workflow.id,
        author: creator,
        categories: workflow.tags,
        date: new Date(workflow.updatedAt || workflow.createdAt),
        custom_elements: [
          { 'n8n:complexity': workflow.complexity },
          { 'n8n:category': workflow.category },
          { 'n8n:nodeCount': workflow.nodeCount },
          { 'n8n:likeCount': workflow.likeCount },
          { 'n8n:viewCount': workflow.viewCount },
          { 'n8n:downloadCount': workflow.downloadCount },
          { 'n8n:workflowData': JSON.stringify(workflow.workflowData) },
        ],
      });
    });

    const xml = feed.xml({ indent: true });
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('生成RSS失败:', error);
    return new NextResponse('生成RSS失败', { status: 500 });
  }
}
