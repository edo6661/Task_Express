import { RequestHandler } from "express";
import { HttpStatusCode, RequestBody } from "../types/api";
import { NewTask, Task, tasks } from "../lib/db/schema";
import { db } from "../lib/db/database";
import { createErrorRes, createSuccessRes } from "../utils/api_response";
import { validateEmpty } from "../utils/validation";
import { eq } from "drizzle-orm";

import { validate as validateUUID } from "uuid";
export const getTasks: RequestHandler = async (req, res) => {
  try {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, req.userId));
    createSuccessRes(res, {
      message: allTasks.length ? "Successfully fetched tasks" : "Task is empty",
      data: allTasks,
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};

export const createTask: RequestHandler = async (
  req: RequestBody<NewTask>,
  res
) => {
  try {
    req.body = { ...req.body, userId: req.userId };
    const { title, description, hexColor } = req.body;
    if (
      validateEmpty(title) ||
      validateEmpty(description) ||
      validateEmpty(hexColor)
    ) {
      createErrorRes(
        res,
        "Title, description, and hexColor are required",
        HttpStatusCode.BAD_REQUEST
      );
      return;
    }

    const newTask = {
      ...req.body,
    };

    if (req.body.dueAt) {
      newTask.dueAt = new Date(req.body.dueAt);

      if (isNaN(newTask.dueAt.getTime())) {
        createErrorRes(
          res,
          "Invalid date format for dueAt",
          HttpStatusCode.BAD_REQUEST
        );
        return;
      }
    }

    const [task] = await db.insert(tasks).values(newTask).returning();

    createSuccessRes(res, {
      statusCode: HttpStatusCode.CREATED,
      message: "Successfully created task",
      data: task,
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};
export const updateTask: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateUUID(id)) {
      createErrorRes(res, "Invalid task id", HttpStatusCode.BAD_REQUEST);
      return;
    }
    const { title, description, hexColor } = req.body;
    if (
      validateEmpty(title) ||
      validateEmpty(description) ||
      validateEmpty(hexColor)
    ) {
      createErrorRes(
        res,
        "Title, description, and hexColor are required",
        HttpStatusCode.BAD_REQUEST
      );
      return;
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) {
      createErrorRes(res, "Task not found", HttpStatusCode.NOT_FOUND);
      return;
    }
    if (task.title === title && task.description === description) {
      createErrorRes(res, "No changes detected", HttpStatusCode.BAD_REQUEST);
      return;
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({ ...req.body })
      .where(eq(tasks.id, id))
      .returning();
    if (!updatedTask) {
      createErrorRes(res, "Task not found", HttpStatusCode.NOT_FOUND);
      return;
    }
    createSuccessRes(res, {
      message: "Successfully updated task",
      data: updatedTask,
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};
export const deleteTask: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateUUID(id)) {
      createErrorRes(res, "Invalid task id", HttpStatusCode.BAD_REQUEST);
      return;
    }
    const [deletedTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!deletedTask) {
      createErrorRes(res, "Task not found", HttpStatusCode.NOT_FOUND);
      return;
    }
    await db.delete(tasks).where(eq(tasks.id, id)).returning();

    createSuccessRes(res, {
      message: "Successfully deleted task",
      data: deleteTask,
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};
export const syncTask: RequestHandler = async (
  req: RequestBody<Task[]>,
  res
) => {
  try {
    const tasksFromBody = req.body;
    if (!tasksFromBody || !Array.isArray(tasksFromBody)) {
      createErrorRes(res, "Invalid tasksFromBody", HttpStatusCode.BAD_REQUEST);
      return;
    }

    const newTasks = tasksFromBody.map((task) => ({
      ...task,
      userId: req.userId,
      dueAt: task.dueAt ? new Date(task.dueAt) : new Date(),
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    }));

    for (const task of newTasks) {
      await db.transaction(async (tx) => {
        const existingTask = await tx
          .select()
          .from(tasks)
          .where(eq(tasks.id, task.id));

        if (existingTask.length > 0) {
          await tx.update(tasks).set(task).where(eq(tasks.id, task.id));
        } else {
          await tx.insert(tasks).values(task);
        }
      });
    }

    createSuccessRes(res, {
      message: "Successfully synced tasks",
      data: await db.select().from(tasks).where(eq(tasks.userId, req.userId)),
    });
  } catch (error) {
    createErrorRes(res, error);
  }
};
