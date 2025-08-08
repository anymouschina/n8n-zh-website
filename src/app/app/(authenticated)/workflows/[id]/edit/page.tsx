'use client';

import React, { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { LuArrowLeft, LuGlobe, LuPlus, LuSave, LuUpload } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { trpc } from '@/lib/trpc/client';

const complexityOptions = [
  { value: 'SIMPLE', label: '入门' },
  { value: 'INTERMEDIATE', label: '进阶' },
  { value: 'ADVANCED', label: '高级' },
  { value: 'BUSINESS', label: '商业' },
];

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PUBLISHED', label: '发布' },
];

const categoryOptions = [
  { value: 'CONTENT_AUTOMATION', label: '内容与视频自动化' },
  { value: 'SOCIAL_MEDIA', label: '社交媒体管理' },
  { value: 'DATA_PROCESSING', label: '数据处理' },
  { value: 'COMMUNICATION', label: '沟通协作' },
  { value: 'FINANCE', label: '财务管理' },
  { value: 'MARKETING', label: '营销推广' },
  { value: 'DEVELOPMENT', label: '开发运维' },
  { value: 'OTHER', label: '其他' },
];

const triggerTypeOptions = [
  { value: 'SCHEDULED', label: '定时触发' },
  { value: 'WEBHOOK', label: 'Webhook触发' },
  { value: 'MANUAL', label: '手动触发' },
  { value: 'EMAIL', label: '邮件触发' },
  { value: 'FILE_CHANGE', label: '文件变更' },
  { value: 'DATABASE_CHANGE', label: '数据库变更' },
  { value: 'API_CALL', label: 'API调用' },
  { value: 'OTHER', label: '其他' },
];

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const toast = useToast();

  // 获取工作流数据
  const {
    data: workflowData,
    isLoading,
    refetch,
  } = trpc.workflows.getById.useQuery({ id }, { enabled: !!id });

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complexity: 'SIMPLE',
    status: 'DRAFT',
    category: 'OTHER',
    triggerType: 'MANUAL',
    workflowData: '',
    previewImage: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // 更新工作流的mutation
  const updateWorkflowMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast({
        title: '保存成功',
        description: '工作流已成功保存',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: '保存失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // 当数据加载完成时，初始化表单
  useEffect(() => {
    if (workflowData) {
      setFormData({
        title: workflowData.title || '',
        description: workflowData.description || '',
        complexity: workflowData.complexity || 'SIMPLE',
        status: workflowData.status || 'DRAFT',
        category: workflowData.category || 'OTHER',
        triggerType: workflowData.triggerType || 'MANUAL',
        workflowData: workflowData.workflowData
          ? JSON.stringify(workflowData.workflowData, null, 2)
          : '',
        previewImage: workflowData.previewImage || '',
      });
      setTags(workflowData.tags || []);
    }
  }, [workflowData]);

  // 处理表单输入
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 添加标签
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags((prev) => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // 验证JSON格式
  const validateJSON = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          // 验证是否为有效的JSON
          JSON.parse(content);
          setFormData((prev) => ({
            ...prev,
            workflowData: content,
          }));
          toast({
            title: '文件上传成功',
            description: '工作流JSON已成功加载',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        } catch {
          toast({
            title: '文件格式错误',
            description: '请上传有效的JSON文件',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // 保存工作流
  const handleSave = async (publishNow = false) => {
    // 验证必填字段
    if (!formData.title.trim()) {
      toast({
        title: '请填写标题',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: '请填写描述',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (formData.workflowData && !validateJSON(formData.workflowData)) {
      toast({
        title: 'JSON格式错误',
        description: '请检查工作流JSON格式是否正确',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 准备提交数据
    const submitData = {
      id,
      title: formData.title,
      description: formData.description,
      complexity: formData.complexity,
      status: publishNow ? 'PUBLISHED' : formData.status,
      category: formData.category,
      triggerType: formData.triggerType,
      previewImage: formData.previewImage || null,
      tags,
      workflowData: formData.workflowData
        ? JSON.parse(formData.workflowData)
        : undefined,
    };

    updateWorkflowMutation.mutate(submitData as any);
  };

  // 发布工作流
  const handlePublish = () => {
    handleSave(true);
  };

  if (!id) return null;

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="4xl">
          <Text>正在加载...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex align="center" gap={4}>
            <IconButton
              aria-label="返回"
              icon={<Icon icon={LuArrowLeft} />}
              variant="ghost"
              onClick={() => router.back()}
            />
            <VStack spacing={1} align="start" flex={1}>
              <HStack>
                <Heading size="lg">编辑工作流</Heading>
                {workflowData && (
                  <Badge
                    colorScheme={
                      workflowData.status === 'PUBLISHED' ? 'green' : 'yellow'
                    }
                  >
                    {workflowData.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </Badge>
                )}
              </HStack>
              <Text color="gray.600">修改工作流模板的信息和配置</Text>
            </VStack>
            {/* 右上角操作区 */}
            <HStack spacing={2}>
              {workflowData?.status === 'DRAFT' && (
                <Button
                  leftIcon={<Icon icon={LuGlobe} />}
                  colorScheme="green"
                  size="sm"
                  onClick={handlePublish}
                  isLoading={updateWorkflowMutation.isLoading}
                  loadingText="发布中..."
                >
                  发布
                </Button>
              )}
              <Button
                leftIcon={<Icon icon={LuSave} />}
                colorScheme="blue"
                size="sm"
                onClick={() => handleSave()}
                isLoading={updateWorkflowMutation.isLoading}
                loadingText="保存中..."
              >
                保存
              </Button>
            </HStack>
          </Flex>

          <VStack spacing={6} align="stretch">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <Heading size="md">基本信息</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>标题</FormLabel>
                    <Input
                      placeholder="输入工作流标题"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>描述</FormLabel>
                    <Textarea
                      placeholder="描述这个工作流的功能和用途"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      rows={4}
                      bg="white"
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>分类</FormLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange('category', e.target.value)
                        }
                        bg="white"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>复杂度</FormLabel>
                      <Select
                        value={formData.complexity}
                        onChange={(e) =>
                          handleInputChange('complexity', e.target.value)
                        }
                        bg="white"
                      >
                        {complexityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>触发方式</FormLabel>
                      <Select
                        value={formData.triggerType}
                        onChange={(e) =>
                          handleInputChange('triggerType', e.target.value)
                        }
                        bg="white"
                      >
                        {triggerTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>状态</FormLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange('status', e.target.value)
                        }
                        bg="white"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>预览图URL</FormLabel>
                    <Input
                      placeholder="输入预览图的URL地址"
                      value={formData.previewImage}
                      onChange={(e) =>
                        handleInputChange('previewImage', e.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* 标签 */}
            <Card>
              <CardHeader>
                <Heading size="md">标签</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <InputGroup>
                    <Input
                      placeholder="添加标签"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      bg="white"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="添加标签"
                        icon={<Icon icon={LuPlus} />}
                        size="sm"
                        onClick={handleAddTag}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>

                  {tags.length > 0 && (
                    <Flex wrap="wrap" gap={2}>
                      {tags.map((tag, index) => (
                        <Tag key={index} colorScheme="blue" borderRadius="full">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Tag>
                      ))}
                    </Flex>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* 工作流JSON */}
            <Card>
              <CardHeader>
                <VStack spacing={2} align="stretch">
                  <Heading size="md">工作流JSON</Heading>
                  <Text fontSize="sm" color="gray.600">
                    修改从n8n导出的工作流JSON配置
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Text fontSize="sm" color="gray.500">
                      或者选择文件上传：
                    </Text>
                    <Button
                      as="label"
                      htmlFor="file-upload"
                      size="sm"
                      leftIcon={<Icon icon={LuUpload} />}
                      variant="outline"
                      cursor="pointer"
                    >
                      上传JSON文件
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </HStack>

                  <FormControl>
                    <Textarea
                      placeholder="粘贴或编辑工作流JSON配置..."
                      value={formData.workflowData}
                      onChange={(e) =>
                        handleInputChange('workflowData', e.target.value)
                      }
                      rows={12}
                      bg="white"
                      fontFamily="mono"
                      fontSize="sm"
                    />
                  </FormControl>

                  {formData.workflowData && (
                    <Text
                      fontSize="xs"
                      color={
                        validateJSON(formData.workflowData)
                          ? 'green.500'
                          : 'red.500'
                      }
                    >
                      {validateJSON(formData.workflowData)
                        ? '✓ JSON格式正确'
                        : '✗ JSON格式错误'}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>

            <Divider />

            {/* 底部操作按钮 */}
            <HStack justify="flex-end" spacing={4}>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                isDisabled={updateWorkflowMutation.isLoading}
              >
                取消
              </Button>
              {workflowData?.status === 'DRAFT' && (
                <Button
                  leftIcon={<Icon icon={LuGlobe} />}
                  colorScheme="green"
                  onClick={handlePublish}
                  isLoading={updateWorkflowMutation.isLoading}
                  loadingText="发布中..."
                >
                  发布工作流
                </Button>
              )}
              <Button
                leftIcon={<Icon icon={LuSave} />}
                colorScheme="blue"
                onClick={() => handleSave()}
                isLoading={updateWorkflowMutation.isLoading}
                loadingText="保存中..."
              >
                保存更改
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
