-- Add new dedicated columns for dashboard preferences
ALTER TABLE public.dashboard_preferences 
ADD COLUMN IF NOT EXISTS dashboard_view text DEFAULT 'overview',
ADD COLUMN IF NOT EXISTS widget_layouts jsonb DEFAULT NULL;

-- Backfill existing data based on layout_view content
UPDATE public.dashboard_preferences
SET 
  -- If layout_view looks like JSON object, copy to widget_layouts
  widget_layouts = CASE 
    WHEN layout_view IS NOT NULL AND layout_view LIKE '{%' THEN layout_view::jsonb 
    ELSE NULL 
  END,
  -- If layout_view is a simple view string, copy to dashboard_view
  dashboard_view = CASE 
    WHEN layout_view IN ('overview', 'analytics') THEN layout_view
    WHEN layout_view IS NULL OR layout_view LIKE '{%' THEN 'overview'
    ELSE 'overview'
  END
WHERE dashboard_view IS NULL OR widget_layouts IS NULL;