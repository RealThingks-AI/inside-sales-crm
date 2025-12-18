import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Briefcase, TrendingUp, Clock, CheckCircle2, ArrowRight, Plus, Building2, Calendar, ListTodo } from "lucide-react";

const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data?.full_name || null;
    },
    enabled: !!userId
  });
};

const useUserRole = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-role-dashboard', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data?.role || 'user';
    },
    enabled: !!userId
  });
};

const usePagePermissions = () => {
  return useQuery({
    queryKey: ['page-permissions-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_permissions')
        .select('route, admin_access, manager_access, user_access');
      if (error) throw error;
      return data || [];
    }
  });
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userName } = useUserProfile(user?.id);
  const { data: userRole } = useUserRole(user?.id);
  const { data: pagePermissions } = usePagePermissions();

  // Check if user has access to a specific route
  const hasAccess = (route: string) => {
    if (!pagePermissions || !userRole) return true;
    const permission = pagePermissions.find(p => p.route === route);
    if (!permission) return true;
    switch (userRole) {
      case 'admin': return permission.admin_access;
      case 'manager': return permission.manager_access;
      default: return permission.user_access;
    }
  };

  const canAccessDeals = hasAccess('/deals');
  const canAccessLeads = hasAccess('/leads');
  const canAccessContacts = hasAccess('/contacts');
  const canAccessAccounts = hasAccess('/accounts');
  const canAccessMeetings = hasAccess('/meetings');
  const canAccessTasks = hasAccess('/tasks');

  // Fetch user's leads count
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['user-leads-count', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('id, lead_status').eq('created_by', user?.id);
      if (error) throw error;
      return {
        total: data?.length || 0,
        new: data?.filter(l => l.lead_status === 'New').length || 0,
        contacted: data?.filter(l => l.lead_status === 'Contacted').length || 0,
        qualified: data?.filter(l => l.lead_status === 'Qualified').length || 0
      };
    },
    enabled: !!user?.id && canAccessLeads
  });

  // Fetch user's contacts count
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['user-contacts-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('created_by', user?.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id && canAccessContacts
  });

  // Fetch user's accounts count
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['user-accounts-count', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('accounts').select('id, status').eq('created_by', user?.id);
      if (error) throw error;
      return {
        total: data?.length || 0,
        active: data?.filter(a => a.status === 'Active').length || 0
      };
    },
    enabled: !!user?.id && canAccessAccounts
  });

  // Fetch user's meetings count
  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ['user-meetings-count', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase.from('meetings').select('id, status, start_time').eq('created_by', user?.id);
      if (error) throw error;
      return {
        total: data?.length || 0,
        upcoming: data?.filter(m => m.start_time > today && m.status === 'Scheduled').length || 0,
        completed: data?.filter(m => m.status === 'Completed').length || 0
      };
    },
    enabled: !!user?.id && canAccessMeetings
  });

  // Fetch user's tasks count
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['user-tasks-count', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('id, status, due_date').or(`created_by.eq.${user?.id},assigned_to.eq.${user?.id}`);
      if (error) throw error;
      const today = new Date().toISOString().split('T')[0];
      return {
        total: data?.length || 0,
        open: data?.filter(t => t.status === 'open').length || 0,
        overdue: data?.filter(t => t.due_date && t.due_date < today && t.status !== 'completed').length || 0,
        completed: data?.filter(t => t.status === 'completed').length || 0
      };
    },
    enabled: !!user?.id && canAccessTasks
  });

  // Fetch user's deals count and value (only if has access)
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['user-deals-count', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('deals').select('id, stage, total_contract_value').eq('created_by', user?.id);
      if (error) throw error;
      const totalValue = data?.reduce((sum, d) => sum + (d.total_contract_value || 0), 0) || 0;
      const wonDeals = data?.filter(d => d.stage === 'Won') || [];
      const wonValue = wonDeals.reduce((sum, d) => sum + (d.total_contract_value || 0), 0);
      return {
        total: data?.length || 0,
        won: wonDeals.length,
        totalValue,
        wonValue,
        active: data?.filter(d => !['Won', 'Lost', 'Dropped'].includes(d.stage)).length || 0
      };
    },
    enabled: !!user?.id && canAccessDeals
  });

  // Fetch user's pending action items
  const { data: actionItemsData, isLoading: actionItemsLoading } = useQuery({
    queryKey: ['user-action-items', user?.id],
    queryFn: async () => {
      const { data: leadItems, error: leadError } = await supabase.from('lead_action_items').select('id, status, due_date').eq('assigned_to', user?.id).eq('status', 'Open');
      if (leadError) throw leadError;

      let dealItems: any[] = [];
      if (canAccessDeals) {
        const { data, error } = await supabase.from('deal_action_items').select('id, status, due_date').eq('assigned_to', user?.id).eq('status', 'Open');
        if (!error) dealItems = data || [];
      }

      const allItems = [...(dealItems || []), ...(leadItems || [])];
      const overdue = allItems.filter(item => item.due_date && new Date(item.due_date) < new Date()).length;
      return { total: allItems.length, overdue };
    },
    enabled: !!user?.id
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isLoading = leadsLoading || contactsLoading || accountsLoading || meetingsLoading || tasksLoading || (canAccessDeals && dealsLoading) || actionItemsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  // Build quick actions based on access
  const quickActions = [];
  if (canAccessLeads) {
    quickActions.push({ label: 'Add New Lead', icon: Plus, route: '/leads' });
  }
  if (canAccessContacts) {
    quickActions.push({ label: 'Add New Contact', icon: Plus, route: '/contacts' });
  }
  if (canAccessAccounts) {
    quickActions.push({ label: 'Add New Account', icon: Plus, route: '/accounts' });
  }
  if (canAccessMeetings) {
    quickActions.push({ label: 'Schedule Meeting', icon: Plus, route: '/meetings' });
  }
  if (canAccessTasks) {
    quickActions.push({ label: 'Create Task', icon: Plus, route: '/tasks' });
  }
  if (canAccessDeals) {
    quickActions.push({ label: 'Create New Deal', icon: Plus, route: '/deals' });
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {canAccessLeads && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/leads')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Leads</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsData?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {leadsData?.new || 0} new, {leadsData?.qualified || 0} qualified
              </p>
            </CardContent>
          </Card>
        )}

        {canAccessContacts && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/contacts')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Contacts</CardTitle>
              <Users className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contactsData || 0}</div>
              <p className="text-xs text-muted-foreground">Total contacts created</p>
            </CardContent>
          </Card>
        )}

        {canAccessAccounts && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/accounts')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Accounts</CardTitle>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountsData?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {accountsData?.active || 0} active
              </p>
            </CardContent>
          </Card>
        )}

        {canAccessMeetings && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/meetings')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Meetings</CardTitle>
              <Calendar className="w-4 h-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetingsData?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {meetingsData?.upcoming || 0} upcoming
              </p>
            </CardContent>
          </Card>
        )}

        {canAccessTasks && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/tasks')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <ListTodo className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksData?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {tasksData?.open || 0} open, {tasksData?.overdue || 0} overdue
              </p>
            </CardContent>
          </Card>
        )}

        {canAccessDeals && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/deals')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Deals</CardTitle>
              <Briefcase className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealsData?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dealsData?.active || 0} active, {dealsData?.won || 0} won
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionItemsData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {actionItemsData?.overdue || 0} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Only show Performance section if user has access to deals */}
        {canAccessDeals ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                My Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                  <p className="text-xl font-bold">{formatCurrency(dealsData?.totalValue || 0)}</p>
                </div>
                <Briefcase className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Won Revenue</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(dealsData?.wonValue || 0)}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600/50" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canAccessTasks && (
                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Tasks</p>
                    <p className="text-xl font-bold text-amber-600">{tasksData?.completed || 0}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-amber-600/50" />
                </div>
              )}
              {canAccessMeetings && (
                <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Meetings Completed</p>
                    <p className="text-xl font-bold text-teal-600">{meetingsData?.completed || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-teal-600/50" />
                </div>
              )}
              {canAccessLeads && (
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Qualified Leads</p>
                    <p className="text-xl font-bold text-blue-600">{leadsData?.qualified || 0}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600/50" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.slice(0, 4).map((action) => (
              <Button
                key={action.route}
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate(action.route)}
              >
                <span className="flex items-center gap-2">
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lead Status Breakdown - Only show if has access to leads */}
      {canAccessLeads && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{leadsData?.new || 0}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{leadsData?.contacted || 0}</p>
                <p className="text-sm text-muted-foreground">Contacted</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{leadsData?.qualified || 0}</p>
                <p className="text-sm text-muted-foreground">Qualified</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{leadsData?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Overview - Only show if has access to tasks and not deals */}
      {canAccessTasks && !canAccessDeals && (
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{tasksData?.open || 0}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{tasksData?.overdue || 0}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{tasksData?.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{tasksData?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;