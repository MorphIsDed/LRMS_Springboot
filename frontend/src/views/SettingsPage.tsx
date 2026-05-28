import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../hooks/useAuth";
import { useToastStore } from "../stores/toastStore";
import { useThemeStore } from "../stores/themeStore";
import { User, Bell, Palette, Shield, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function SettingsPage() {
  const { role } = useAuth() as any;
  const toast = useToastStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const displayRole = role ? role.charAt(0) + role.slice(1).toLowerCase() : "Staff";

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.push({ type: "success", message: "Settings saved successfully." });
    }, 800);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
  ];

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-5xl h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground scale-[0.98]"}`}
            >
              <div className={`${activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <Card className="p-8 bg-card border-border shadow-lg shadow-black/5 rounded-3xl h-full">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground tracking-tight">Profile Information</h3>
                  <p className="text-muted-foreground text-sm mt-1">Update your account details and public profile.</p>
                </div>
                
                <div className="h-px w-full bg-border" />
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="admin" className="bg-background/50 h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="admin@lrms.com" className="bg-background/50 h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Account Role</Label>
                    <Input id="role" value={displayRole} disabled className="bg-muted text-muted-foreground h-11 rounded-xl" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="h-11 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground tracking-tight">Appearance</h3>
                  <p className="text-muted-foreground text-sm mt-1">Customize how LRMS looks on your device.</p>
                </div>
                
                <div className="h-px w-full bg-border" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-background/50">
                    <div>
                      <p className="font-medium text-foreground">Theme Mode</p>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                    <Button variant="outline" onClick={toggleTheme} className="rounded-xl h-10 px-4 flex items-center gap-2">
                      {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {(activeTab === "notifications" || activeTab === "security") && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground tracking-tight capitalize">{activeTab}</h3>
                  <p className="text-muted-foreground text-sm mt-1">Manage your {activeTab} preferences.</p>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
                    {activeTab === "notifications" ? <Bell size={24} /> : <Shield size={24} />}
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-1">Coming Soon</h4>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Advanced {activeTab} features are currently under development and will be released in the next update.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
