import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Meeting {
  id: string;
  subject: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  join_url?: string | null;
  attendees?: unknown;
  lead_id?: string | null;
  contact_id?: string | null;
  created_by?: string | null;
  status: string;
  outcome?: string | null;
  notes?: string | null;
}

export const useMeetingsImportExport = (onImportComplete: () => void) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImport = async (file: File) => {
    setIsImporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have headers and at least one data row');
      }

      // Parse headers
      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
      console.log('CSV Headers:', headers);

      // Required fields mapping
      const subjectIdx = headers.findIndex(h => h === 'subject' || h === 'title' || h === 'meeting subject');
      const startDateIdx = headers.findIndex(h => h === 'start_time' || h === 'start date' || h === 'date');
      const startTimeIdx = headers.findIndex(h => h === 'start time' || h === 'time');
      const endTimeIdx = headers.findIndex(h => h === 'end_time' || h === 'end time' || h === 'end date');
      const statusIdx = headers.findIndex(h => h === 'status');
      const descriptionIdx = headers.findIndex(h => h === 'description' || h === 'agenda');
      const outcomeIdx = headers.findIndex(h => h === 'outcome');
      const notesIdx = headers.findIndex(h => h === 'notes');
      const joinUrlIdx = headers.findIndex(h => h === 'join_url' || h === 'meeting link' || h === 'join url');

      if (subjectIdx === -1) {
        throw new Error('CSV must have a "Subject" column');
      }
      if (startDateIdx === -1) {
        throw new Error('CSV must have a "Start Date" or "start_time" column');
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          const subject = values[subjectIdx]?.trim();
          
          if (!subject) {
            errors.push(`Row ${i + 1}: Missing subject`);
            errorCount++;
            continue;
          }

          // Parse dates
          let startTime: Date;
          let endTime: Date;

          const dateValue = values[startDateIdx]?.trim();
          const timeValue = startTimeIdx !== -1 ? values[startTimeIdx]?.trim() : '';
          const endTimeValue = endTimeIdx !== -1 ? values[endTimeIdx]?.trim() : '';

          // Try to parse start time
          if (dateValue.includes('T') || dateValue.includes(' ')) {
            // Full datetime format
            startTime = new Date(dateValue);
          } else if (timeValue) {
            // Separate date and time
            startTime = new Date(`${dateValue} ${timeValue}`);
          } else {
            // Just date, default to 9:00 AM
            startTime = new Date(dateValue);
            startTime.setHours(9, 0, 0, 0);
          }

          if (isNaN(startTime.getTime())) {
            errors.push(`Row ${i + 1}: Invalid start date/time`);
            errorCount++;
            continue;
          }

          // Parse end time or default to 1 hour later
          if (endTimeValue) {
            if (endTimeValue.includes('T') || endTimeValue.includes(':')) {
              endTime = new Date(endTimeValue);
            } else {
              endTime = new Date(`${dateValue} ${endTimeValue}`);
            }
          } else {
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
          }

          if (isNaN(endTime.getTime())) {
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          }

          const meetingData = {
            subject,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: statusIdx !== -1 ? (values[statusIdx]?.trim() || 'scheduled') : 'scheduled',
            description: descriptionIdx !== -1 ? values[descriptionIdx]?.trim() || null : null,
            outcome: outcomeIdx !== -1 ? values[outcomeIdx]?.trim() || null : null,
            notes: notesIdx !== -1 ? values[notesIdx]?.trim() || null : null,
            join_url: joinUrlIdx !== -1 ? values[joinUrlIdx]?.trim() || null : null,
            created_by: user.id,
          };

          const { error } = await supabase.from('meetings').insert(meetingData);
          
          if (error) {
            errors.push(`Row ${i + 1}: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (rowError: any) {
          errors.push(`Row ${i + 1}: ${rowError.message}`);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Import Successful",
          description: `Imported ${successCount} meetings${errorCount > 0 ? ` with ${errorCount} errors` : ''}`,
        });
      }

      if (errorCount > 0 && errors.length > 0) {
        console.error('Import errors:', errors);
        toast({
          title: "Import Errors",
          description: `${errorCount} errors occurred. Check console for details.`,
          variant: "destructive",
        });
      }

      onImportComplete();

    } catch (error: any) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (meetings: Meeting[]) => {
    setIsExporting(true);
    
    try {
      if (!meetings || meetings.length === 0) {
        toast({
          title: "No Data",
          description: "No meetings to export.",
        });
        return;
      }

      // CSV headers
      const headers = [
        'Subject',
        'Start Time',
        'End Time',
        'Status',
        'Outcome',
        'Description',
        'Notes',
        'Join URL',
        'Lead/Contact'
      ];

      // Build CSV rows
      const rows = meetings.map(meeting => {
        const leadContact = (meeting as any).lead_name || (meeting as any).contact_name || '';
        return [
          escapeCSVField(meeting.subject),
          meeting.start_time,
          meeting.end_time,
          meeting.status,
          meeting.outcome || '',
          escapeCSVField(meeting.description || ''),
          escapeCSVField(meeting.notes || ''),
          meeting.join_url || '',
          leadContact
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      // Download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `meetings_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${meetings.length} meetings to CSV.`,
      });

    } catch (error: any) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    handleImport,
    handleExport,
    isImporting,
    isExporting,
    fileInputRef,
    triggerFileInput,
  };
};

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Helper function to escape CSV fields
function escapeCSVField(field: string): string {
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
