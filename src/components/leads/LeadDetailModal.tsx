import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EntityEmailHistory } from '@/components/shared/EntityEmailHistory';
import { SendEmailModal } from '@/components/SendEmailModal';
import {
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  MapPin,
  Clock,
  Send,
  History,
} from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  lead_name: string;
  company_name: string | null;
  position: string | null;
  email: string | null;
  phone_no: string | null;
  linkedin: string | null;
  website: string | null;
  country: string | null;
  industry: string | null;
  contact_source: string | null;
  description: string | null;
  lead_status: string | null;
  created_time: string | null;
}

interface LeadDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onUpdate?: () => void;
}

export const LeadDetailModal = ({
  open,
  onOpenChange,
  lead,
  onUpdate,
}: LeadDetailModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (!lead) return null;

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'attempted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'follow-up': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'disqualified': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">{lead.lead_name}</DialogTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {lead.position && <span>{lead.position}</span>}
                    {lead.position && lead.company_name && <span>at</span>}
                    {lead.company_name && (
                      <span className="font-medium">{lead.company_name}</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(lead.lead_status)}>
                {lead.lead_status || 'New'}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                Email History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Contact Information</h3>
                  
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${lead.email}`} className="text-sm hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  
                  {lead.phone_no && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${lead.phone_no}`} className="text-sm hover:underline">
                        {lead.phone_no}
                      </a>
                    </div>
                  )}
                  
                  {lead.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  
                  {lead.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        {lead.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Company Details</h3>
                  
                  {lead.company_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.company_name}</span>
                    </div>
                  )}
                  
                  {lead.industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.industry}</span>
                    </div>
                  )}
                  
                  {lead.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.country}</span>
                    </div>
                  )}
                  
                  {lead.contact_source && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Source: {lead.contact_source}</span>
                    </div>
                  )}
                </div>
              </div>

              {lead.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm">{lead.description}</p>
                  </div>
                </>
              )}

              {lead.created_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Created: {format(new Date(lead.created_time), 'dd/MM/yyyy')}
                </div>
              )}
            </TabsContent>

            <TabsContent value="emails" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Email History</h3>
                  {lead.email && (
                    <Button size="sm" onClick={() => setShowEmailModal(true)}>
                      <Send className="h-4 w-4 mr-1" />
                      Send Email
                    </Button>
                  )}
                </div>
                <EntityEmailHistory entityType="lead" entityId={lead.id} />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <SendEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        recipient={{
          name: lead.lead_name,
          email: lead.email || undefined,
          company_name: lead.company_name || undefined,
          position: lead.position || undefined,
        }}
        leadId={lead.id}
        onEmailSent={onUpdate}
      />
    </>
  );
};
