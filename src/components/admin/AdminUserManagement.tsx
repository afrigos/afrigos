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
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Shield, 
  Activity,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Settings,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  Crown,
  UserCog
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

// Mock admin user data
const adminUsersData = [
  {
    id: "ADM001",
    name: "John Smith",
    email: "john.smith@afrigos.com",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-01-20T10:30:00Z",
    permissions: ["all"],
    department: "Management",
    phone: "+44 7911 123456",
    location: "London, UK",
    createdAt: "2023-01-15T09:00:00Z",
    lastActivity: "2024-01-20T10:30:00Z"
  },
  {
    id: "ADM002",
    name: "Sarah Johnson",
    email: "sarah.johnson@afrigos.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-20T09:15:00Z",
    permissions: ["vendors", "products", "orders", "analytics"],
    department: "Operations",
    phone: "+44 7911 234567",
    location: "Manchester, UK",
    createdAt: "2023-03-20T14:30:00Z",
    lastActivity: "2024-01-20T09:15:00Z"
  },
  {
    id: "ADM003",
    name: "Michael Brown",
    email: "michael.brown@afrigos.com",
    role: "moderator",
    status: "active",
    lastLogin: "2024-01-19T16:45:00Z",
    permissions: ["products", "orders"],
    department: "Support",
    phone: "+44 7911 345678",
    location: "Birmingham, UK",
    createdAt: "2023-06-10T11:20:00Z",
    lastActivity: "2024-01-19T16:45:00Z"
  },
  {
    id: "ADM004",
    name: "Emma Wilson",
    email: "emma.wilson@afrigos.com",
    role: "support",
    status: "inactive",
    lastLogin: "2024-01-15T12:00:00Z",
    permissions: ["orders", "customers"],
    department: "Customer Service",
    phone: "+44 7911 456789",
    location: "Liverpool, UK",
    createdAt: "2023-08-05T10:15:00Z",
    lastActivity: "2024-01-15T12:00:00Z"
  }
];

const activityLogs = [
  {
    id: "LOG001",
    userId: "ADM001",
    userName: "John Smith",
    action: "vendor_approved",
    description: "Approved vendor application for Mama Asha's Kitchen",
    timestamp: "2024-01-20T10:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0"
  },
  {
    id: "LOG002",
    userId: "ADM002",
    userName: "Sarah Johnson",
    action: "product_rejected",
    description: "Rejected product listing for quality issues",
    timestamp: "2024-01-20T09:15:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Firefox/121.0.0.0"
  },
  {
    id: "LOG003",
    userId: "ADM001",
    userName: "John Smith",
    action: "user_created",
    description: "Created new admin user: Emma Wilson",
    timestamp: "2024-01-19T16:45:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0.0.0"
  }
];

const roles = [
  { id: "super_admin", name: "Super Admin", permissions: ["all"], color: "bg-red-500" },
  { id: "admin", name: "Admin", permissions: ["vendors", "products", "orders", "analytics"], color: "bg-blue-500" },
  { id: "moderator", name: "Moderator", permissions: ["products", "orders"], color: "bg-green-500" },
  { id: "support", name: "Support", permissions: ["orders", "customers"], color: "bg-yellow-500" }
];

export function AdminUserManagement() {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (userData: any) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowCreateDialog(false);
      toast({
        title: "User Created",
        description: "Admin user has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create admin user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowEditDialog(false);
      toast({
        title: "User Updated",
        description: "Admin user has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update admin user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "User Deleted",
        description: "Admin user has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete admin user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: "Status Updated",
        description: `User status has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Password Reset",
        description: "Password reset email has been sent to the user.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleData = roles.find(r => r.id === role);
    if (!roleData) return <Badge variant="outline">{role}</Badge>;
    
    return (
      <Badge className={`${roleData.color} text-white`}>
        {roleData.name}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const filteredUsers = adminUsersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin User Management</h1>
          <p className="text-muted-foreground">Manage admin users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin User
          </Button>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Admins</p>
                <p className="text-2xl font-bold">{adminUsersData.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{adminUsersData.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold">{adminUsersData.filter(u => u.role === 'super_admin').length}</p>
              </div>
              <Crown className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold">{activityLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Admin Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-2">
            {currentUsers.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">ID: {user.id} • {user.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last login: {formatTimestamp(user.lastLogin)}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={isLoading}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        {user.status === "active" ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, "inactive")}
                            disabled={isLoading}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, "active")}
                            disabled={isLoading}
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Manage user roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                        <h4 className="font-medium">{role.name}</h4>
                        <Badge className={role.color.replace('bg-', 'bg-') + ' text-white'}>
                          {role.permissions.length} permissions
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Track all admin user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{log.userName}</h4>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <span>IP: {log.ipAddress}</span>
                            <span>Browser: {log.userAgent.split('/')[0]}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
            <DialogDescription>Add a new admin user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="Enter email address" type="email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input placeholder="Enter department" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="Enter phone number" />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="Enter location" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateUser({})} disabled={isLoading}>
                <UserPlus className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser && !showEditDialog} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} • {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{selectedUser.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-sm">{selectedUser.location}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Permissions</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedUser.permissions.map((permission: string) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatTimestamp(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                  <p className="text-sm">{formatTimestamp(selectedUser.lastActivity)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

