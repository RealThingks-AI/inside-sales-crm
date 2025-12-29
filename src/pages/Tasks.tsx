import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types/task';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Loader2, List, LayoutGrid, CalendarDays, Trash2 } from 'lucide-react';
const Tasks = () => {
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask
  } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };
  const handleDelete = (taskId: string) => {
    setDeleteTaskId(taskId);
  };
  const confirmDelete = async () => {
    if (deleteTaskId) {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
    }
  };
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    await updateTask(taskId, {
      status
    }, task);
  };
  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'open' : 'completed';
    await updateTask(task.id, {
      status: newStatus
    }, task);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-background">
        <div className="px-6 h-16 flex items-center border-b w-full">
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl text-foreground font-semibold">Tasks</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="gap-1.5 h-8 px-2.5 text-xs">
                  <List className="h-3.5 w-3.5" />
                  List
                </Button>
                <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="gap-1.5 h-8 px-2.5 text-xs">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Kanban
                </Button>
                <Button variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('calendar')} className="gap-1.5 h-8 px-2.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar
                </Button>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    Actions
                    
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    
                    Columns
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    
                    Import CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={selectedTasks.length === 0} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedTasks.length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        {viewMode === 'list' && <TaskListView tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} onToggleComplete={handleToggleComplete} />}
        {viewMode === 'kanban' && <TaskKanbanView tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />}
        {viewMode === 'calendar' && <TaskCalendarView tasks={tasks} onEdit={handleEdit} />}
      </div>

      {/* Task Modal */}
      <TaskModal open={showModal} onOpenChange={handleCloseModal} task={editingTask} onSubmit={createTask} onUpdate={updateTask} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Tasks;