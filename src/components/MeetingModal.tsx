import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Video, Loader2, CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Common timezones
const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Denver", label: "Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

// Generate 15-minute time slots
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

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
  status: string;
}

interface Lead {
  id: string;
  lead_name: string;
  email?: string;
}

interface Contact {
  id: string;
  contact_name: string;
  email?: string;
}

interface MeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Meeting | null;
  onSuccess: () => void;
}

export const MeetingModal = ({ open, onOpenChange, meeting, onSuccess }: MeetingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creatingTeamsMeeting, setCreatingTeamsMeeting] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Separate state for date/time selection
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState("10:00");
  
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    join_url: "",
    lead_id: "",
    contact_id: "",
    status: "scheduled"
  });

  // Get current date/time for validation
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter time slots to exclude past times for today
  const getAvailableTimeSlots = (selectedDate: Date | undefined, isStart: boolean) => {
    if (!selectedDate) return TIME_SLOTS;
    
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const isToday = selectedDateOnly.getTime() === today.getTime();
    
    if (!isToday) return TIME_SLOTS;
    
    // For today, filter out past times
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return TIME_SLOTS.filter(slot => {
      const [h, m] = slot.split(":").map(Number);
      if (h > currentHour) return true;
      if (h === currentHour && m > currentMinute) return true;
      return false;
    });
  };

  const availableStartTimeSlots = useMemo(() => getAvailableTimeSlots(startDate, true), [startDate, now]);
  const availableEndTimeSlots = useMemo(() => {
    const slots = getAvailableTimeSlots(endDate, false);
    
    // If same day as start, end time must be after start time
    if (startDate && endDate && startDate.toDateString() === endDate.toDateString()) {
      return slots.filter(slot => slot > startTime);
    }
    return slots;
  }, [endDate, startDate, startTime, now]);

  useEffect(() => {
    if (open) {
      fetchLeadsAndContacts();
      if (meeting) {
        const start = new Date(meeting.start_time);
        const end = new Date(meeting.end_time);
        
        setStartDate(start);
        setStartTime(format(start, "HH:mm"));
        setEndDate(end);
        setEndTime(format(end, "HH:mm"));
        
        setFormData({
          subject: meeting.subject || "",
          description: meeting.description || "",
          join_url: meeting.join_url || "",
          lead_id: meeting.lead_id || "",
          contact_id: meeting.contact_id || "",
          status: meeting.status || "scheduled"
        });
      } else {
        // Set default start time to next hour rounded to 15 min
        const defaultStart = new Date();
        defaultStart.setMinutes(Math.ceil(defaultStart.getMinutes() / 15) * 15 + 15, 0, 0);
        if (defaultStart.getMinutes() === 0) {
          defaultStart.setHours(defaultStart.getHours());
        }
        
        const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
        
        setStartDate(defaultStart);
        setStartTime(format(defaultStart, "HH:mm"));
        setEndDate(defaultEnd);
        setEndTime(format(defaultEnd, "HH:mm"));
        
        setFormData({
          subject: "",
          description: "",
          join_url: "",
          lead_id: "",
          contact_id: "",
          status: "scheduled"
        });
      }
    }
  }, [open, meeting]);

  // Auto-adjust end date/time when start changes
  useEffect(() => {
    if (startDate && startTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(sh, sm, 0, 0);
      
      // If end is before start, adjust end to 1 hour after start
      if (endDate && endTime) {
        const [eh, em] = endTime.split(":").map(Number);
        const endDateTime = new Date(endDate);
        endDateTime.setHours(eh, em, 0, 0);
        
        if (endDateTime <= startDateTime) {
          const newEnd = new Date(startDateTime.getTime() + 60 * 60 * 1000);
          setEndDate(newEnd);
          setEndTime(format(newEnd, "HH:mm"));
        }
      }
    }
  }, [startDate, startTime]);

  const fetchLeadsAndContacts = async () => {
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        supabase.from('leads').select('id, lead_name, email').order('lead_name'),
        supabase.from('contacts').select('id, contact_name, email').order('contact_name')
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
    } catch (error) {
      console.error('Error fetching leads/contacts:', error);
    }
  };

  const buildISODateTime = (date: Date | undefined, time: string): string => {
    if (!date) return "";
    const [h, m] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(h, m, 0, 0);
    return dt.toISOString();
  };

  const createTeamsMeeting = async () => {
    if (!formData.subject || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in subject, start time and end time first",
        variant: "destructive",
      });
      return;
    }

    setCreatingTeamsMeeting(true);
    try {
      const attendees: { email: string; name: string }[] = [];
      
      if (formData.lead_id) {
        const lead = leads.find(l => l.id === formData.lead_id);
        if (lead?.email) {
          attendees.push({ email: lead.email, name: lead.lead_name });
        }
      }
      
      if (formData.contact_id) {
        const contact = contacts.find(c => c.id === formData.contact_id);
        if (contact?.email) {
          attendees.push({ email: contact.email, name: contact.contact_name });
        }
      }

      const { data, error } = await supabase.functions.invoke('create-teams-meeting', {
        body: {
          subject: formData.subject,
          attendees,
          startTime: buildISODateTime(startDate, startTime),
          endTime: buildISODateTime(endDate, endTime)
        }
      });

      if (error) throw error;

      if (data?.meeting?.joinUrl) {
        setFormData(prev => ({ ...prev, join_url: data.meeting.joinUrl }));
        toast({
          title: "Teams Meeting Created",
          description: "Meeting link has been generated",
        });
      }
    } catch (error: any) {
      console.error('Error creating Teams meeting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create Teams meeting",
        variant: "destructive",
      });
    } finally {
      setCreatingTeamsMeeting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const meetingData = {
        subject: formData.subject,
        description: formData.description || null,
        start_time: buildISODateTime(startDate, startTime),
        end_time: buildISODateTime(endDate, endTime),
        join_url: formData.join_url || null,
        lead_id: formData.lead_id || null,
        contact_id: formData.contact_id || null,
        status: formData.status,
        created_by: user?.id
      };

      if (meeting) {
        const { error } = await supabase
          .from('meetings')
          .update(meetingData)
          .eq('id', meeting.id);
        if (error) throw error;
        toast({ title: "Success", description: "Meeting updated successfully" });
      } else {
        const { error } = await supabase
          .from('meetings')
          .insert([meetingData]);
        if (error) throw error;
        toast({ title: "Success", description: "Meeting created successfully" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit Meeting" : "New Meeting"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Meeting subject"
              required
            />
          </div>

          {/* Timezone Selection */}
          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd-MMM-yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < today}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDisplayTime(startTime)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 z-50 max-h-60 overflow-y-auto" align="start">
                  <div className="p-2 space-y-1">
                    {availableStartTimeSlots.length > 0 ? (
                      availableStartTimeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={startTime === slot ? "default" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => setStartTime(slot)}
                        >
                          {formatDisplayTime(slot)}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">No available times today</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd-MMM-yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || today)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDisplayTime(endTime)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 z-50 max-h-60 overflow-y-auto" align="start">
                  <div className="p-2 space-y-1">
                    {availableEndTimeSlots.length > 0 ? (
                      availableEndTimeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={endTime === slot ? "default" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => setEndTime(slot)}
                        >
                          {formatDisplayTime(slot)}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">Select a later end time</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_id">Link to Lead</Label>
            <Select
              value={formData.lead_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, lead_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lead (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.lead_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_id">Link to Contact</Label>
            <Select
              value={formData.contact_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a contact (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.contact_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Meeting description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="join_url">Teams Meeting Link</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={createTeamsMeeting}
                disabled={creatingTeamsMeeting}
                className="gap-2"
              >
                {creatingTeamsMeeting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Create Teams Meeting
              </Button>
            </div>
            <Input
              id="join_url"
              value={formData.join_url}
              onChange={(e) => setFormData(prev => ({ ...prev, join_url: e.target.value }))}
              placeholder="https://teams.microsoft.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : meeting ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
