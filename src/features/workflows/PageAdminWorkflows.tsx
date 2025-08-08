'use client';

import React, { useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  LuDownload,
  LuEye,
  LuFilter,
  LuMoreVertical,
  LuPencil,
  LuPlus,
  LuSearch,
  LuTrash,
} from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { ROUTES_WORKFLOWS } from '@/features/workflows/routes';
import { trpc } from '@/lib/trpc/client';

const WORKFLOW_STATUS_COLORS = {
  DRAFT: 'gray',
  PUBLISHED: 'green',
  ARCHIVED: 'orange',
} as const;

const WORKFLOW_COMPLEXITY_COLORS = {
  SIMPLE: 'green',
  INTERMEDIATE: 'yellow',
  ADVANCED: 'red',
  BUSINESS: 'purple',
} as const;

interface WorkflowFilters {
  search: string;
  status: string;
  category: string;
}

export function PageAdminWorkflows() {
  const { t } = useTranslation(['common']);
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<WorkflowFilters>({
    search: '',
    status: '',
    category: '',
  });

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

  // Mock data for now since we don't have the actual tRPC router working yet
  const mockWorkflows = [
    {
      id: '1',
      title: '自动发布公众号',
      description:
        '利用n8n自动收集整理内容，清洗排版，上传公众号草稿，提高写作效率。',
      category: 'CONTENT_AUTOMATION',
      complexity: 'INTERMEDIATE',
      triggerType: 'SCHEDULED',
      status: 'PUBLISHED',
      nodeCount: 9,
      viewCount: 150,
      downloadCount: 25,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: {
        id: '1',
        name: '张三',
        email: 'zhang@example.com',
      },
    },
    {
      id: '2',
      title: 'N8N和飞书打造推特自动化更新工作流',
      description:
        '利用N8N与飞书的集成，实现自媒体内容自动发布到推特的完整流程。',
      category: 'SOCIAL_MEDIA',
      complexity: 'ADVANCED',
      triggerType: 'WEBHOOK',
      status: 'PUBLISHED',
      nodeCount: 12,
      viewCount: 89,
      downloadCount: 15,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      createdBy: {
        id: '2',
        name: '李四',
        email: 'li@example.com',
      },
    },
  ];

  const workflows = {
    data: {
      items: mockWorkflows,
      nextCursor: undefined,
    },
    isLoading: false,
    error: null,
  };

  const deleteWorkflow = {
    mutate: (id: string) => {
      toast({
        title: '工作流已删除',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setWorkflowToDelete(null);
      onDeleteClose();
    },
    isLoading: false,
  };

  const handleDelete = (id: string) => {
    setWorkflowToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (workflowToDelete) {
      deleteWorkflow.mutate(workflowToDelete);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      CONTENT_AUTOMATION: '内容与视频自动化',
      SOCIAL_MEDIA: '社交媒体管理',
      DATA_PROCESSING: '数据处理',
      COMMUNICATION: '沟通协作',
      FINANCE: '财务管理',
      MARKETING: '营销推广',
      DEVELOPMENT: '开发运维',
      OTHER: '其他',
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getComplexityLabel = (complexity: string) => {
    const complexities = {
      SIMPLE: '入门',
      INTERMEDIATE: '进阶',
      ADVANCED: '高级',
      BUSINESS: '商业',
    };
    return complexities[complexity as keyof typeof complexities] || complexity;
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      DRAFT: '草稿',
      PUBLISHED: '已发布',
      ARCHIVED: '已归档',
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  return (
    <Box p={6}>
      <Stack spacing={6}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">工作流管理</Heading>
          <Button
            leftIcon={<Icon icon={LuPlus} />}
            colorScheme="blue"
            onClick={() =>
              window.open(ROUTES_WORKFLOWS.admin.create(), '_blank')
            }
          >
            创建工作流
          </Button>
        </Flex>

        {/* Filters */}
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Stack spacing={4}>
            <Flex gap={4} align="center">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon icon={LuSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="搜索工作流..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </InputGroup>

              <Select
                placeholder="状态"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                maxW="150px"
              >
                <option value="PUBLISHED">已发布</option>
                <option value="DRAFT">草稿</option>
                <option value="ARCHIVED">已归档</option>
              </Select>

              <Select
                placeholder="分类"
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                maxW="200px"
              >
                <option value="CONTENT_AUTOMATION">内容与视频自动化</option>
                <option value="SOCIAL_MEDIA">社交媒体管理</option>
                <option value="DATA_PROCESSING">数据处理</option>
                <option value="COMMUNICATION">沟通协作</option>
                <option value="FINANCE">财务管理</option>
                <option value="MARKETING">营销推广</option>
                <option value="DEVELOPMENT">开发运维</option>
                <option value="OTHER">其他</option>
              </Select>

              <Button
                leftIcon={<Icon icon={LuFilter} />}
                variant="outline"
                onClick={() =>
                  setFilters({ search: '', status: '', category: '' })
                }
              >
                重置
              </Button>
            </Flex>
          </Stack>
        </Box>

        {/* Data Table */}
        <Box
          bg="white"
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          overflow="hidden"
        >
          {workflows.isLoading ? (
            <VStack py={8}>
              <Spinner />
              <Text>加载中...</Text>
            </VStack>
          ) : workflows.error ? (
            <VStack py={8}>
              <Text color="red.500">加载失败</Text>
            </VStack>
          ) : (
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>工作流</Th>
                  <Th>分类</Th>
                  <Th>复杂度</Th>
                  <Th>状态</Th>
                  <Th>节点数</Th>
                  <Th>浏览/下载</Th>
                  <Th>创建者</Th>
                  <Th>更新时间</Th>
                  <Th>操作</Th>
                </Tr>
              </Thead>
              <Tbody>
                {workflows.data?.items.map((workflow) => (
                  <Tr key={workflow.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" noOfLines={1}>
                          {workflow.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {workflow.description}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" size="sm">
                        {getCategoryLabel(workflow.category)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          WORKFLOW_COMPLEXITY_COLORS[
                            workflow.complexity as keyof typeof WORKFLOW_COMPLEXITY_COLORS
                          ]
                        }
                        size="sm"
                      >
                        {getComplexityLabel(workflow.complexity)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          WORKFLOW_STATUS_COLORS[
                            workflow.status as keyof typeof WORKFLOW_STATUS_COLORS
                          ]
                        }
                        size="sm"
                      >
                        {getStatusLabel(workflow.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text>{workflow.nodeCount}</Text>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm">{workflow.viewCount} 浏览</Text>
                        <Text fontSize="sm" color="gray.600">
                          {workflow.downloadCount} 下载
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="medium">
                          {workflow.createdBy.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {workflow.createdBy.email}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {workflow.updatedAt.toLocaleDateString('zh-CN')}
                      </Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Icon icon={LuMoreVertical} />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Icon icon={LuEye} />}
                            onClick={() =>
                              window.open(
                                ROUTES_WORKFLOWS.admin.view({
                                  id: workflow.id,
                                }),
                                '_blank'
                              )
                            }
                          >
                            查看详情
                          </MenuItem>
                          <MenuItem
                            icon={<Icon icon={LuPencil} />}
                            onClick={() =>
                              window.open(
                                ROUTES_WORKFLOWS.admin.edit({
                                  id: workflow.id,
                                }),
                                '_blank'
                              )
                            }
                          >
                            编辑
                          </MenuItem>
                          <MenuItem icon={<Icon icon={LuDownload} />}>
                            导出
                          </MenuItem>
                          <MenuItem
                            icon={<Icon icon={LuTrash} />}
                            color="red.500"
                            onClick={() => handleDelete(workflow.id)}
                          >
                            删除
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {workflows.data?.items.length === 0 && !workflows.isLoading && (
            <VStack py={8}>
              <Text color="gray.500">暂无工作流数据</Text>
            </VStack>
          )}
        </Box>

        {/* Pagination would go here */}
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>删除工作流</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>确定要删除这个工作流吗？此操作无法撤销。</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              取消
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDelete}
              isLoading={deleteWorkflow.isLoading}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
