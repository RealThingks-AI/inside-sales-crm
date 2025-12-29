-- Add module_type column for task module tracking
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS module_type text;

-- Add meeting_id foreign key column
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS meeting_id uuid REFERENCES public.meetings(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_module_type ON public.tasks(module_type);
CREATE INDEX IF NOT EXISTS idx_tasks_meeting_id ON public.tasks(meeting_id);

-- Add comments for documentation
COMMENT ON COLUMN public.tasks.module_type IS 'Type of module this task is linked to: accounts, contacts, leads, meetings, deals';
COMMENT ON COLUMN public.tasks.meeting_id IS 'Foreign key to meetings table for meeting-linked tasks';