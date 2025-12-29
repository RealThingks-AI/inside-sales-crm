import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Search, Eye, MousePointer, Clock, User, Building, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface EmailHistoryRecord {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  body: string | null;
  sender_email: string;
  sent_at: string;
  status: string;
  open_count: number | null;
  click_count: number | null;
  opened_at: string | null;
  clicked_at: string | null;
  contact_id: string | null;
  lead_id: string | null;
  account_id: string | null;
}

const EmailHistorySettings = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedEmail, setSelectedEmail] = useState<EmailHistoryRecord | null>(null);

  useEffect(() => {
    fetchEmailHistory();
  }, [user]);

  const fetchEmailHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_history')
        .select('*')
        .eq('sent_by', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching email history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityType = (email: EmailHistoryRecord): string => {
    if (email.contact_id) return "Contact";
    if (email.lead_id) return "Lead";
    if (email.account_id) return "Account";
    return "Other";
  };

  const getEntityBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case "Contact": return "default";
      case "Lead": return "secondary";
      case "Account": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      sent: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      delivered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      opened: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      clicked: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.sent}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "contact") return matchesSearch && email.contact_id;
    if (filterType === "lead") return matchesSearch && email.lead_id;
    if (filterType === "account") return matchesSearch && email.account_id;
    return matchesSearch;
  });

  const stats = {
    total: emails.length,
    opened: emails.filter(e => (e.open_count || 0) > 0).length,
    clicked: emails.filter(e => (e.click_count || 0) > 0).length,
    openRate: emails.length > 0 ? Math.round((emails.filter(e => (e.open_count || 0) > 0).length / emails.length) * 100) : 0,
    clickRate: emails.length > 0 ? Math.round((emails.filter(e => (e.click_count || 0) > 0).length / emails.length) * 100) : 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email History</h2>
        <p className="text-muted-foreground">
          View all emails you've sent to contacts, leads, and accounts with tracking details.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Sent</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Opened</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.opened}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clicked</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.clicked}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Open Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.openRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Click Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.clickRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by recipient, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emails</SelectItem>
            <SelectItem value="contact">Contacts</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="account">Accounts</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchEmailHistory} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Email Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Emails</CardTitle>
          <CardDescription>
            {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No emails found</p>
              <p className="text-sm">Emails you send will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Opens</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => {
                    const entityType = getEntityType(email);
                    return (
                      <TableRow 
                        key={email.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEmail(email)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{email.recipient_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{email.recipient_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-[200px] truncate">{email.subject}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEntityBadgeVariant(entityType)}>
                            {entityType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(email.sent_at), "MMM d, yyyy HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(email.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={email.open_count ? "text-primary font-medium" : "text-muted-foreground"}>
                            {email.open_count || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={email.click_count ? "text-primary font-medium" : "text-muted-foreground"}>
                            {email.click_count || 0}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Details
              </CardTitle>
              <CardDescription>
                Sent on {format(new Date(selectedEmail.sent_at), "MMMM d, yyyy 'at' HH:mm")}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium">{selectedEmail.sender_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{selectedEmail.recipient_name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{selectedEmail.recipient_email}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{selectedEmail.subject}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Message</p>
              <div className="p-3 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                {selectedEmail.body || "No message content"}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Opens</p>
                <p className="text-xl font-bold text-primary">{selectedEmail.open_count || 0}</p>
                {selectedEmail.opened_at && (
                  <p className="text-xs text-muted-foreground">
                    Last: {format(new Date(selectedEmail.opened_at), "MMM d, HH:mm")}
                  </p>
                )}
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-xl font-bold text-primary">{selectedEmail.click_count || 0}</p>
                {selectedEmail.clicked_at && (
                  <p className="text-xs text-muted-foreground">
                    Last: {format(new Date(selectedEmail.clicked_at), "MMM d, HH:mm")}
                  </p>
                )}
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Entity Type</p>
                <Badge variant={getEntityBadgeVariant(getEntityType(selectedEmail))} className="mt-1">
                  {getEntityType(selectedEmail)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailHistorySettings;
