import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  GripVertical, FileText, Users, Briefcase, Clock, TrendingUp, Zap, BarChart3, Calendar, Activity, Bell, 
  Target, PieChart, LineChart, DollarSign, Mail, MessageSquare, CheckCircle, AlertTriangle, 
  Globe, Building2, Star, Trophy, Gauge, ListTodo, PhoneCall, MapPin, Percent, ArrowUpRight, Filter
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export type WidgetKey = 
  | "leads" | "contacts" | "deals" | "actionItems" | "performance" | "quickActions" 
  | "leadStatus" | "upcomingMeetings" | "recentActivities" | "taskReminders"
  | "salesTarget" | "revenueChart" | "pipelineValue" | "conversionRate" | "emailStats"
  | "teamActivity" | "completedTasks" | "overdueItems" | "topDeals" | "regionStats"
  | "accountHealth" | "customerRetention" | "winLossRatio" | "salesVelocity" | "taskProgress"
  | "callLog" | "geoDistribution" | "dealForecast" | "growthTrend" | "leadSources";

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetLayoutConfig {
  [key: string]: WidgetLayout;
}

export interface DashboardWidget {
  key: WidgetKey;
  label: string;
  icon: React.ReactNode;
  visible: boolean;
  defaultLayout: WidgetLayout;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  // Core stat widgets - 4 across the top row (3 cols each = 12 total)
  { key: "leads", label: "My Leads", icon: <FileText className="w-4 h-4" />, visible: true, defaultLayout: { x: 0, y: 0, w: 3, h: 2 } },
  { key: "contacts", label: "My Contacts", icon: <Users className="w-4 h-4" />, visible: true, defaultLayout: { x: 3, y: 0, w: 3, h: 2 } },
  { key: "deals", label: "My Deals", icon: <Briefcase className="w-4 h-4" />, visible: true, defaultLayout: { x: 6, y: 0, w: 3, h: 2 } },
  { key: "actionItems", label: "Action Items", icon: <Clock className="w-4 h-4" />, visible: true, defaultLayout: { x: 9, y: 0, w: 3, h: 2 } },
  // Second row - Quick Actions + Meetings + Task Reminders
  { key: "quickActions", label: "Quick Actions", icon: <Zap className="w-4 h-4" />, visible: true, defaultLayout: { x: 0, y: 2, w: 4, h: 3 } },
  { key: "upcomingMeetings", label: "Upcoming Meetings", icon: <Calendar className="w-4 h-4" />, visible: true, defaultLayout: { x: 4, y: 2, w: 4, h: 3 } },
  { key: "taskReminders", label: "Task Reminders", icon: <Bell className="w-4 h-4" />, visible: true, defaultLayout: { x: 8, y: 2, w: 4, h: 3 } },
  // Third row - Recent Activities + Performance + Lead Status
  { key: "recentActivities", label: "Recent Activities", icon: <Activity className="w-4 h-4" />, visible: true, defaultLayout: { x: 0, y: 5, w: 4, h: 3 } },
  { key: "performance", label: "My Performance", icon: <TrendingUp className="w-4 h-4" />, visible: true, defaultLayout: { x: 4, y: 5, w: 4, h: 3 } },
  { key: "leadStatus", label: "Lead Status Overview", icon: <BarChart3 className="w-4 h-4" />, visible: true, defaultLayout: { x: 8, y: 5, w: 4, h: 3 } },
  // Sales & Revenue widgets
  { key: "salesTarget", label: "Sales Target", icon: <Target className="w-4 h-4" />, visible: false, defaultLayout: { x: 0, y: 8, w: 3, h: 2 } },
  { key: "revenueChart", label: "Revenue Chart", icon: <LineChart className="w-4 h-4" />, visible: false, defaultLayout: { x: 3, y: 8, w: 6, h: 3 } },
  { key: "pipelineValue", label: "Pipeline Value", icon: <DollarSign className="w-4 h-4" />, visible: false, defaultLayout: { x: 9, y: 8, w: 3, h: 2 } },
  { key: "conversionRate", label: "Conversion Rate", icon: <Percent className="w-4 h-4" />, visible: false, defaultLayout: { x: 0, y: 10, w: 3, h: 2 } },
  { key: "dealForecast", label: "Deal Forecast", icon: <ArrowUpRight className="w-4 h-4" />, visible: false, defaultLayout: { x: 3, y: 11, w: 6, h: 3 } },
  // Communication widgets
  { key: "emailStats", label: "Email Statistics", icon: <Mail className="w-4 h-4" />, visible: false, defaultLayout: { x: 9, y: 10, w: 3, h: 3 } },
  { key: "callLog", label: "Call Log", icon: <PhoneCall className="w-4 h-4" />, visible: false, defaultLayout: { x: 0, y: 12, w: 3, h: 3 } },
  // Team & Activity widgets
  { key: "teamActivity", label: "Team Activity", icon: <MessageSquare className="w-4 h-4" />, visible: false, defaultLayout: { x: 3, y: 14, w: 4, h: 3 } },
  { key: "completedTasks", label: "Completed Tasks", icon: <CheckCircle className="w-4 h-4" />, visible: false, defaultLayout: { x: 7, y: 14, w: 3, h: 2 } },
  { key: "overdueItems", label: "Overdue Items", icon: <AlertTriangle className="w-4 h-4" />, visible: false, defaultLayout: { x: 10, y: 13, w: 3, h: 2 } },
  { key: "taskProgress", label: "Task Progress", icon: <ListTodo className="w-4 h-4" />, visible: false, defaultLayout: { x: 0, y: 15, w: 3, h: 3 } },
  // Analytics widgets
  { key: "topDeals", label: "Top Deals", icon: <Trophy className="w-4 h-4" />, visible: false, defaultLayout: { x: 3, y: 17, w: 4, h: 3 } },
  { key: "regionStats", label: "Region Statistics", icon: <Globe className="w-4 h-4" />, visible: false, defaultLayout: { x: 7, y: 16, w: 5, h: 3 } },
  { key: "geoDistribution", label: "Geo Distribution", icon: <MapPin className="w-4 h-4" />, visible: false, defaultLayout: { x: 0, y: 18, w: 6, h: 3 } },
  { key: "leadSources", label: "Lead Sources", icon: <Filter className="w-4 h-4" />, visible: false, defaultLayout: { x: 6, y: 19, w: 4, h: 3 } },
  // Account & Customer widgets
  { key: "accountHealth", label: "Account Health", icon: <Building2 className="w-4 h-4" />, visible: false, defaultLayout: { x: 10, y: 19, w: 3, h: 3 } },
  { key: "customerRetention", label: "Customer Retention", icon: <Star className="w-4 h-4" />, visible: false, defaultLayout: { x: 0, y: 21, w: 3, h: 2 } },
  // Performance widgets
  { key: "winLossRatio", label: "Win/Loss Ratio", icon: <PieChart className="w-4 h-4" />, visible: false, defaultLayout: { x: 3, y: 22, w: 3, h: 2 } },
  { key: "salesVelocity", label: "Sales Velocity", icon: <Gauge className="w-4 h-4" />, visible: false, defaultLayout: { x: 6, y: 22, w: 3, h: 2 } },
  { key: "growthTrend", label: "Growth Trend", icon: <TrendingUp className="w-4 h-4" />, visible: false, defaultLayout: { x: 9, y: 22, w: 3, h: 3 } },
];

