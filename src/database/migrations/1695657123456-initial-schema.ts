import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1695657123456 implements MigrationInterface {
  name = 'InitialSchema1695657123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM ('admin', 'manager', 'member', 'viewer')
        `);

    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'member',
                "skills" text array,
                "avatar_url" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "preferences" jsonb,
                "last_login_at" TIMESTAMP,
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

    // Projects table
    await queryRunner.query(`
            CREATE TYPE "public"."project_status_enum" AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'archived')
        `);

    await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "status" "public"."project_status_enum" NOT NULL DEFAULT 'planning',
                "start_date" date NOT NULL,
                "end_date" date,
                "metadata" jsonb,
                "priority" integer NOT NULL DEFAULT 0,
                "budget" decimal(10,2) NOT NULL DEFAULT 0,
                "tags" text array NOT NULL DEFAULT '{}',
                "owner_id" uuid,
                CONSTRAINT "PK_projects" PRIMARY KEY ("id"),
                CONSTRAINT "FK_projects_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

    // Tasks table
    await queryRunner.query(`
            CREATE TYPE "public"."task_status_enum" AS ENUM ('todo', 'in_progress', 'in_review', 'done')
        `);

    await queryRunner.query(`
            CREATE TYPE "public"."task_priority_enum" AS ENUM ('low', 'medium', 'high', 'urgent')
        `);

    await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "status" "public"."task_status_enum" NOT NULL DEFAULT 'todo',
                "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'medium',
                "due_date" TIMESTAMP,
                "estimated_hours" decimal(5,2) NOT NULL DEFAULT 0,
                "actual_hours" decimal(5,2) NOT NULL DEFAULT 0,
                "labels" text array,
                "metadata" jsonb,
                "project_id" uuid,
                "assignee_id" uuid,
                CONSTRAINT "PK_tasks" PRIMARY KEY ("id"),
                CONSTRAINT "FK_tasks_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

    // Project Members junction table
    await queryRunner.query(`
            CREATE TABLE "project_members" (
                "project_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_project_members" PRIMARY KEY ("project_id", "user_id"),
                CONSTRAINT "FK_project_members_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_project_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    // Task Dependencies junction table
    await queryRunner.query(`
            CREATE TABLE "task_dependencies" (
                "task_id" uuid NOT NULL,
                "dependency_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_task_dependencies" PRIMARY KEY ("task_id", "dependency_id"),
                CONSTRAINT "FK_task_dependencies_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_task_dependencies_dependency" FOREIGN KEY ("dependency_id") REFERENCES "tasks"("id") ON DELETE CASCADE
            )
        `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users"("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_projects_owner" ON "projects"("owner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_project" ON "tasks"("project_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_assignee" ON "tasks"("assignee_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_status" ON "tasks"("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.query(`DROP TABLE "task_dependencies"`);
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop types
    await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
