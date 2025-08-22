import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock,
  Activity,
  Globe,
  CreditCard,
  Users
} from "lucide-react";

const securityAlerts = [
  {
    id: "SA001",
    type: "fraud",
    severity: "high",
    title: "Suspicious Transaction Pattern",
    description: "Multiple high-value orders from same IP address within 1 hour",
    timestamp: "2024-01-17 15:30",
    status: "investigating",
    affectedUser: "user@example.com",
    location: "London, UK"
  },
  {
    id: "SA002", 
    type: "authentication",
    severity: "medium",
    title: "Multiple Failed Login Attempts",
    description: "15 failed login attempts for vendor account in 10 minutes",
    timestamp: "2024-01-17 12:15",
    status: "resolved",
    affectedUser: "vendor@marketplace.com",
    location: "Manchester, UK"
  },
  {
    id: "SA003",
    type: "payment",
    severity: "high", 
    title: "Unusual Payment Activity",
    description: "SWIFT wire transfer rejected - potential money laundering",
    timestamp: "2024-01-17 09:45",
    status: "under-review",
    affectedUser: "suspicious@email.com",
    location: "Unknown"
  }
];

const securityMetrics = [
  {
    title: "Active Sessions",
    value: "2,847",
    change: "+5.2%",
    icon: Activity,
    color: "text-primary"
  },
  {
    title: "Blocked Attempts",
    value: "127",
    change: "-12%",
    icon: Shield,
    color: "text-success"
  },
  {
    title: "Fraud Flags",
    value: "8",
    change: "+3",
    icon: AlertTriangle,
    color: "text-destructive"
  },
  {
    title: "Security Score",
    value: "94%",
    change: "+2%",
    icon: Lock,
    color: "text-primary"
  }
];

export function SecurityMonitoring() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "low":
        return <Badge variant="outline">Low Risk</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating":
        return <Badge className="bg-warning text-warning-foreground">Investigating</Badge>;
      case "resolved":
        return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
      case "under-review":
        return <Badge className="bg-primary text-primary-foreground">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Monitoring</h1>
          <p className="text-muted-foreground">Monitor platform security and fraud prevention</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Security Report</Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-dashboard-accent">
            Run Security Scan
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <Alert className="border-destructive bg-destructive/10">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          <strong>2 High Priority Security Alerts</strong> require immediate attention. 
          Review suspicious transaction patterns and unusual payment activities.
        </AlertDescription>
      </Alert>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric) => (
          <Card key={metric.title} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') && !metric.change.includes('Flags') ? 'text-success' :
                  metric.change.startsWith('-') ? 'text-success' : 'text-warning'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-muted-foreground">from last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Alerts */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Security Alerts</span>
          </CardTitle>
          <CardDescription>Recent security incidents and threats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-foreground">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Alert ID:</span>
                        <p>{alert.id}</p>
                      </div>
                      <div>
                        <span className="font-medium">Affected User:</span>
                        <p>{alert.affectedUser}</p>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>
                        <p>{alert.location}</p>
                      </div>
                      <div>
                        <span className="font-medium">Timestamp:</span>
                        <p>{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">Investigate</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Payment Security</span>
            </CardTitle>
            <CardDescription>SWIFT wire and payment monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">SWIFT Wire Monitoring</p>
                  <p className="text-sm text-muted-foreground">Real-time transaction screening</p>
                </div>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">AML Compliance</p>
                  <p className="text-sm text-muted-foreground">Anti-money laundering checks</p>
                </div>
                <Badge className="bg-success text-success-foreground">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Fraud Detection</p>
                  <p className="text-sm text-muted-foreground">AI-powered risk assessment</p>
                </div>
                <Badge className="bg-success text-success-foreground">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>GDPR Compliance</span>
            </CardTitle>
            <CardDescription>Data protection and privacy monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Data Encryption</p>
                  <p className="text-sm text-muted-foreground">SSL/TLS end-to-end encryption</p>
                </div>
                <Badge className="bg-success text-success-foreground">Secured</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Audit Logs</p>
                  <p className="text-sm text-muted-foreground">Complete transaction logging</p>
                </div>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Data Rights</p>
                  <p className="text-sm text-muted-foreground">User consent & deletion requests</p>
                </div>
                <Badge className="bg-success text-success-foreground">Compliant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}