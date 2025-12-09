import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, FileText, Lock, Database, Mail } from "lucide-react";
import UserManagement from "@/components/UserManagement";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AuditLogsSettings from "@/components/settings/AuditLogsSettings";
import PageAccessSettings from "@/components/settings/PageAccessSettings";
import BackupRestoreSettings from "@/components/settings/BackupRestoreSettings";
import EmailTemplatesSettings from "@/components/settings/EmailTemplatesSettings";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("user-management");
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-background">
        <div className="px-6 h-16 flex items-center border-b w-full">
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 gap-1">
            <TabsTrigger value="user-management" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="page-access" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Page Access</span>
            </TabsTrigger>
            <TabsTrigger value="email-templates" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email Templates</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user-management" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="page-access" className="mt-6">
            <PageAccessSettings />
          </TabsContent>

          <TabsContent value="email-templates" className="mt-6">
            <EmailTemplatesSettings />
          </TabsContent>

          <TabsContent value="backup" className="mt-6">
            <BackupRestoreSettings />
          </TabsContent>

          <TabsContent value="audit-logs" className="mt-6">
            <AuditLogsSettings />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
