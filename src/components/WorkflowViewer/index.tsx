'use client';

import React, { useCallback, useMemo } from 'react';

import {
  Badge,
  Box,
  Icon as ChakraIcon,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  LuCode,
  LuDatabase,
  LuFileText,
  LuGlobe,
  LuMail,
  LuPlay,
  LuSettings,
} from 'react-icons/lu';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Edge,
  Node,
  NodeTypes,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NodeData {
  label?: string;
  nodeType: string;
  name?: string;
  [key: string]: unknown;
}

// 自定义节点类型
const CustomNode = ({ data }: { data: NodeData }) => {
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType?.toLowerCase()) {
      case 'trigger':
      case 'cron':
      case 'webhook':
        return LuPlay;
      case 'http':
      case 'api':
        return LuGlobe;
      case 'database':
      case 'mysql':
      case 'postgres':
        return LuDatabase;
      case 'email':
      case 'gmail':
        return LuMail;
      case 'code':
      case 'javascript':
        return LuCode;
      case 'file':
      case 'csv':
        return LuFileText;
      default:
        return LuSettings;
    }
  };

  const getNodeColor = (nodeType?: string) => {
    switch (nodeType?.toLowerCase()) {
      case 'trigger':
      case 'cron':
      case 'webhook':
        return 'green';
      case 'http':
      case 'api':
        return 'blue';
      case 'database':
      case 'mysql':
      case 'postgres':
        return 'purple';
      case 'email':
      case 'gmail':
        return 'orange';
      case 'code':
      case 'javascript':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="lg"
      border="2px solid"
      borderColor={`${getNodeColor(data.nodeType)}.200`}
      p={3}
      minW="140px"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack spacing={2} align="center">
        <HStack spacing={2}>
          <ChakraIcon
            as={getNodeIcon(data.nodeType)}
            color={`${getNodeColor(data.nodeType)}.500`}
            boxSize={4}
          />
          <Badge colorScheme={getNodeColor(data.nodeType)} size="sm">
            {data.nodeType || 'Node'}
          </Badge>
        </HStack>
        <Text
          fontSize="xs"
          fontWeight="medium"
          textAlign="center"
          noOfLines={2}
        >
          {data.label || data.name || 'Unnamed Node'}
        </Text>
      </VStack>
    </Box>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export interface WorkflowData {
  nodes?: Record<
    string,
    {
      name?: string;
      type?: string;
      position?: [number, number];
      parameters?: Record<string, unknown>;
    }
  >;
  connections?: Record<
    string,
    {
      main?: Record<string, unknown> | Array<Record<string, unknown>>;
    }
  >;
}

interface WorkflowViewerProps {
  workflowData: WorkflowData | null;
  width?: string | number;
  height?: string | number;
  interactive?: boolean;
}

export function WorkflowViewer({
  workflowData,
  width = '100%',
  height = 400,
  interactive = true,
}: WorkflowViewerProps) {
  // 转换 N8N 工作流数据为 React Flow 格式
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!workflowData || !workflowData.nodes) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 处理节点
    Object.entries(workflowData.nodes).forEach(([nodeId, nodeData], index) => {
      nodes.push({
        id: nodeId,
        type: 'custom',
        position: {
          x: nodeData.position?.[0] || (index % 3) * 200,
          y: nodeData.position?.[1] || Math.floor(index / 3) * 100,
        },
        data: {
          label: nodeData.name || nodeData.type || 'Node',
          nodeType: nodeData.type,
          name: nodeData.name,
          ...nodeData.parameters,
        },
        draggable: interactive,
      });
    });

    // 处理连接
    Object.entries(workflowData.connections || {}).forEach(
      ([sourceNodeId, connections]) => {
        const mainConnections = connections.main || {};

        // 处理 main 可能是数组或对象的情况
        const connectionsToProcess = Array.isArray(mainConnections)
          ? mainConnections[0] || {}
          : mainConnections;

        Object.entries(connectionsToProcess).forEach(
          ([outputIndex, targetConnections]) => {
            // 确保 targetConnections 是数组
            const connectionsArray = Array.isArray(targetConnections)
              ? targetConnections
              : ([targetConnections].filter(Boolean) as Array<{
                  node: string;
                  index?: number;
                }>);

            connectionsArray.forEach((connection, connectionIndex: number) => {
              const targetNodeId = connection.node;
              const targetInputIndex = connection.index || 0;

              edges.push({
                id: `${sourceNodeId}-${outputIndex}-${targetNodeId}-${targetInputIndex}-${connectionIndex}`,
                source: sourceNodeId,
                target: targetNodeId,
                sourceHandle: `output-${outputIndex}`,
                targetHandle: `input-${targetInputIndex}`,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#718096', strokeWidth: 2 },
              });
            });
          }
        );
      }
    );

    return { nodes, edges };
  }, [workflowData, interactive]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(() => {
    // 在展示模式下禁用连接
    if (!interactive) return;
  }, [interactive]);

  if (!workflowData || initialNodes.length === 0) {
    return (
      <Box
        w={width}
        h={height}
        bg="gray.50"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="1px dashed"
        borderColor="gray.300"
      >
        <VStack spacing={2}>
          <Text color="gray.500" fontSize="sm">
            <img src="/tip.jpeg" alt="" srcset="" />
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      w={width}
      h={height}
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
    >
      <img src="/tip.jpeg" alt="" srcset="" />
      {/* <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
        zoomOnScroll={interactive}
        panOnScroll={interactive}
        zoomOnDoubleClick={interactive}
        selectNodesOnDrag={interactive}
      >
        {interactive && <Controls showInteractive={false} />}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e2e8f0"
        />
      </ReactFlow> */}
    </Box>
  );
}

export default WorkflowViewer;
