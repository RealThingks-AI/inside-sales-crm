import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Task, CreateTaskData, TaskStatus } from '@/types/task';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id (lead_name, account_id, accounts:account_id (company_name)),
          contacts:contact_id (contact_name, account_id, accounts:account_id (company_name)),
          deals:deal_id (deal_name, stage),
          accounts:account_id (company_name),
          meetings:meeting_id (subject, start_time)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(task => ({
        ...task,
        lead_name: task.leads?.lead_name || null,
        contact_name: task.contacts?.contact_name || null,
        deal_name: task.deals?.deal_name || null,
        deal_stage: task.deals?.stage || null,
        account_name: task.accounts?.company_name || null,
        meeting_subject: task.meetings?.subject || null,
        contact_account_name: task.contacts?.accounts?.company_name || null,
        lead_account_name: task.leads?.accounts?.company_name || null,
      })) as Task[];

      setTasks(transformedData);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData: CreateTaskData) => {
    if (!user?.id) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for assigned user if different from creator
      if (taskData.assigned_to && taskData.assigned_to !== user.id) {
        await supabase.from('notifications').insert({
          user_id: taskData.assigned_to,
          message: `You have been assigned a new task: ${taskData.title}`,
          notification_type: 'task_assigned',
        });
      }

      toast({ title: "Success", description: "Task created successfully" });
      fetchTasks();
      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({ title: "Error", description: error.message || "Failed to create task", variant: "destructive" });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>, originalTask?: Task) => {
    if (!user?.id) return false;

    try {
      const updateData: any = { ...updates };
      
      // If status is changing to completed, set completed_at
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.status) {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Create notifications for changes
      if (originalTask) {
        // Notify on reassignment
        if (updates.assigned_to && updates.assigned_to !== originalTask.assigned_to && updates.assigned_to !== user.id) {
          await supabase.from('notifications').insert({
            user_id: updates.assigned_to,
            message: `You have been assigned a task: ${originalTask.title}`,
            notification_type: 'task_assigned',
          });
        }

        // Notify on completion (notify creator)
        if (updates.status === 'completed' && originalTask.created_by && originalTask.created_by !== user.id) {
          await supabase.from('notifications').insert({
            user_id: originalTask.created_by,
            message: `Task completed: ${originalTask.title}`,
            notification_type: 'task_completed',
          });
        }

        // Notify assigned user on due date change
        if (updates.due_date && updates.due_date !== originalTask.due_date && originalTask.assigned_to && originalTask.assigned_to !== user.id) {
          await supabase.from('notifications').insert({
            user_id: originalTask.assigned_to,
            message: `Due date changed for task: ${originalTask.title}`,
            notification_type: 'task_updated',
          });
        }
      }

      toast({ title: "Success", description: "Task updated successfully" });
      fetchTasks();
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({ title: "Error", description: error.message || "Failed to update task", variant: "destructive" });
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({ title: "Success", description: "Task deleted successfully" });
      fetchTasks();
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({ title: "Error", description: error.message || "Failed to delete task", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
