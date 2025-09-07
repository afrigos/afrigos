import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Send, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Clock,
  User,
  Store,
  Package,
  DollarSign,
  Settings,
  Archive,
  Trash2,
  Reply,
  Forward,
  Star,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock notification data
const notificationsData = {
  unread: [
    {
      id: "N001",
      type: "vendor_approval",
      title: "New Vendor Application",
      message: "Mama Asha's Kitchen has submitted a new application for approval.",
      timestamp: "2024-01-20T10:30:00Z",
      priority: "high",
      read: false,
      action: "approve",
      vendorId: "V001"
    },
    {
      id: "N002",
      type: "product_approval",
      title: "Product Review Required",
      message: "5 new products are pending review in the approval queue.",
      timestamp: "2024-01-20T09:15:00Z",
      priority: "medium",
      read: false,
      action: "review",
      count: 5
    },
    {
      id: "N003",
      type: "system_alert",
      title: "System Maintenance",
      message: "Scheduled maintenance will occur tonight at 2:00 AM GMT.",
      timestamp: "2024-01-20T08:45:00Z",
      priority: "low",
      read: false,
      action: "info"
    }
  ],
  read: [
    {
      id: "N004",
      type: "order_alert",
      title: "High-Value Order",
      message: "Order #ORD-2024-001 has been placed for £450.00",
      timestamp: "2024-01-19T16:20:00Z",
      priority: "medium",
      read: true,
      action: "view",
      orderId: "ORD-2024-001"
    },
    {
      id: "N005",
      type: "vendor_activity",
      title: "Vendor Performance",
      message: "Adunni Beauty has achieved 100 orders this month.",
      timestamp: "2024-01-19T14:30:00Z",
      priority: "low",
      read: true,
      action: "view",
      vendorId: "V002"
    }
  ]
};

const messagesData = [
  {
    id: "M001",
    from: "Mama Asha's Kitchen",
    to: "Admin",
    subject: "Product Listing Question",
    message: "Hi, I have a question about listing my new spice blend. Can you help me understand the requirements?",
    timestamp: "2024-01-20T11:00:00Z",
    read: false,
    priority: "normal",
    vendorId: "V001"
  },
  {
    id: "M002",
    from: "Adunni Beauty",
    to: "Admin",
    subject: "Commission Payment",
    message: "When can I expect my commission payment for this month? I've had good sales.",
    timestamp: "2024-01-20T10:30:00Z",
    read: true,
    priority: "high",
    vendorId: "V002"
  },
  {
    id: "M003",
    from: "Admin",
    to: "Kente Collections",
    subject: "Product Quality Issue",
    message: "We've received some complaints about product quality. Please review your quality control process.",
    timestamp: "2024-01-19T15:45:00Z",
    read: true,
    priority: "high",
    vendorId: "V003"
  }
];

const emailTemplates = [
  {
    id: "T001",
    name: "Welcome Email",
    subject: "Welcome to AfriGos Marketplace",
    content: "Dear {vendor_name},\n\nWelcome to AfriGos! We're excited to have you on board.\n\nBest regards,\nAfriGos Team"
  },
  {
    id: "T002",
    name: "Approval Notification",
    subject: "Your Application Has Been Approved",
    content: "Dear {vendor_name},\n\nCongratulations! Your application has been approved.\n\nBest regards,\nAfriGos Team"
  },
  {
    id: "T003",
    name: "Rejection Notification",
    subject: "Application Status Update",
    content: "Dear {vendor_name},\n\nWe regret to inform you that your application requires additional information.\n\nBest regards,\nAfriGos Team"
  }
];

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    message: "",
    template: ""
  });
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Marked as Read",
        description: "Notification has been marked as read.",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowComposeDialog(false);
      setComposeData({ to: "", subject: "", message: "", template: "" });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Bulk Action Completed",
        description: `${action} completed for selected items.`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to perform bulk action.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vendor_approval":
        return <Store className="h-4 w-4 text-primary" />;
      case "product_approval":
        return <Package className="h-4 w-4 text-warning" />;
      case "order_alert":
        return <DollarSign className="h-4 w-4 text-success" />;
      case "system_alert":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground text-xs">High</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground text-xs">Medium</Badge>;
      case "low":
        return <Badge className="bg-success text-success-foreground text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Normal</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const filteredNotifications = [...notificationsData.unread, ...notificationsData.read].filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification Center</h1>
          <p className="text-muted-foreground">Manage notifications, messages, and communications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowComposeDialog(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTemplateDialog(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Templates
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Notifications</p>
                <p className="text-2xl font-bold text-primary">{notificationsData.unread.length}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-warning">{messagesData.filter(m => !m.read).length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-destructive">
                  {filteredNotifications.filter(n => n.priority === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Today</p>
                <p className="text-2xl font-bold text-success">
                  {filteredNotifications.filter(n => 
                    new Date(n.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vendor_approval">Vendor Approval</SelectItem>
                    <SelectItem value="product_approval">Product Approval</SelectItem>
                    <SelectItem value="order_alert">Order Alert</SelectItem>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction("mark_all_read")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setSelectedNotification(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {getPriorityBadge(notification.priority)}
                          {!notification.read && (
                            <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Messages</CardTitle>
              <CardDescription>Communicate with vendors directly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messagesData.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                      !message.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{message.subject}</h4>
                          {getPriorityBadge(message.priority)}
                          {!message.read && (
                            <Badge className="bg-primary text-primary-foreground text-xs">Unread</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">From: {message.from}</p>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{message.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(message.timestamp)}
                          </span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {message.from}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Forward className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage email templates for vendor communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">Subject: {template.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a message to vendors or customers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To</label>
              <Input
                placeholder="Enter recipient email or vendor name"
                value={composeData.to}
                onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter message subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter your message..."
                value={composeData.message}
                onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                className="min-h-[150px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {formatTimestamp(selectedNotification?.timestamp || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selectedNotification?.message}</p>
            <div className="flex items-center justify-between">
              {getPriorityBadge(selectedNotification?.priority || "normal")}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.from} • {formatTimestamp(selectedMessage?.timestamp || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{selectedMessage?.message}</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline" size="sm">
                <Forward className="h-4 w-4 mr-2" />
                Forward
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

