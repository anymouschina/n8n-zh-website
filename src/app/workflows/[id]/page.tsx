'use client';

import React from 'react';

import {
  Badge,
  Box,
  Button,
  Code,
  Container,
  Divider,
  HStack,
  Heading,
  Image,
  Link,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuCopy, LuDownload, LuEye } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { trpc } from '@/lib/trpc/client';

export default function WorkflowDetailPage() {
  const { t } = useTranslation(['common', 'workflows']);
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const toast = useToast();

  // 获取工作流详情
  const {
    data: workflow,
    isLoading,
    error,
  } = trpc.workflows.getByIdPublic.useQuery({ id }, { enabled: !!id });

  // 复制工作流配置
  const copyWorkflowData = async () => {
    if (!workflow?.workflowData) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(workflow.workflowData, null, 2)
      );
      toast({
        title: '复制成功',
        description: '工作流配置已复制到剪贴板',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法复制工作流配置',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!id) return null;

  return (
    <Box py={8}>
      <Container maxW="4xl">
        {isLoading && (
          <VStack spacing={4} textAlign="center" py={16}>
            <Text color="gray.500">正在加载工作流详情...</Text>
          </VStack>
        )}

        {error && (
          <VStack spacing={4} textAlign="center" py={16}>
            <Text color="red.500">工作流不存在或已被删除</Text>
            <Link href="/">
              <Button colorScheme="blue">返回首页</Button>
            </Link>
          </VStack>
        )}

        {workflow && (
          <VStack align="stretch" spacing={6}>
            {/* 标题和操作 */}
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="start">
                <Box>
                  <Heading size="xl" color="gray.800">
                    {workflow.title}
                  </Heading>
                  <Text color="gray.600" mt={2}>
                    {workflow.description}
                  </Text>
                </Box>
                <VStack spacing={2}>
                  <Button
                    leftIcon={<Icon icon={LuCopy} />}
                    colorScheme="blue"
                    size="sm"
                    onClick={copyWorkflowData}
                  >
                    复制配置
                  </Button>
                </VStack>
              </HStack>

              {/* 标签和统计 */}
              <HStack wrap="wrap" gap={3}>
                {workflow.tags.map((tag) => (
                  <Badge key={tag} variant="outline" colorScheme="blue">
                    {tag}
                  </Badge>
                ))}
              </HStack>

              <HStack spacing={4} fontSize="sm" color="gray.500">
                <HStack spacing={1}>
                  <Icon icon={LuEye} />
                  <Text>{workflow.viewCount || 0} 次浏览</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon icon={LuDownload} />
                  <Text>{workflow.downloadCount || 0} 次下载</Text>
                </HStack>
                <HStack spacing={1}>
                  <Text>创建者: {workflow.createdBy?.name || '匿名'}</Text>
                </HStack>
              </HStack>
            </VStack>

            <Divider />

            {/* 工作流详情 */}
            <VStack align="stretch" spacing={6}>
              <VStack spacing={3}>
                <Heading size="md" color="gray.700">
                  工作流信息
                </Heading>
                <HStack spacing={3}>
                  <Badge colorScheme="green">{workflow.category}</Badge>
                  <Badge colorScheme="purple">{workflow.complexity}</Badge>
                  <Badge colorScheme="blue">{workflow.status}</Badge>
                  <Badge colorScheme="gray">{workflow.triggerType}</Badge>
                  <Badge colorScheme="orange">
                    {workflow.nodeCount || 0} 个节点
                  </Badge>
                </HStack>
              </VStack>

              {/* 预览图 */}
              {workflow.previewImage && (
                <VStack spacing={3}>
                  <Heading size="md" color="gray.700">
                    工作流预览
                  </Heading>
                  <Image
                    src={workflow.previewImage}
                    alt={workflow.title}
                    borderRadius="lg"
                    maxH="400px"
                    objectFit="contain"
                  />
                </VStack>
              )}

              {/* 工作流配置 */}
              {workflow.workflowData && (
                <VStack spacing={3}>
                  <Heading size="md" color="gray.700">
                    工作流配置
                  </Heading>
                  <Box
                    bg="gray.50"
                    p={4}
                    borderRadius="lg"
                    maxH="400px"
                    overflow="auto"
                  >
                    <Code
                      color="gray.800"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                      wordBreak="break-all"
                    >
                      {JSON.stringify(workflow.workflowData, null, 2)}
                    </Code>
                  </Box>
                  <Text color="gray.500" fontSize="sm">
                    复制上面的配置到n8n编辑器中即可使用此工作流
                  </Text>
                </VStack>
              )}
            </VStack>

            {/* 操作按钮 */}
            <HStack spacing={4} justify="center">
              <Link href="/">
                <Button variant="outline">返回首页</Button>
              </Link>
            </HStack>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
