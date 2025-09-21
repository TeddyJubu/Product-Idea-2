-- enums
CREATE TYPE "Role" AS ENUM ('OWNER','ADMIN','MEMBER');
CREATE TYPE "IdeaStatus" AS ENUM ('PENDING','VALIDATING','VALIDATED','ARCHIVED');
CREATE TYPE "TaskKind" AS ENUM ('INTERVIEW','SMOKE_TEST','MARKET_RESEARCH','PROTOTYPE','OTHER');
CREATE TYPE "TaskStatus" AS ENUM ('TODO','DOING','DONE','SKIPPED');

-- tables
CREATE TABLE "User"(
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Workspace"(
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Membership"(
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  CONSTRAINT "Membership_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Membership_ws_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);

CREATE TABLE "Idea"(
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "impact" INTEGER NOT NULL,
  "confidence" INTEGER NOT NULL,
  "effort" INTEGER NOT NULL,
  "iceScore" DOUBLE PRECISION NOT NULL,
  "status" "IdeaStatus" NOT NULL DEFAULT 'PENDING',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP,
  CONSTRAINT "Idea_ws_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "Idea_user_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")
);

CREATE TABLE "Tag"(
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Tag_ws_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Tag_ws_name_uq" ON "Tag"("workspaceId","name");

CREATE TABLE "IdeaTag"(
  "ideaId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  PRIMARY KEY("ideaId","tagId"),
  CONSTRAINT "IdeaTag_idea_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE,
  CONSTRAINT "IdeaTag_tag_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE
);

CREATE TABLE "ValidationTask"(
  "id" TEXT PRIMARY KEY,
  "ideaId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "kind" "TaskKind" NOT NULL,
  "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
  "notes" TEXT,
  "weight" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL,
  CONSTRAINT "ValidationTask_idea_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE
);

CREATE TABLE "Evidence"(
  "id" TEXT PRIMARY KEY,
  "ideaId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "url" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Evidence_idea_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE
);

CREATE TABLE "Comment"(
  "id" TEXT PRIMARY KEY,
  "ideaId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Comment_idea_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE,
  CONSTRAINT "Comment_user_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Activity"(
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "actorId" TEXT,
  "kind" TEXT NOT NULL,
  "meta" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Activity_ws_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "Activity_actor_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id")
);
