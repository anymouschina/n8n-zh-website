'use client';

import React, { useState } from 'react';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { LuClock, LuDownload, LuEye, LuGitFork, LuHeart } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import WorkflowDetailModal from '@/components/WorkflowDetailModal';
import WorkflowViewer from '@/components/WorkflowViewer';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';
import { trpc } from '@/lib/trpc/client';

// 复杂度映射
const complexityMap = {
  SIMPLE: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
  BUSINESS: '商业',
} as const;

export default function Page() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const toast = useToast();

  // Modal controls
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose,
  } = useDisclosure();

  // 获取用户点赞的工作流
  const {
    data: likedWorkflowsData,
    isLoading: likedWorkflowsLoading,
    refetch: refetchLikedWorkflows,
  } = trpc.workflows.getLiked.useQuery({ limit: 50 });

  // 取消点赞的mutation
  const unlikeWorkflowMutation = trpc.workflows.unlikeWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: '取消点赞成功',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      refetchLikedWorkflows();
    },
    onError: (error: any) => {
      toast({
        title: '取消点赞失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // 增加下载量的mutation
  const incrementDownloadMutation =
    trpc.workflows.incrementDownload.useMutation();

  const likedWorkflows = likedWorkflowsData?.items || [];

  // 处理查看详情
  const handleViewDetails = (workflow: any) => {
    setSelectedWorkflow(workflow);
    onDetailModalOpen();
  };

  // 处理取消点赞
  const handleUnlike = async (workflowId: string) => {
    unlikeWorkflowMutation.mutate({ workflowId });
  };

  // 处理使用模板
  const handleUseTemplate = async (workflowId: string) => {
    try {
      // 增加下载量
      try {
        await incrementDownloadMutation.mutateAsync({ workflowId });
      } catch (error) {
        console.warn('增加下载量失败:', error);
      }

      // 查找对应的工作流
      const workflow = likedWorkflows.find((w: any) => w.id === workflowId);
      if (!workflow) {
        toast({
          title: '工作流未找到',
          description: '无法找到指定的工作流',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // 准备工作流数据
      let workflowDataToUse = workflow.workflowData;

      if (!workflowDataToUse) {
        workflowDataToUse = {
          name: workflow.title || 'Imported Workflow',
          nodes: [],
          connections: {},
          settings: {},
          staticData: {},
          meta: {
            templateId: workflow.id,
            templateTitle: workflow.title,
            templateDescription: workflow.description,
            importedAt: new Date().toISOString(),
          },
        };
      } else {
        workflowDataToUse = {
          ...workflowDataToUse,
          name: workflow.title || workflowDataToUse.name || 'Imported Workflow',
          meta: {
            ...workflowDataToUse.meta,
            templateId: workflow.id,
            templateTitle: workflow.title,
            templateDescription: workflow.description,
            importedAt: new Date().toISOString(),
          },
        };
      }

      // 复制工作流配置到剪贴板
      await navigator.clipboard.writeText(
        JSON.stringify(workflowDataToUse, null, 2)
      );

      toast({
        title: '复制成功',
        description: '请到对应n8n工作流粘贴',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('复制工作流配置失败:', error);
      toast({
        title: '复制失败',
        description: '无法复制工作流配置，请手动复制',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownload = (workflowId: string) => {
    // TODO: 实现下载工作流的逻辑
    toast({
      title: '功能开发中',
      description: '下载功能正在开发中，敬请期待',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <AppLayoutPage>
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={2} align="start">
            <Heading size="lg">我的点赞</Heading>
            <Text color="gray.600">您点赞过的工作流模板</Text>
          </VStack>

          {/* Stats */}
          <HStack
            spacing={8}
            py={4}
            px={6}
            bg="white"
            borderRadius="lg"
            shadow="sm"
          >
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {likedWorkflows.length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                点赞总数
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {
                  likedWorkflows.filter((w: any) => w.complexity === 'SIMPLE')
                    .length
                }
              </Text>
              <Text fontSize="sm" color="gray.600">
                入门级别
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {
                  likedWorkflows.filter((w: any) => w.complexity === 'ADVANCED')
                    .length
                }
              </Text>
              <Text fontSize="sm" color="gray.600">
                高级模板
              </Text>
            </VStack>
          </HStack>

          {/* Workflow Grid */}
          {likedWorkflowsLoading ? (
            <VStack spacing={4} py={16} textAlign="center">
              <Text fontSize="lg" color="gray.500">
                正在加载点赞的工作流...
              </Text>
            </VStack>
          ) : likedWorkflows.length === 0 ? (
            <VStack spacing={6} py={16} textAlign="center">
              <Icon icon={LuHeart} fontSize="4xl" color="gray.300" />
              <VStack spacing={2}>
                <Text fontSize="lg" color="gray.500">
                  暂无点赞的工作流
                </Text>
                <Text color="gray.400">浏览工作流社区并点赞您喜欢的模板</Text>
              </VStack>
              <Button
                colorScheme="blue"
                size="lg"
                as={Link}
                href="/app/community"
              >
                浏览社区
              </Button>
            </VStack>
          ) : (
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={6}
            >
              {likedWorkflows.map((workflow: any) => (
                <Card
                  key={workflow.id}
                  bg="white"
                  borderRadius="xl"
                  overflow="hidden"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  <Box position="relative" h="200px" bg="gray.50">
                    {workflow.workflowData ? (
                      <WorkflowViewer
                        workflowData={workflow.workflowData}
                        height={200}
                        interactive={false}
                      />
                    ) : workflow.previewImage ? (
                      <Box
                        w="full"
                        h="full"
                        bgImage={`url(${workflow.previewImage})`}
                        bgSize="cover"
                        bgPosition="center"
                      />
                    ) : (
                      <Flex
                        w="full"
                        h="full"
                        align="center"
                        justify="center"
                        bg="gradient-to-br from-blue.50 to-purple.50"
                      >
                        <Text color="gray.400" fontSize="sm">
                          工作流预览图
                        </Text>
                      </Flex>
                    )}

                    <Badge
                      position="absolute"
                      top={3}
                      left={3}
                      colorScheme="blue"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {workflow.nodeCount || 0} 节点
                    </Badge>

                    {/* 取消点赞按钮 */}
                    <Tooltip label="取消点赞">
                      <IconButton
                        position="absolute"
                        top={3}
                        right={3}
                        aria-label="取消点赞"
                        icon={<Icon icon={LuHeart} />}
                        size="sm"
                        variant="solid"
                        colorScheme="red"
                        color="white"
                        _hover={{
                          bg: 'red.600',
                          transform: 'scale(1.1)',
                        }}
                        onClick={() => handleUnlike(workflow.id)}
                        isLoading={unlikeWorkflowMutation.isLoading}
                      />
                    </Tooltip>
                  </Box>

                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Badge colorScheme="blue" size="sm">
                            {complexityMap[
                              workflow.complexity as keyof typeof complexityMap
                            ] ||
                              workflow.complexity ||
                              '未分类'}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {workflow.createdAt
                              ? new Date(
                                  workflow.createdAt
                                ).toLocaleDateString()
                              : ''}
                          </Text>
                        </HStack>
                        <Heading size="md" lineHeight="1.3" noOfLines={2}>
                          {workflow.title}
                        </Heading>
                        <Text color="gray.600" noOfLines={3} fontSize="sm">
                          {workflow.description}
                        </Text>
                      </VStack>

                      {/* 作者信息 */}
                      <HStack spacing={3}>
                        <Avatar
                          size="xs"
                          name={workflow.createdBy?.name}
                          src={workflow.createdBy?.image}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {workflow.createdBy?.name || '未知作者'}
                        </Text>
                      </HStack>

                      {/* 统计信息 */}
                      <HStack
                        justify="space-between"
                        fontSize="sm"
                        color="gray.500"
                      >
                        <HStack spacing={4}>
                          <HStack spacing={1}>
                            <Icon icon={LuHeart} />
                            <Text>{workflow.likeCount || 0}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon icon={LuEye} />
                            <Text>{workflow.viewCount || 0}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon icon={LuDownload} />
                            <Text>{workflow.downloadCount || 0}</Text>
                          </HStack>
                        </HStack>
                      </HStack>

                      {/* 标签 */}
                      <HStack spacing={2} flexWrap="wrap">
                        {workflow.tags &&
                          workflow.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                      </HStack>

                      <HStack spacing={2} pt={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<Icon icon={LuGitFork} />}
                          flex={1}
                          onClick={() => handleUseTemplate(workflow.id)}
                        >
                          使用模板
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Icon icon={LuEye} />}
                          flex={1}
                          onClick={() => handleViewDetails(workflow)}
                        >
                          查看详情
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </VStack>
      </Container>

      {/* 工作流详情模态 */}
      <WorkflowDetailModal
        isOpen={isDetailModalOpen}
        onClose={onDetailModalClose}
        workflow={selectedWorkflow}
        onUseTemplate={handleUseTemplate}
        onDownload={handleDownload}
      />
    </AppLayoutPage>
  );
}