interface DashboardCustomizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleWidgets: WidgetKey[];
  widgetOrder: WidgetKey[];
  onSave: (visibleWidgets: WidgetKey[], widgetOrder: WidgetKey[]) => void;
  isSaving?: boolean;
}

export const DashboardCustomizeModal = ({
  open,
  onOpenChange,
  visibleWidgets,
  widgetOrder,
  onSave,
  isSaving = false,
}: DashboardCustomizeModalProps) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    // Initialize widgets state based on current order and visibility
    const orderedWidgets: DashboardWidget[] = [];
    
    // First add widgets in the saved order
    widgetOrder.forEach(key => {
      const defaultWidget = DEFAULT_WIDGETS.find(w => w.key === key);
      if (defaultWidget) {
        orderedWidgets.push({
          ...defaultWidget,
          visible: visibleWidgets.includes(key),
        });
      }
    });
    
    // Add any missing widgets at the end
    DEFAULT_WIDGETS.forEach(w => {
      if (!orderedWidgets.find(ow => ow.key === w.key)) {
        orderedWidgets.push({
          ...w,
          visible: visibleWidgets.includes(w.key),
        });
      }
    });
    
    setWidgets(orderedWidgets);
  }, [visibleWidgets, widgetOrder, open]);

  const toggleWidget = (key: WidgetKey) => {
    setWidgets(prev =>
      prev.map(w => (w.key === key ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };

  const handleSave = () => {
    const visible = widgets.filter(w => w.visible).map(w => w.key);
    const order = widgets.map(w => w.key);
    onSave(visible, order);
  };

  const handleReset = () => {
    setWidgets(DEFAULT_WIDGETS.map(w => ({ ...w, visible: true })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Drag to reorder and toggle widget visibility. Use the <strong>Resize</strong> button on the dashboard to freely resize widgets.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.key} draggableId={widget.key} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-3 rounded-lg border bg-card transition-colors ${
                            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : "hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className={widget.visible ? "text-foreground" : "text-muted-foreground"}>
                              {widget.icon}
                            </div>
                            <Label 
                              htmlFor={widget.key} 
                              className={`cursor-pointer font-medium ${!widget.visible && "text-muted-foreground"}`}
                            >
                              {widget.label}
                            </Label>
                          </div>
                          <Switch
                            id={widget.key}
                            checked={widget.visible}
                            onCheckedChange={() => toggleWidget(widget.key)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="sm:mr-auto">
            Reset to Default
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DEFAULT_WIDGETS };
