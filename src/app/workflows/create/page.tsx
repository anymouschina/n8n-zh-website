'use client';

import React, { useState } from 'react';

import {
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
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuPlus, LuSave, LuUpload } from 'react-icons/lu';

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
  const router = useRouter();
  const toast = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complexity: 'SIMPLE',
    status: 'DRAFT',
    category: 'OTHER',
    triggerType: 'MANUAL',
    workflowData: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // 创建工作流的mutation
  const createWorkflowMutation = trpc.workflows.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: '创建成功',
        description: data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/app/workflows');
    },
    onError: (error) => {
      toast({
        title: '创建失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

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

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      title: formData.title,
      description: formData.description,
      complexity: formData.complexity as
        | 'SIMPLE'
        | 'INTERMEDIATE'
        | 'ADVANCED'
        | 'BUSINESS',
      status: formData.status as 'DRAFT' | 'PUBLISHED',
      category: formData.category as any,
      triggerType: formData.triggerType as any,
      tags,
      workflowData: formData.workflowData
        ? JSON.parse(formData.workflowData)
        : undefined,
    };

    createWorkflowMutation.mutate(submitData);
  };

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
              <Heading size="lg">创建工作流</Heading>
              <Text color="gray.600">创建新的工作流模板并分享给社区</Text>
            </VStack>
          </Flex>

          <form onSubmit={handleSubmit}>
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
                          <Tag
                            key={index}
                            colorScheme="blue"
                            borderRadius="full"
                          >
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
                      粘贴或上传从n8n导出的工作流JSON配置
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
                        placeholder="粘贴工作流JSON配置..."
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

              {/* 提交按钮 */}
              <HStack justify="flex-end" spacing={4}>
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  isDisabled={createWorkflowMutation.isLoading}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  leftIcon={<Icon icon={LuSave} />}
                  isLoading={createWorkflowMutation.isLoading}
                  loadingText="创建中..."
                >
                  创建工作流
                </Button>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </Container>
    </Box>
  );
}
