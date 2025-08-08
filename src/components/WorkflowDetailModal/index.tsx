'use client';

import React from 'react';

import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  LuCalendar,
  LuDownload,
  LuEye,
  LuGitFork,
  LuPlay,
  LuSettings,
  LuTag,
  LuUser,
} from 'react-icons/lu';

import WorkflowViewer from '@/components/WorkflowViewer';

interface WorkflowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: any;
  onUseTemplate?: (workflowId: string) => void;
  onDownload?: (workflowId: string) => void;
}

export function WorkflowDetailModal({
  isOpen,
  onClose,
  workflow,
  onUseTemplate,
  onDownload,
}: WorkflowDetailModalProps) {
  if (!workflow) return null;

  const handleUseTemplate = () => {
    onUseTemplate?.(workflow.id);
  };

  const handleDownload = () => {
    onDownload?.(workflow.id);
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      CONTENT_AUTOMATION: '内容自动化',
      SOCIAL_MEDIA: '社交媒体',
      DATA_PROCESSING: '数据处理',
      COMMUNICATION: '沟通协作',
      FINANCE: '财务管理',
      MARKETING: '营销推广',
      DEVELOPMENT: '开发运维',
      OTHER: '其他',
    };
    return categoryMap[category] || category;
  };

  const getComplexityDisplay = (complexity: string) => {
    const complexityMap: Record<string, string> = {
      SIMPLE: '入门',
      INTERMEDIATE: '进阶',
      ADVANCED: '高级',
      BUSINESS: '商业',
    };
    return complexityMap[complexity] || complexity;
  };

  const getComplexityColor = (complexity: string) => {
    const colorMap: Record<string, string> = {
      SIMPLE: 'green',
      INTERMEDIATE: 'yellow',
      ADVANCED: 'red',
      BUSINESS: 'purple',
    };
    return colorMap[complexity] || 'gray';
  };

  const getTriggerTypeDisplay = (triggerType: string) => {
    const triggerMap: Record<string, string> = {
      SCHEDULED: '定时触发',
      WEBHOOK: 'Webhook',
      MANUAL: '手动触发',
      EMAIL: '邮件触发',
      FILE_CHANGE: '文件变更',
      DATABASE_CHANGE: '数据库变更',
      API_CALL: 'API调用',
      OTHER: '其他',
    };
    return triggerMap[triggerType] || triggerType;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent
        maxW={{ base: '95vw', md: '85vw', lg: '75vw' }}
        maxH={{ base: '95vh', md: '90vh' }}
        mx="auto"
      >
        <ModalHeader pb={3}>
          <VStack spacing={3} align="stretch">
            <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
              <Text fontSize="xl" fontWeight="bold" noOfLines={1} flex={1}>
                {workflow.title}
              </Text>
              <HStack
                spacing={3}
                flexShrink={0}
                justify={{ base: 'flex-start', md: 'flex-end' }}
              >
                <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
                  {getCategoryDisplay(workflow.category)}
                </Badge>
                <Badge
                  mr={10}
                  colorScheme={getComplexityColor(workflow.complexity)}
                  fontSize="xs"
                  px={2}
                  py={1}
                >
                  {getComplexityDisplay(workflow.complexity)}
                </Badge>
              </HStack>
            </Flex>
            <Text color="gray.600" fontSize="sm" noOfLines={2}>
              {workflow.description}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody
          overflowY="auto"
          maxH={{ base: 'calc(95vh - 180px)', md: 'calc(90vh - 200px)' }}
          px={{ base: 4, md: 6 }}
        >
          <VStack spacing={6} align="stretch">
            {/* 工作流可视化 */}
            <Box>
              <Text fontWeight="semibold" mb={3} fontSize="lg">
                工作流结构
              </Text>
              <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                overflow="hidden"
                bg="gray.50"
                h={{ base: '220px', md: '280px' }}
              >
                <WorkflowViewer
                  workflowData={workflow.workflowData}
                  height={280}
                  interactive={false}
                />
              </Box>
            </Box>

            <Divider />

            {/* 详细信息 */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={6}
            >
              <GridItem>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="gray.700">
                      基本信息
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <HStack>
                        <Icon as={LuSettings} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          节点数量:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {workflow.nodeCount}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={LuPlay} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          触发方式:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {getTriggerTypeDisplay(workflow.triggerType)}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={LuUser} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          创建者:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {workflow.createdBy?.name || '匿名用户'}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={LuCalendar} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          创建时间:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatDate(workflow.createdAt)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* 标签 */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <Box>
                      <HStack mb={2}>
                        <Icon as={LuTag} color="gray.500" />
                        <Text fontWeight="semibold" color="gray.700">
                          标签
                        </Text>
                      </HStack>
                      <Flex wrap="wrap" gap={2}>
                        {workflow.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="gray.700">
                      使用统计
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <HStack>
                        <Icon as={LuEye} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          浏览次数:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {workflow.viewCount}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={LuDownload} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          下载次数:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {workflow.downloadCount}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* 操作按钮 */}
                  <Box>
                    <Text fontWeight="semibold" mb={3} color="gray.700">
                      快速操作
                    </Text>
                    <VStack spacing={2}>
                      <Button
                        leftIcon={<Icon as={LuPlay} />}
                        colorScheme="blue"
                        size="sm"
                        w="full"
                        onClick={handleUseTemplate}
                      >
                        使用此模板
                      </Button>
                      <Button
                        leftIcon={<Icon as={LuDownload} />}
                        variant="outline"
                        size="sm"
                        w="full"
                        onClick={handleDownload}
                      >
                        下载工作流
                      </Button>
                    </VStack>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </VStack>
        </ModalBody>

        <ModalFooter pt={3}>
          <HStack
            spacing={3}
            w="full"
            justify={{ base: 'center', md: 'flex-end' }}
          >
            <Button variant="ghost" onClick={onClose} size="sm">
              关闭
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={LuPlay} />}
              onClick={handleUseTemplate}
              size="sm"
            >
              使用模板
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default WorkflowDetailModal;
