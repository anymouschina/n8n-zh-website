'use client';

import React from 'react';

import {
  Badge,
  Box,
  Container,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useParams } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const { data, isLoading, error } = trpc.workflows.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  if (!id) return null;

  return (
    <Box py={8}>
      <Container maxW="4xl">
        {isLoading && <Text color="gray.500">加载中...</Text>}
        {error && <Text color="red.500">加载失败</Text>}
        {data && (
          <VStack align="stretch" spacing={5}>
            <Heading size="lg">{data.title}</Heading>
            {data.previewImage && (
              <Image
                src={data.previewImage}
                alt={data.title}
                borderRadius="lg"
              />
            )}
            <HStack spacing={3}>
              <Badge colorScheme="green">{data.category}</Badge>
              <Badge colorScheme="purple">{data.complexity}</Badge>
              <Badge colorScheme="blue">{data.status}</Badge>
              <Badge colorScheme="gray">{data.triggerType}</Badge>
            </HStack>
            <Text color="gray.700">{data.description}</Text>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
