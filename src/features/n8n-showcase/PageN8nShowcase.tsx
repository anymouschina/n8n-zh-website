'use client';

import React, { useState } from 'react';

import {
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
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Stack,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  LuDownload,
  LuEye,
  LuGitFork,
  LuHeart,
  LuPlay,
  LuPlus,
  LuSearch,
  LuUser,
} from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import WorkflowDetailModal from '@/components/WorkflowDetailModal';
import WorkflowViewer from '@/components/WorkflowViewer';
import { ROUTES_ACCOUNT } from '@/features/account/routes';
import { ROUTES_AUTH } from '@/features/auth/routes';
import { ROUTES_WORKFLOWS } from '@/features/workflows/routes';
import { trpc } from '@/lib/trpc/client';

// 复杂度映射
const complexityMap = {
  SIMPLE: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
  BUSINESS: '商业',
};

const complexities = ['全部级别', ...Object.values(complexityMap)];

export function PageN8nShowcase() {
  const { t } = useTranslation(['common', 'n8nShowcase']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('全部级别');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Modal controls
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose,
  } = useDisclosure();
  const toast = useToast();

  // Check authentication status
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery();

  // 转换中文复杂度为英文枚举值
  const getEnglishComplexity = (chineseComplexity: string) => {
    const reverseMap = Object.entries(complexityMap).find(
      ([, value]) => value === chineseComplexity
    );
    return reverseMap ? reverseMap[0] : undefined;
  };

  // Fetch workflows from API using infinite query
  const {
    data: workflowsData,
    isLoading: workflowsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchWorkflows,
  } = trpc.workflows.getAllPublic.useInfiniteQuery(
    {
      search: searchTerm || undefined,
      complexity:
        selectedComplexity !== '全部级别'
          ? getEnglishComplexity(selectedComplexity)
          : undefined,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Fetch stats from API
  const { data: statsData, isLoading: statsLoading } =
    trpc.workflows.getStats.useQuery();

  // 点赞相关mutations
  const likeWorkflowMutation = trpc.workflows.likeWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: '点赞成功',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      refetchWorkflows();
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        toast({
          title: '需要登录才能点赞',
          description: '请先登录后再操作',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '点赞失败',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const unlikeWorkflowMutation = trpc.workflows.unlikeWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: '取消点赞成功',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      refetchWorkflows();
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        toast({
          title: '需要登录才能取消点赞',
          description: '请先登录后再操作',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '取消点赞失败',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  // 下载量和预览量相关mutations
  const incrementDownloadMutation =
    trpc.workflows.incrementDownload.useMutation();
  const incrementViewMutation = trpc.workflows.incrementView.useMutation();

  // 使用 API 数据，如果没有则使用模拟数据作为备选
  const workflows = workflowsData?.pages.flatMap((page) => page.items) || [];
  const stats = statsData || {
    totalWorkflows: 0,
    totalUsers: 0,
    totalPublishedWorkflows: 0,
  };

  const filteredWorkflows = workflows.filter((workflow: any) => {
    // Enhanced search to include title, description, and author
    const matchesSearch =
      !searchTerm ||
      workflow.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.createdBy?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    // 将数据库的英文复杂度转换为中文复杂度进行比较
    const workflowComplexityDisplay =
      complexityMap[workflow.complexity as keyof typeof complexityMap] ||
      workflow.complexity;
    const matchesComplexity =
      selectedComplexity === '全部级别' ||
      workflowComplexityDisplay === selectedComplexity;

    return matchesSearch && matchesComplexity;
  });

  // 处理工作流操作
  const handleViewDetails = async (workflow: any) => {
    // 增加预览量
    try {
      await incrementViewMutation.mutateAsync({ workflowId: workflow.id });
    } catch (error) {
      console.warn('增加预览量失败:', error);
      // 不阻止查看详情的正常流程
    }

    setSelectedWorkflow(workflow);
    onDetailModalOpen();
  };

  const handleUseTemplate = async (workflowId: string) => {
    try {
      // 增加下载量
      try {
        await incrementDownloadMutation.mutateAsync({ workflowId });
      } catch (error) {
        console.warn('增加下载量失败:', error);
        // 不阻止使用模板的正常流程
      }

      // 查找对应的工作流
      const workflow = filteredWorkflows.find((w) => w.id === workflowId);
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

      // 如果没有 workflowData，创建一个基本的工作流结构
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
        // 如果有工作流数据，添加模板元信息
        workflowDataToUse = {
          ...workflowDataToUse,
          name:
            workflow.title ||
            (workflowDataToUse as any).name ||
            'Imported Workflow',
          meta: {
            ...(workflowDataToUse as any).meta,
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
    if (!checkAuthenticated.data?.isAuthenticated) {
      toast({
        title: '需要登录',
        description: '请先登录后再下载工作流',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // TODO: 实现下载工作流的逻辑
    toast({
      title: '功能开发中',
      description: '下载功能正在开发中，敬请期待',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // 处理点赞
  const handleLike = async (workflowId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeWorkflowMutation.mutate({ workflowId });
    } else {
      likeWorkflowMutation.mutate({ workflowId });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* User Navigation Bar */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={3}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              {t('n8nShowcase:title')}
            </Text>

            {checkAuthenticated.isLoading ? (
              // 加载状态
              <HStack spacing={3}>
                <Button size="sm" isLoading variant="ghost">
                  {t('n8nShowcase:auth.loading')}
                </Button>
              </HStack>
            ) : checkAuthenticated.data?.isAuthenticated ? (
              // 已登录用户显示
              <HStack spacing={4}>
                <Link href={ROUTES_ACCOUNT.app.root()} passHref>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Icon icon={LuUser} />}
                  >
                    {t('n8nShowcase:auth.profile')}
                  </Button>
                </Link>
                <Link href={ROUTES_WORKFLOWS.app.root()} passHref>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<Icon icon={LuPlus} />}
                  >
                    {t('n8nShowcase:auth.manageWorkflows')}
                  </Button>
                </Link>
              </HStack>
            ) : null}
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" py={{ base: 8, md: 16 }}>
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Heading size="2xl" color="gray.800">
                {t('n8nShowcase:title')}
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                {checkAuthenticated.data?.isAuthenticated
                  ? t('n8nShowcase:auth.subtitleLoggedIn')
                  : t('n8nShowcase:subtitle')}
              </Text>

              {!checkAuthenticated.isLoading &&
                !checkAuthenticated.data?.isAuthenticated && (
                  <Box mt={4}>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      {t('n8nShowcase:auth.cta.title')}
                    </Text>
                    <HStack spacing={3} justify="center">
                      <Link href={ROUTES_AUTH.register()} passHref>
                        <Button colorScheme="blue" size="lg">
                          {t('n8nShowcase:auth.cta.register')}
                        </Button>
                      </Link>
                      <Link href={ROUTES_AUTH.login()} passHref>
                        <Button variant="outline" size="lg">
                          {t('n8nShowcase:auth.cta.loginPrompt')}
                        </Button>
                      </Link>
                    </HStack>
                  </Box>
                )}
            </VStack>

            {/* Stats */}
            <HStack spacing={8} divider={<Box w="1px" h="8" bg="gray.300" />}>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {statsLoading ? '...' : stats.totalWorkflows}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  案例总数
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {statsLoading ? '...' : stats.totalUsers}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  注册人数
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Search and Filters */}
      <Container maxW="7xl" py={8}>
        <VStack spacing={6}>
          <Flex
            w="full"
            gap={4}
            flexDirection={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'stretch', md: 'center' }}
          >
            <InputGroup flex={1} maxW={{ base: 'full', md: '400px' }}>
              <InputLeftElement>
                <Icon icon={LuSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="搜索标题、描述或作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                borderRadius="lg"
              />
            </InputGroup>

            <HStack spacing={4} w={{ base: 'full', md: 'auto' }}>
              <Select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                bg="white"
                borderRadius="lg"
                minW="140px"
              >
                <option value="" disabled>
                  复杂度级别：
                </option>
                {complexities.map((complexity) => (
                  <option key={complexity} value={complexity}>
                    {complexity}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>

          {/* Results Count */}
          <HStack w="full">
            <Text color="gray.600">{filteredWorkflows.length} 个工作流</Text>
            <Spacer />
          </HStack>
        </VStack>
      </Container>

      {/* Workflow Cards */}
      <Container maxW="7xl" pb={16}>
        {workflowsLoading && filteredWorkflows.length === 0 ? (
          <VStack spacing={4} py={16} textAlign="center">
            <Text fontSize="lg" color="gray.500">
              正在加载工作流...
            </Text>
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
            {filteredWorkflows.map((workflow: any) => (
              <Card
                key={workflow.id}
                bg="white"
                borderRadius="xl"
                overflow="hidden"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
                h="fit-content"
              >
                <Box position="relative" h="200px" bg="gray.50">
                  {workflow.workflowData ? (
                    <WorkflowViewer
                      workflowData={workflow.workflowData}
                      height={200}
                      interactive={false}
                    />
                  ) : (workflow as any).previewImage ? (
                    <Image
                      src={(workflow as any).previewImage}
                      alt={workflow.title}
                      w="full"
                      h="full"
                      objectFit="cover"
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
                    {workflow.nodeCount || workflow.nodes} 节点
                  </Badge>

                  {/* 点赞按钮 */}
                  <Tooltip label={workflow.isLiked ? '已点赞' : '点赞'}>
                    <IconButton
                      position="absolute"
                      top={3}
                      right={3}
                      aria-label={workflow.isLiked ? '取消点赞' : '点赞'}
                      icon={<Icon icon={LuHeart} />}
                      size="sm"
                      variant={workflow.isLiked ? 'solid' : 'outline'}
                      colorScheme={workflow.isLiked ? 'red' : 'gray'}
                      bg={workflow.isLiked ? 'red.500' : 'white'}
                      color={workflow.isLiked ? 'white' : 'gray.600'}
                      _hover={{
                        bg: workflow.isLiked ? 'red.600' : 'gray.100',
                        transform: 'scale(1.1)',
                      }}
                      onClick={() => handleLike(workflow.id, workflow.isLiked)}
                      isLoading={
                        likeWorkflowMutation.isLoading ||
                        unlikeWorkflowMutation.isLoading
                      }
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
                      </HStack>
                      <Heading size="md" noOfLines={2}>
                        {workflow.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm" noOfLines={3}>
                        {workflow.description}
                      </Text>
                    </VStack>

                    {/* 统计信息 */}
                    <HStack spacing={4} fontSize="sm" color="gray.500">
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

                    <HStack spacing={2} flexWrap="wrap">
                      {workflow.tags &&
                        workflow.tags.map((tag: any) => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                    </HStack>

                    <HStack spacing={2} pt={2}>
                      <Button
                        leftIcon={<Icon icon={LuPlay} />}
                        colorScheme="blue"
                        size="sm"
                        flex={1}
                        onClick={() => handleUseTemplate(workflow.id)}
                      >
                        使用模板
                      </Button>
                      <Button
                        leftIcon={<Icon icon={LuGitFork} />}
                        variant="outline"
                        size="sm"
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

        {/* 加载更多按钮和进度 */}
        {filteredWorkflows.length > 0 && (
          <VStack spacing={4} py={8} textAlign="center">
            {hasNextPage && (
              <Button
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                variant="outline"
                size="lg"
                colorScheme="blue"
              >
                {isFetchingNextPage ? '加载中...' : '加载更多工作流'}
              </Button>
            )}
            {!hasNextPage && filteredWorkflows.length > 0 && (
              <Text color="gray.500" fontSize="sm">
                已显示全部工作流
              </Text>
            )}
            <Text color="gray.400" fontSize="xs">
              已显示 {filteredWorkflows.length} 个工作流
            </Text>
          </VStack>
        )}

        {filteredWorkflows.length === 0 && !workflowsLoading && (
          <VStack spacing={4} py={16} textAlign="center">
            <Text fontSize="lg" color="gray.500">
              没有找到匹配的工作流
            </Text>
            <Text color="gray.400">尝试调整搜索条件或浏览所有类别</Text>
          </VStack>
        )}
      </Container>

      {/* 工作流详情模态 */}
      <WorkflowDetailModal
        isOpen={isDetailModalOpen}
        onClose={onDetailModalClose}
        workflow={selectedWorkflow}
        onUseTemplate={handleUseTemplate}
        onDownload={handleDownload}
      />
    </Box>
  );
}
