import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Globe,
  CreditCard,
  Mail,
  Smartphone
} from "lucide-react";

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Reset to Defaults</Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-dashboard-accent">
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-card">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Platform Configuration</span>
                </CardTitle>
                <CardDescription>Basic platform settings and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="Afri-Connect UK" />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" defaultValue="admin@afri-connect.uk" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="platform-description">Platform Description</Label>
                  <Input 
                    id="platform-description" 
                    defaultValue="Authentic African marketplace connecting UK consumers with African vendors"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="maintenance-mode" />
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="new-registrations" defaultChecked />
                  <Label htmlFor="new-registrations">Allow New Vendor Registrations</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>Configure user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Admin Roles</h4>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">Super Admin</h5>
                      <p className="text-sm text-muted-foreground">Full platform access</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Can access all features, modify settings, and manage other admins</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">Operations Manager</h5>
                      <p className="text-sm text-muted-foreground">Vendor and product management</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Can manage vendors, products, and view analytics</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">Support Agent</h5>
                      <p className="text-sm text-muted-foreground">Customer support access</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Can handle customer support tickets and basic user management</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">Content Moderator</h5>
                      <p className="text-sm text-muted-foreground">Content review and moderation</p>
                    </div>
                    <Switch />
                  </div>
                  <p className="text-xs text-muted-foreground">Can review and moderate product listings and user content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>Configure admin alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Email Alerts</p>
                      <p className="text-sm text-muted-foreground">High priority security alerts via email</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Critical system alerts via SMS</p>
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">In-App Notifications</p>
                      <p className="text-sm text-muted-foreground">Real-time dashboard notifications</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Vendor Application Alerts</p>
                      <p className="text-sm text-muted-foreground">New vendor registration notifications</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Security Configuration</span>
              </CardTitle>
              <CardDescription>Platform security and compliance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Required for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">IP Whitelist</p>
                    <p className="text-sm text-muted-foreground">Restrict admin access by IP address</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                    <Input id="session-duration" type="number" defaultValue="60" />
                  </div>
                  <div>
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input id="max-login-attempts" type="number" defaultValue="5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Payment Configuration</span>
              </CardTitle>
              <CardDescription>Payment processing and SWIFT wire settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripe-key">Stripe API Key</Label>
                  <Input id="stripe-key" type="password" placeholder="sk_test_..." />
                </div>
                
                <div>
                  <Label htmlFor="paypal-client">PayPal Client ID</Label>
                  <Input id="paypal-client" placeholder="Your PayPal client ID" />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">SWIFT Wire Monitoring</p>
                    <p className="text-sm text-muted-foreground">Monitor large transactions for compliance</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commission-rate">Platform Commission (%)</Label>
                    <Input id="commission-rate" type="number" defaultValue="5" />
                  </div>
                  <div>
                    <Label htmlFor="min-payout">Minimum Payout (£)</Label>
                    <Input id="min-payout" type="number" defaultValue="50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>Third-Party Integrations</span>
              </CardTitle>
              <CardDescription>External service configurations and API settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">Google Analytics</h5>
                      <p className="text-sm text-muted-foreground">Website analytics and tracking</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Input placeholder="Google Analytics Tracking ID" />
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">SendGrid Email</h5>
                      <p className="text-sm text-muted-foreground">Transactional email service</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Input placeholder="SendGrid API Key" type="password" />
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-foreground">Twilio SMS</h5>
                      <p className="text-sm text-muted-foreground">SMS notifications and alerts</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input placeholder="Account SID" />
                    <Input placeholder="Auth Token" type="password" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}