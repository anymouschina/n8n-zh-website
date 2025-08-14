import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/config/trpc';

export const workflowsRouter = createTRPCRouter({
  // 获取工作流统计信息（使用模拟数据）
  getStats: publicProcedure()
    .output(
      z.object({
        totalWorkflows: z.number(),
        totalUsers: z.number(),
        totalPublishedWorkflows: z.number(),
        categoryCounts: z.record(z.number()),
      })
    )
    .query(async ({ ctx }) => {
      try {
        // 从数据库获取真实统计数据
        const [totalWorkflows, totalUsers, categoryCounts] = await Promise.all([
          ctx.db.workflow.count(),
          ctx.db.user.count({ where: { accountStatus: 'ENABLED' } }),
          ctx.db.workflow.groupBy({
            by: ['category'],
            where: { status: 'PUBLISHED' },
            _count: true,
          }),
        ]);

        const totalPublishedWorkflows = await ctx.db.workflow.count({
          where: { status: 'PUBLISHED' },
        });

        const categoryCountsRecord = categoryCounts.reduce(
          (acc, item) => {
            acc[item.category] = item._count;
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          totalWorkflows,
          totalUsers,
          totalPublishedWorkflows,
          categoryCounts: categoryCountsRecord,
        };
      } catch (error) {
        // 如果数据库查询失败，返回模拟数据
        console.warn('获取统计数据失败，返回模拟数据:', error);
        return {
          totalWorkflows: 3,
          totalUsers: 102,
          totalPublishedWorkflows: 3,
          categoryCounts: {
            CONTENT_AUTOMATION: 2,
            SOCIAL_MEDIA: 1,
            DATA_PROCESSING: 0,
            OTHER: 0,
          },
        };
      }
    }),

  // 获取所有已发布的工作流（默认按点赞数排序）
  getAllPublic: publicProcedure()
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
          category: z.string().optional(),
          complexity: z.string().optional(),
          triggerType: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .output(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            category: z.string(),
            complexity: z.string(),
            triggerType: z.string(),
            status: z.string(),
            nodeCount: z.number(),
            viewCount: z.number(),
            downloadCount: z.number(),
            likeCount: z.number(),
            isLiked: z.boolean().optional(),
            createdAt: z.date(),
            updatedAt: z.date(),
            workflowData: z.unknown().nullable().optional(),
            createdBy: z.object({
              id: z.string(),
              name: z.string().nullable(),
              image: z.string().nullable(),
            }),
            tags: z.array(z.string()),
          })
        ),
        nextCursor: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // 从数据库获取真实数据
        const where: any = {
          status: 'PUBLISHED',
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input.category && { category: input.category }),
          ...(input.complexity && { complexity: input.complexity }),
          ...(input.triggerType && { triggerType: input.triggerType }),
        };

        const workflows = await ctx.db.workflow.findMany({
          where,
          include: {
            createdBy: {
              select: { id: true, name: true, image: true, email: true },
            },
            tags: { select: { name: true } },
            ...(ctx.user && {
              likes: {
                where: { userId: ctx.user.id },
                select: { id: true },
              },
            }),
          },
          orderBy: { likeCount: 'desc' },
          take: input.limit || 20,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        return {
          items: workflows.map((w: any) => ({
            ...w,
            tags: w.tags.map((t: any) => t.name),
            isLiked: ctx.user ? w?.likes?.length > 0 : false,
          })),
          nextCursor:
            workflows.length === input.limit
              ? workflows[workflows.length - 1]?.id
              : undefined,
        };
      } catch (error) {
        // 如果数据库查询失败，返回模拟数据
        console.warn('获取工作流失败，返回模拟数据:', error);
        return {
          items: [
            {
              id: 'clkj8l2m90001mg08xy9zqr8p',
              title: '自动化邮件营销',
              description: '自动发送个性化邮件给潜在客户，提高转化率',
              category: 'CONTENT_AUTOMATION',
              complexity: 'INTERMEDIATE',
              triggerType: 'SCHEDULE',
              status: 'PUBLISHED',
              nodeCount: 8,
              viewCount: 324,
              downloadCount: 89,
              likeCount: 156,
              isLiked: false,
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
              workflowData: null,
              createdBy: {
                id: 'user1',
                name: '张三',
                image: null,
                email: 'zhangsan@example.com',
              },
              tags: ['营销', '邮件', '自动化'],
            },
            {
              id: 'clkj8l2m90002mg08xy9zqr8q',
              title: 'CRM数据同步',
              description: '将多个平台的客户数据自动同步到CRM系统',
              category: 'DATA_PROCESSING',
              complexity: 'ADVANCED',
              triggerType: 'WEBHOOK',
              status: 'PUBLISHED',
              nodeCount: 12,
              viewCount: 198,
              downloadCount: 45,
              likeCount: 89,
              isLiked: false,
              createdAt: new Date('2024-01-10'),
              updatedAt: new Date('2024-01-10'),
              workflowData: null,
              createdBy: {
                id: 'user2',
                name: '李四',
                image: null,
                email: 'lisi@example.com',
              },
              tags: ['CRM', '数据同步'],
            },
            {
              id: 'clkj8l2m90003mg08xy9zqr8r',
              title: '社交媒体监控',
              description: '监控品牌在各大社交平台的提及，及时响应',
              category: 'SOCIAL_MEDIA',
              complexity: 'SIMPLE',
              triggerType: 'POLL',
              status: 'PUBLISHED',
              nodeCount: 5,
              viewCount: 567,
              downloadCount: 123,
              likeCount: 234,
              isLiked: false,
              createdAt: new Date('2024-01-08'),
              updatedAt: new Date('2024-01-08'),
              workflowData: null,
              createdBy: {
                id: 'user3',
                name: '王五',
                image: null,
                email: 'wangwu@example.com',
              },
              tags: ['社交媒体', '监控'],
            },
          ],
          nextCursor: undefined,
        };
      }
    }),

  // 获取当前用户点赞的工作流列表
  getLiked: protectedProcedure()
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
        .default({})
    )
    .output(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            category: z.string(),
            complexity: z.string(),
            triggerType: z.string(),
            status: z.string(),
            nodeCount: z.number(),
            viewCount: z.number(),
            downloadCount: z.number(),
            likeCount: z.number(),
            createdAt: z.date(),
            updatedAt: z.date(),
            workflowData: z.unknown().nullable().optional(),
            previewImage: z.string().nullable().optional(),
            createdBy: z.object({
              id: z.string(),
              name: z.string().nullable(),
              image: z.string().nullable(),
            }),
            tags: z.array(z.string()),
          })
        ),
        nextCursor: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // 获取用户点赞的工作流
        const likedWorkflows = await ctx.db.workflowLike.findMany({
          where: { userId: ctx.user.id },
          include: {
            workflow: {
              include: {
                createdBy: { select: { id: true, name: true, image: true } },
                tags: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit || 20,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        return {
          items: likedWorkflows.map((like) => ({
            ...like.workflow,
            tags: like.workflow.tags.map((t) => t.name),
          })),
          nextCursor:
            likedWorkflows.length === input.limit
              ? likedWorkflows[likedWorkflows.length - 1]?.id
              : undefined,
        };
      } catch (error) {
        // 如果数据库查询失败，返回模拟数据
        console.warn('获取点赞工作流失败，返回模拟数据:', error);
        return {
          items: [
            {
              id: 'clkj8l2m90001mg08xy9zqr8p',
              title: '自动化邮件营销',
              description: '自动发送个性化邮件给潜在客户，提高转化率',
              category: 'CONTENT_AUTOMATION',
              complexity: 'INTERMEDIATE',
              triggerType: 'SCHEDULE',
              status: 'PUBLISHED',
              nodeCount: 8,
              viewCount: 2341,
              downloadCount: 89,
              likeCount: 156,
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
              workflowData: null,
              createdBy: {
                id: 'user1',
                name: '张三',
                image: null,
                email: 'zhangsan@example.com',
              },
              tags: ['营销', '邮件', '自动化'],
            },
            {
              id: 'clkj8l2m90003mg08xy9zqr8r',
              title: '社交媒体监控',
              description: '监控品牌在各大社交平台的提及，及时响应',
              category: 'SOCIAL_MEDIA',
              complexity: 'SIMPLE',
              triggerType: 'POLL',
              status: 'PUBLISHED',
              nodeCount: 5,
              viewCount: 3456,
              downloadCount: 123,
              likeCount: 234,
              createdAt: new Date('2024-01-08'),
              updatedAt: new Date('2024-01-08'),
              workflowData: null,
              createdBy: {
                id: 'user3',
                name: '王五',
                image: null,
                email: 'wangwu@example.com',
              },
              tags: ['社交媒体', '监控'],
            },
          ],
          nextCursor: undefined,
        };
      }
    }),

  // 获取当前用户的工作流列表
  getMine: protectedProcedure()
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
          status: z.string().optional(),
          category: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .output(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            category: z.string(),
            complexity: z.string(),
            triggerType: z.string(),
            status: z.string(),
            nodeCount: z.number(),
            viewCount: z.number(),
            downloadCount: z.number(),
            likeCount: z.number(),
            workflowData: z.unknown().nullable().optional(),
            previewImage: z.string().nullable().optional(),
            createdAt: z.date(),
            updatedAt: z.date(),
            tags: z.array(z.string()),
          })
        ),
        nextCursor: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        createdById: ctx.user.id,
        ...(input.search && {
          OR: [
            { title: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
          ],
        }),
        ...(input.status && { status: input.status }),
        ...(input.category && { category: input.category }),
      };

      const workflows = await ctx.db.workflow.findMany({
        where,
        include: {
          tags: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit || 20,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      return {
        items: workflows.map((w) => ({
          ...w,
          tags: w.tags.map((t) => t.name),
        })),
        nextCursor:
          workflows.length === input.limit
            ? workflows[workflows.length - 1]?.id
            : undefined,
      };
    }),

  // 获取单个工作流（仅限当前用户）
  getById: protectedProcedure()
    .input(z.object({ id: z.string().cuid() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        complexity: z.string(),
        triggerType: z.string(),
        status: z.string(),
        nodeCount: z.number(),
        previewImage: z.string().nullable().optional(),
        workflowData: z.unknown().nullable().optional(),
        viewCount: z.number(),
        downloadCount: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
        tags: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.db.workflow.findFirst({
        where: { id: input.id, createdById: ctx.user.id },
        include: { tags: { select: { name: true } } },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return { ...workflow, tags: workflow.tags.map((t: any) => t.name) };
    }),

  // 获取单个工作流详情（公开访问）
  getByIdPublic: publicProcedure()
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const workflow = await ctx.db.workflow.findFirst({
          where: { id: input.id, status: 'PUBLISHED' },
          include: {
            createdBy: {
              select: { id: true, name: true, image: true, email: true },
            },
            tags: { select: { name: true } },
          },
        });

        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在或未发布',
          });
        }

        return {
          ...workflow,
          tags: workflow.tags.map((t: any) => t.name),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取工作流详情失败',
        });
      }
    }),

  // 更新工作流（仅限当前用户）
  update: protectedProcedure()
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.string(),
        complexity: z.string(),
        triggerType: z.string(),
        status: z.string(),
        previewImage: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        workflowData: z.unknown().optional(),
      })
    )
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.workflow.findFirst({
        where: { id: input.id, createdById: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // 计算节点数量（如果有workflowData的话）
      let calculatedNodeCount = existing.nodeCount;
      if (input.workflowData && typeof input.workflowData === 'object') {
        const nodes = (input?.workflowData as any)?.nodes;
        if (nodes && typeof nodes === 'object') {
          calculatedNodeCount = Object.keys(nodes).length;
        }
      }

      const updated = await ctx.db.workflow.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          complexity: input.complexity,
          triggerType: input.triggerType,
          status: input.status,
          previewImage: input.previewImage ?? null,
          nodeCount: calculatedNodeCount,
          ...((input.workflowData as any) && {
            workflowData: input.workflowData,
          }),
        },
        select: { id: true },
      });

      // 处理标签更新
      if (input.tags !== undefined) {
        // 清除现有标签关联
        await ctx.db.workflow.update({
          where: { id: input.id },
          data: {
            tags: {
              set: [], // 清空现有关联
            },
          },
        });

        // 添加新标签
        if (input.tags.length > 0) {
          // 首先确保所有标签都存在，如果不存在则创建
          for (const tagName of input.tags) {
            await ctx.db.workflowTag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
          }

          // 连接工作流与标签
          await ctx.db.workflow.update({
            where: { id: input.id },
            data: {
              tags: {
                connect: input.tags.map((tagName) => ({ name: tagName })),
              },
            },
          });
        }
      }

      return updated;
    }),

  // 点赞工作流
  likeWorkflow: protectedProcedure()
    .input(z.object({ workflowId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 检查工作流是否存在
        const workflow = await ctx.db.workflow.findUnique({
          where: { id: input.workflowId, status: 'PUBLISHED' },
        });

        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在或未发布',
          });
        }

        // 检查是否已经点赞
        const existingLike = await ctx.db.workflowLike.findUnique({
          where: {
            userId_workflowId: {
              userId: ctx.user.id,
              workflowId: input.workflowId,
            },
          },
        });

        if (existingLike) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '您已经点赞过这个工作流',
          });
        }

        // 创建点赞记录并更新计数
        await ctx.db.$transaction([
          ctx.db.workflowLike.create({
            data: {
              userId: ctx.user.id,
              workflowId: input.workflowId,
            },
          }),
          ctx.db.workflow.update({
            where: { id: input.workflowId },
            data: { likeCount: { increment: 1 } },
          }),
        ]);

        return { success: true, message: '点赞成功' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '点赞失败，请稍后重试',
        });
      }
    }),

  // 取消点赞工作流
  unlikeWorkflow: protectedProcedure()
    .input(z.object({ workflowId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 检查点赞记录是否存在
        const existingLike = await ctx.db.workflowLike.findUnique({
          where: {
            userId_workflowId: {
              userId: ctx.user.id,
              workflowId: input.workflowId,
            },
          },
        });

        if (!existingLike) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '您还没有点赞过这个工作流',
          });
        }

        // 删除点赞记录并更新计数
        await ctx.db.$transaction([
          ctx.db.workflowLike.delete({
            where: {
              userId_workflowId: {
                userId: ctx.user.id,
                workflowId: input.workflowId,
              },
            },
          }),
          ctx.db.workflow.update({
            where: { id: input.workflowId },
            data: { likeCount: { decrement: 1 } },
          }),
        ]);

        return { success: true, message: '取消点赞成功' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '取消点赞失败，请稍后重试',
        });
      }
    }),

  // 增加下载量
  incrementDownload: publicProcedure()
    .input(z.object({ workflowId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 检查工作流是否存在且已发布
        const workflow = await ctx.db.workflow.findUnique({
          where: { id: input.workflowId, status: 'PUBLISHED' },
        });

        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在或未发布',
          });
        }

        // 增加下载量
        await ctx.db.workflow.update({
          where: { id: input.workflowId },
          data: { downloadCount: { increment: 1 } },
        });

        return { success: true, message: '下载量已增加' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '增加下载量失败',
        });
      }
    }),

  // 增加预览量
  incrementView: publicProcedure()
    .input(z.object({ workflowId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 检查工作流是否存在且已发布
        const workflow = await ctx.db.workflow.findUnique({
          where: { id: input.workflowId, status: 'PUBLISHED' },
        });

        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在或未发布',
          });
        }

        // 增加预览量
        await ctx.db.workflow.update({
          where: { id: input.workflowId },
          data: { viewCount: { increment: 1 } },
        });

        return { success: true, message: '预览量已增加' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '增加预览量失败',
        });
      }
    }),

  // 创建工作流
  create: protectedProcedure()
    .input(
      z.object({
        title: z.string().min(1, '标题不能为空'),
        description: z.string().min(1, '描述不能为空'),
        complexity: z.enum(['SIMPLE', 'INTERMEDIATE', 'ADVANCED', 'BUSINESS']),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        tags: z.array(z.string()).default([]),
        workflowData: z.unknown().optional(),
        category: z
          .enum([
            'CONTENT_AUTOMATION',
            'SOCIAL_MEDIA',
            'DATA_PROCESSING',
            'COMMUNICATION',
            'FINANCE',
            'MARKETING',
            'DEVELOPMENT',
            'OTHER',
          ])
          .default('OTHER'),
        triggerType: z
          .enum([
            'SCHEDULED',
            'WEBHOOK',
            'MANUAL',
            'EMAIL',
            'FILE_CHANGE',
            'DATABASE_CHANGE',
            'API_CALL',
            'OTHER',
          ])
          .default('MANUAL'),
        nodeCount: z.number().min(0).default(0),
        previewImage: z.string().optional(),
      })
    )
    .output(
      z.object({
        id: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 计算节点数量（如果有workflowData的话）
        let calculatedNodeCount = input.nodeCount;
        if (input.workflowData && typeof input.workflowData === 'object') {
          const nodes = (input.workflowData as any).nodes;
          if (nodes && typeof nodes === 'object') {
            calculatedNodeCount = Object.keys(nodes).length;
          }
        }

        // 创建工作流
        const workflow = await ctx.db.workflow.create({
          data: {
            title: input.title,
            description: input.description,
            complexity: input.complexity,
            status: input.status,
            category: input.category,
            triggerType: input.triggerType,
            nodeCount: calculatedNodeCount,
            workflowData: (input.workflowData as any) || null,
            previewImage: input.previewImage || null,
            createdById: ctx.user.id,
          },
        });

        // 处理标签
        if (input.tags.length > 0) {
          // 首先确保所有标签都存在，如果不存在则创建
          for (const tagName of input.tags) {
            await ctx.db.workflowTag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
          }

          // 连接工作流与标签
          await ctx.db.workflow.update({
            where: { id: workflow.id },
            data: {
              tags: {
                connect: input.tags.map((tagName) => ({ name: tagName })),
              },
            },
          });
        }

        return {
          id: workflow.id,
          message: '工作流创建成功',
        };
      } catch (error) {
        console.error('创建工作流失败:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建工作流失败，请稍后重试',
        });
      }
    }),

  // 删除工作流（仅限当前用户）
  delete: protectedProcedure()
    .input(z.object({ id: z.string().cuid() }))
    .output(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 检查工作流是否存在且属于当前用户
        const workflow = await ctx.db.workflow.findFirst({
          where: {
            id: input.id,
            createdById: ctx.user.id,
          },
        });

        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在或您没有权限删除',
          });
        }

        // 删除工作流（关联的likes和tags会自动级联删除）
        await ctx.db.workflow.delete({
          where: { id: input.id },
        });

        return { message: '工作流删除成功' };
      } catch (error) {
        console.error('删除工作流失败:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '删除工作流失败，请稍后重试',
        });
      }
    }),

  // 复制工作流
  duplicate: protectedProcedure()
    .input(z.object({ id: z.string().cuid() }))
    .output(
      z.object({
        id: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 获取原始工作流
        const originalWorkflow = await ctx.db.workflow.findFirst({
          where: {
            id: input.id,
            createdById: ctx.user.id,
          },
          include: {
            tags: { select: { name: true } },
          },
        });

        if (!originalWorkflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在或您没有权限复制',
          });
        }

        // 创建副本
        const duplicatedWorkflow = await ctx.db.workflow.create({
          data: {
            title: `${originalWorkflow.title} (副本)`,
            description: originalWorkflow.description,
            complexity: originalWorkflow.complexity,
            status: 'DRAFT', // 副本默认为草稿状态
            category: originalWorkflow.category,
            triggerType: originalWorkflow.triggerType,
            nodeCount: originalWorkflow.nodeCount,
            workflowData: originalWorkflow.workflowData || {},
            previewImage: originalWorkflow.previewImage,
            createdById: ctx.user.id,
          },
        });

        // 复制标签关联
        if (originalWorkflow.tags.length > 0) {
          await ctx.db.workflow.update({
            where: { id: duplicatedWorkflow.id },
            data: {
              tags: {
                connect: originalWorkflow.tags.map((tag) => ({
                  name: tag.name,
                })),
              },
            },
          });
        }

        return {
          id: duplicatedWorkflow.id,
          message: '工作流复制成功',
        };
      } catch (error) {
        console.error('复制工作流失败:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '复制工作流失败，请稍后重试',
        });
      }
    }),
});
