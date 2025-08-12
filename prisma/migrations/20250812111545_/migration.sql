-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ENABLED', 'DISABLED', 'NOT_VERIFIED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('APP', 'ADMIN');

-- CreateEnum
CREATE TYPE "WorkflowCategory" AS ENUM ('CONTENT_AUTOMATION', 'SOCIAL_MEDIA', 'DATA_PROCESSING', 'COMMUNICATION', 'FINANCE', 'MARKETING', 'DEVELOPMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkflowComplexity" AS ENUM ('SIMPLE', 'INTERMEDIATE', 'ADVANCED', 'BUSINESS');

-- CreateEnum
CREATE TYPE "WorkflowTriggerType" AS ENUM ('SCHEDULED', 'WEBHOOK', 'MANUAL', 'EMAIL', 'FILE_CHANGE', 'DATABASE_CHANGE', 'API_CALL', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("provider","providerUserId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "image" TEXT,
    "authorizations" "UserRole"[] DEFAULT ARRAY['APP']::"UserRole"[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "WorkflowCategory" NOT NULL,
    "complexity" "WorkflowComplexity" NOT NULL,
    "triggerType" "WorkflowTriggerType" NOT NULL,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "previewImage" TEXT,
    "workflowData" JSONB,
    "createdById" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "WorkflowTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WorkflowToWorkflowTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_name_key" ON "Repository"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workflow_category_idx" ON "Workflow"("category");

-- CreateIndex
CREATE INDEX "Workflow_complexity_idx" ON "Workflow"("complexity");

-- CreateIndex
CREATE INDEX "Workflow_triggerType_idx" ON "Workflow"("triggerType");

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");

-- CreateIndex
CREATE INDEX "Workflow_createdById_idx" ON "Workflow"("createdById");

-- CreateIndex
CREATE INDEX "Workflow_likeCount_idx" ON "Workflow"("likeCount");

-- CreateIndex
CREATE INDEX "WorkflowLike_userId_idx" ON "WorkflowLike"("userId");

-- CreateIndex
CREATE INDEX "WorkflowLike_workflowId_idx" ON "WorkflowLike"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowLike_userId_workflowId_key" ON "WorkflowLike"("userId", "workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTag_name_key" ON "WorkflowTag"("name");

-- CreateIndex
CREATE INDEX "WorkflowTag_name_idx" ON "WorkflowTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_WorkflowToWorkflowTag_AB_unique" ON "_WorkflowToWorkflowTag"("A", "B");

-- CreateIndex
CREATE INDEX "_WorkflowToWorkflowTag_B_index" ON "_WorkflowToWorkflowTag"("B");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowLike" ADD CONSTRAINT "WorkflowLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowLike" ADD CONSTRAINT "WorkflowLike_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkflowToWorkflowTag" ADD CONSTRAINT "_WorkflowToWorkflowTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkflowToWorkflowTag" ADD CONSTRAINT "_WorkflowToWorkflowTag_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkflowTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
