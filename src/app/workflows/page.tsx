'use client';

import React, { useState } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  LuDownload,
  LuEye,
  LuGlobe,
  LuHeart,
  LuMoreVertical,
  LuPencil,
  LuPlus,
  LuShare,
  LuTrash,
  LuUpload,
} from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import WorkflowDetailModal from '@/components/WorkflowDetailModal';
import WorkflowViewer from '@/components/WorkflowViewer';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';
import { ROUTES_WORKFLOWS } from '@/features/workflows/routes';
import { trpc } from '@/lib/trpc/client';

// 复杂度映射
const complexityMap = {
  SIMPLE: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
  BUSINESS: '商业',
};

export default function Page() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const toast = useToast();

  // Modal controls
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();

  // 获取用户的工作流
  const {
    data: workflowsData,
    isLoading: workflowsLoading,
    refetch: refetchWorkflows,
  } = trpc.workflows.getMine.useQuery({ limit: 50 });

  // 删除工作流的mutation
  const deleteWorkflowMutation = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      toast({
        title: '删除成功',
        description: '工作流已成功删除',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchWorkflows();
      onDeleteDialogClose();
    },
    onError: (error) => {
      toast({
        title: '删除失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // 复制工作流的mutation
  const duplicateWorkflowMutation = trpc.workflows.duplicate.useMutation({
    onSuccess: () => {
      toast({
        title: '复制成功',
        description: '工作流已成功复制',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchWorkflows();
    },
    onError: (error) => {
      toast({
        title: '复制失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // 发布工作流的mutation
  const publishWorkflowMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast({
        title: '发布成功',
        description: '工作流已成功发布',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchWorkflows();
    },
    onError: (error) => {
      toast({
        title: '发布失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const workflows = workflowsData?.items || [];

  // 处理查看详情
  const handleViewDetails = (workflow: any) => {
    setSelectedWorkflow(workflow);
    onDetailModalOpen();
  };

  // 处理删除工作流
  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflowToDelete(workflowId);
    onDeleteDialogOpen();
  };

  const confirmDelete = () => {
    if (workflowToDelete) {
      deleteWorkflowMutation.mutate({ id: workflowToDelete });
    }
  };

  // 处理复制工作流
  const handleDuplicateWorkflow = (workflowId: string) => {
    duplicateWorkflowMutation.mutate({ id: workflowId });
  };

  // 处理发布工作流
  const handlePublishWorkflow = (workflow: any) => {
    publishWorkflowMutation.mutate({
      id: workflow.id,
      title: workflow.title,
      description: workflow.description,
      category: workflow.category,
      complexity: workflow.complexity,
      triggerType: workflow.triggerType,
      status: 'PUBLISHED',
      previewImage: workflow.previewImage,
    });
  };

  // 处理导出工作流
  const handleExportWorkflow = async (workflow: any) => {
    try {
      const workflowData = {
        name: workflow.title,
        description: workflow.description,
        workflowData: workflow.workflowData,
        meta: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'n8n中文社区',
        },
      };

      const dataStr = JSON.stringify(workflowData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.title || 'workflow'}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: '导出成功',
        description: '工作流文件已下载',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: '无法导出工作流文件',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <AppLayoutPage>
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <VStack spacing={2} align="start">
              <Heading size="lg">我的工作流</Heading>
              <Text color="gray.600">创建和管理您的工作流模板</Text>
            </VStack>
            <Button
              leftIcon={<Icon icon={LuPlus} />}
              colorScheme="blue"
              as={Link}
              href="/workflows/create"
            >
              创建工作流
            </Button>
          </Flex>

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
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {workflows.length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                总工作流
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {workflows.filter((w) => w.status === 'PUBLISHED').length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                已发布
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {workflows.reduce((sum, w) => sum + (w.likeCount || 0), 0)}
              </Text>
              <Text fontSize="sm" color="gray.600">
                总点赞数
              </Text>
            </VStack>
          </HStack>

          {/* Workflow Grid */}
          {workflowsLoading ? (
            <VStack spacing={4} py={16} textAlign="center">
              <Text fontSize="lg" color="gray.500">
                正在加载工作流...
              </Text>
            </VStack>
          ) : workflows.length === 0 ? (
            <VStack spacing={6} py={16} textAlign="center">
              <Icon icon={LuPlus} fontSize="4xl" color="gray.300" />
              <VStack spacing={2}>
                <Text fontSize="lg" color="gray.500">
                  还没有工作流
                </Text>
                <Text color="gray.400">创建您的第一个工作流模板</Text>
              </VStack>
              <Button
                leftIcon={<Icon icon={LuPlus} />}
                colorScheme="blue"
                size="lg"
                as={Link}
                href="/workflows/create"
              >
                创建工作流
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
              {workflows.map((workflow) => (
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
                      colorScheme={
                        workflow.status === 'PUBLISHED' ? 'green' : 'gray'
                      }
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {workflow.status === 'PUBLISHED' ? '已发布' : '草稿'}
                    </Badge>

                    <Menu>
                      <MenuButton
                        as={IconButton}
                        position="absolute"
                        top={3}
                        right={3}
                        aria-label="更多操作"
                        icon={<Icon icon={LuMoreVertical} />}
                        size="sm"
                        variant="outline"
                        bg="white"
                        _hover={{ bg: 'gray.100' }}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<Icon icon={LuEye} />}
                          onClick={() => handleViewDetails(workflow)}
                        >
                          查看详情
                        </MenuItem>
                        <MenuItem
                          icon={<Icon icon={LuPencil} />}
                          as={Link}
                          href={ROUTES_WORKFLOWS.app.edit({ id: workflow.id })}
                        >
                          编辑
                        </MenuItem>
                        <MenuItem
                          icon={<Icon icon={LuUpload} />}
                          onClick={() => handleDuplicateWorkflow(workflow.id)}
                          isDisabled={duplicateWorkflowMutation.isLoading}
                        >
                          复制
                        </MenuItem>
                        <MenuItem
                          icon={<Icon icon={LuDownload} />}
                          onClick={() => handleExportWorkflow(workflow)}
                        >
                          导出
                        </MenuItem>
                        {workflow.status === 'DRAFT' && (
                          <MenuItem
                            icon={<Icon icon={LuGlobe} />}
                            onClick={() => handlePublishWorkflow(workflow)}
                            isDisabled={publishWorkflowMutation.isLoading}
                          >
                            发布
                          </MenuItem>
                        )}
                        <MenuItem
                          icon={<Icon icon={LuTrash} />}
                          color="red.500"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          删除
                        </MenuItem>
                      </MenuList>
                    </Menu>
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
                            {workflow.updatedAt
                              ? new Date(
                                  workflow.updatedAt
                                ).toLocaleDateString()
                              : ''}
                          </Text>
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
                          leftIcon={<Icon icon={LuEye} />}
                          variant="outline"
                          size="sm"
                          flex={1}
                          onClick={() => handleViewDetails(workflow)}
                        >
                          查看
                        </Button>
                        <Button
                          leftIcon={<Icon icon={LuPencil} />}
                          colorScheme="blue"
                          size="sm"
                          flex={1}
                          as={Link}
                          href={ROUTES_WORKFLOWS.app.edit({ id: workflow.id })}
                        >
                          编辑
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
        onUseTemplate={() => {}}
        onDownload={() => {}}
      />

      {/* 删除确认对话框 */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={React.createRef()}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              删除工作流
            </AlertDialogHeader>

            <AlertDialogBody>
              确定要删除这个工作流吗？此操作无法撤销。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onDeleteDialogClose}>取消</Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteWorkflowMutation.isLoading}
              >
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </AppLayoutPage>
  );
}
