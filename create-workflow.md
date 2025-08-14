# n8n API中间服务调用流程指南

## 🎯 功能概述

本服务提供以下API功能：
1. 创建新用户（自动创建项目数据）
2. 为指定用户创建工作流（支持完整n8n工作流格式）
3. 查询用户项目关系
4. 确保用户项目数据完整性

## 📡 API端点

### 基础URL
```
http://localhost:3001
```

### 核心端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/users` | POST | 创建新用户 |
| `/users/{userId}/project-relations` | GET | 查询用户项目关系 |
| `/users/workflows` | POST | 为用户创建工作流 |
| `/users/{userId}/ensure-project-data` | POST | 确保用户项目数据 |

## 🚀 完整调用流程

### 步骤1：创建用户
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "firstName": "新",
    "lastName": "用户"
  }'
```

**响应示例：**
```json
{
  "id": "0989a6b8-143b-4f4e-8dfd-30ef6037f03f",
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "createdAt": "2025-08-14T04:52:21.583Z",
  "updatedAt": "2025-08-14T04:52:21.583Z"
}
```

### 步骤2：检查用户项目数据（可选）
```bash
curl -X GET http://localhost:3001/users/{userId}/project-relations
```

**响应示例：**
```json
[
  {
    "projectId": "project-g1htidv2i",
    "userId": "0989a6b8-143b-4f4e-8dfd-30ef6037f03f",
    "role": "project:personalOwner",
    "project": {
      "id": "project-g1htidv2i",
      "name": "New <newuser@example.com>",
      "type": "personal"
    }
  }
]
```

### 步骤3：为用户创建工作流
```bash
curl -X POST http://localhost:3001/users/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{用户ID}",
    "workflowName": "工作流名称",
    "workflowJson": {
      "nodes": [...],
      "connections": {...},
      "pinData": {},
      "meta": {...}
    },
    "description": "工作流描述",
    "active": true,
    "settings": {...}
  }'
```

## 📋 详细参数说明

### 创建用户参数
```json
{
  "email": "用户邮箱 (必需)",
  "firstName": "名 (可选)",
  "lastName": "姓 (可选)"
}
```

### 创建工作流参数
```json
{
  "userId": "用户ID (必需)",
  "workflowName": "工作流名称 (必需)",
  "workflowJson": {
    "nodes": [节点数组],
    "connections": {连接关系},
    "pinData": {},
    "meta": {元数据}
  },
  "description": "工作流描述 (可选)",
  "active": "是否激活 (默认true)",
  "settings": "工作流设置 (可选)",
  "projectId": "指定项目ID (可选)",
  "folderId": "指定文件夹ID (可选)"
}
```

## 🎨 支持的工作流类型

### RSS订阅工作流示例
```json
{
  "workflowName": "RSS订阅工作流",
  "workflowJson": {
    "nodes": [
      {
        "id": "schedule-trigger-id",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "position": [-6016, 432],
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "minutes",
                "minutesInterval": 30
              }
            ]
          }
        },
        "typeVersion": 1.2
      },
      {
        "id": "rss-reader-id",
        "name": "RSS读取器",
        "type": "n8n-nodes-base.rssFeedRead",
        "position": [-4240, 768],
        "parameters": {
          "url": "https://example.com/rss",
          "options": {}
        },
        "typeVersion": 1.2
      }
    ],
    "connections": {
      "Schedule Trigger": {
        "main": [
          [
            {
              "node": "RSS读取器",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }
}
```

## 🔄 自动化流程

### 用户创建时自动完成
1. ✅ 创建用户记录
2. ✅ 自动创建个人项目
3. ✅ 自动创建项目关系
4. ✅ 设置默认权限

### 工作流创建时自动完成
1. ✅ 验证用户存在性
2. ✅ 验证项目权限
3. ✅ 处理文件夹关联
4. ✅ 创建工作流主表记录
5. ✅ 创建共享工作流记录
6. ✅ 创建工作流历史记录
7. ✅ 创建工作流统计记录
8. ✅ 事务性操作确保数据一致性

## 📊 响应数据格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功描述",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "statusCode": 500,
  "message": "错误描述"
}
```

## 🔧 技术特性

### 数据库支持
- 支持PostgreSQL数据库
- 事务性操作确保数据完整性
- 完全兼容n8n数据结构

### 权限管理
- 自动设置工作流所有者权限
- 支持项目级别的权限验证
- 支持文件夹级别的访问控制

### 扩展性
- 支持自定义工作流配置
- 支持元数据和标签系统
- 支持工作流版本管理

## 🚀 使用示例

### 完整自动化脚本
```bash
#!/bin/bash

# 1. 创建用户
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "batch-user-$(date +%s)@example.com",
    "firstName": "批量",
    "lastName": "用户"
  }')

# 提取用户ID
USER_ID=$(echo $USER_RESPONSE | jq -r '.id')

# 2. 创建RSS工作流
curl -s -X POST http://localhost:3001/users/workflows \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"workflowName\": \"RSS订阅工作流\",
    \"workflowJson\": {
      \"nodes\": [
        {
          \"id\": \"schedule-trigger\",
          \"name\": \"Schedule Trigger\",
          \"type\": \"n8n-nodes-base.scheduleTrigger\",
          \"position\": [-6016, 432],
          \"parameters\": {
            \"rule\": {
              \"interval\": [{
                \"field\": \"minutes\",
                \"minutesInterval\": 30
              }]
            }
          },
          \"typeVersion\": 1.2
        }
      ]
    },
    \"description\": \"每30分钟检查RSS更新\",
    \"active\": true
  }"

echo "用户ID: $USER_ID"
```

## 📞 技术支持

如有问题请检查：
1. 服务是否运行在端口3001
2. 数据库连接是否正常
3. JSON格式是否正确
4. 用户ID和工作流ID是否有效

## 🔗 相关链接

- [n8n官方文档](https://docs.n8n.io/)
- [API服务源码](./src/)
- [数据库schema](./prisma/schema.prisma)
