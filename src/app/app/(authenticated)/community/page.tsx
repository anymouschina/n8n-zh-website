'use client';

import { useEffect } from 'react';

import { Box, Container, Spinner, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // 直接跳转到首页（n8n showcase页面）
    router.replace('/');
  }, [router]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="md" textAlign="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text fontSize="lg" color="gray.600">
            正在跳转到工作流社区...
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
