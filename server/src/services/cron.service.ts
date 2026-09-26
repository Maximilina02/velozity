import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';
import { socketService } from './socket.service';
import { TaskStatus } from '../types';


export class CronService {
  private static isRunning = false;

  public static init() {
    console.log('[CronService] Initializing scheduled background jobs...');

    // Schedule background job to check for overdue tasks every minute
    cron.schedule('* * * * *', async () => {
      await CronService.checkOverdueTasks();
    });

    console.log('[CronService] Overdue task scanner scheduled (every 1 minute)');
  }

  public static async checkOverdueTasks() {
    if (CronService.isRunning) return;
    CronService.isRunning = true;

    try {
      const now = new Date();

      // Find tasks that have passed due date, not marked DONE, and not yet flagged isOverdue
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            not: 'DONE',
          },
          isOverdue: false,
        },
        include: {
          project: true,
          assignedTo: true,
        },
      });

      if (overdueTasks.length === 0) {
        CronService.isRunning = false;
        return;
      }

      console.log(`[CronService] Found ${overdueTasks.length} newly overdue tasks. Updating...`);

      for (const task of overdueTasks) {
        // Update task status in DB
        const updatedTask = await prisma.task.update({
          where: { id: task.id },
          data: { isOverdue: true },
          include: {
            project: true,
            assignedTo: true,
          },
        });

        // 1. Record activity log in DB & emit via WebSocket
        await ActivityService.log({
          action: 'TASK_OVERDUE',
          details: `Task #${task.taskNumber} "${task.title}" became overdue`,
          prevStatus: task.status as TaskStatus,
          newStatus: task.status as TaskStatus,
          taskId: task.id,
          projectId: task.projectId,
          userId: task.project.managerId, // system attribute to project manager
        });

        // 2. Notify Project Manager
        await NotificationService.notify({
          userId: task.project.managerId,
          title: 'Task Overdue Alert',
          message: `Task #${task.taskNumber} "${task.title}" in project "${task.project.name}" is now overdue.`,
          type: 'TASK_OVERDUE',
          taskId: task.id,
        });

        // 3. Notify Assigned Developer (if assigned)
        if (task.assignedToId) {
          await NotificationService.notify({
            userId: task.assignedToId,
            title: 'Task Overdue Alert',
            message: `Your assigned task #${task.taskNumber} "${task.title}" is overdue.`,
            type: 'TASK_OVERDUE',
            taskId: task.id,
          });
        }

        // 4. Emit live task update to project room
        socketService.emitTaskUpdated(task.projectId, updatedTask);
      }
    } catch (error) {
      console.error('[CronService] Error processing overdue tasks:', error);
    } finally {
      CronService.isRunning = false;
    }
  }
}
