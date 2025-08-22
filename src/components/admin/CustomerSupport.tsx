import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone
} from "lucide-react";

const supportTickets = [
  {
    id: "T001",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    subject: "Order delivery delay",
    priority: "high",
    status: "open",
    category: "Delivery",
    created: "2024-01-17 14:30",
    lastUpdate: "2024-01-17 16:45",
    assignedTo: "Support Agent 1",
    description: "My order #ORD-2024-001 was supposed to arrive yesterday but hasn't been delivered yet."
  },
  {
    id: "T002", 
    customer: "Michael Brown",
    email: "m.brown@email.com",
    subject: "Product quality issue",
    priority: "medium",
    status: "in-progress",
    category: "Quality",
    created: "2024-01-16 09:15",
    lastUpdate: "2024-01-17 11:20",
    assignedTo: "Support Agent 2",
    description: "The herbal tea I received doesn't match the description on the website."
  },
  {
    id: "T003",
    customer: "Emma Wilson",
    email: "emma.wilson@email.com", 
    subject: "Refund request",
    priority: "medium",
    status: "resolved",
    category: "Refund",
    created: "2024-01-15 16:45",
    lastUpdate: "2024-01-16 14:30",
    assignedTo: "Support Agent 3",
    description: "Requesting refund for damaged beauty products received in order #ORD-2024-045."
  },
  {
    id: "T004",
    customer: "James Davis",
    email: "j.davis@email.com",
    subject: "Account access issue",
    priority: "low",
    status: "open",
    category: "Account",
    created: "2024-01-17 08:20",
    lastUpdate: "2024-01-17 08:20",
    assignedTo: "Unassigned",
    description: "Cannot log into my account, password reset not working."
  }
];

export function CustomerSupport() {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground">High</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-primary text-primary-foreground">Open</Badge>;
      case "in-progress":
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Support</h1>
          <p className="text-muted-foreground">Manage customer inquiries and support tickets</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Export Tickets</Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-dashboard-accent">
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">2.4h</p>
              </div>
              <AlertCircle className="h-8 w-8 text-dashboard-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by customer, subject, or ticket ID..."
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Priority
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="all">All ({supportTickets.length})</TabsTrigger>
          <TabsTrigger value="open">Open (2)</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress (1)</TabsTrigger>
          <TabsTrigger value="resolved">Resolved (1)</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority (1)</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {supportTickets.map((ticket) => (
              <Card key={ticket.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {ticket.customer}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {ticket.email}
                        </span>
                        <span>Ticket #{ticket.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {ticket.created}</span>
                        <span>Last Update: {ticket.lastUpdate}</span>
                        <span>Assigned to: {ticket.assignedTo}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">View</Button>
                      <Button size="sm">Respond</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="open">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Open Tickets</span>
              </CardTitle>
              <CardDescription>Tickets requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">2 Open Tickets</h3>
                <p className="text-muted-foreground mb-4">
                  These tickets need immediate attention from support agents
                </p>
                <Button className="bg-gradient-to-r from-primary to-dashboard-accent">
                  Assign Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}