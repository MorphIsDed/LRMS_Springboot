import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { apiClient } from "../api/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Loader2, UserCheck, ShieldAlert, Edit2, Check, X } from "lucide-react";
import { Skeleton } from "../components/Skeleton";

type User = {
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

const AVAILABLE_ROLES = ["ADMIN", "RECEPTIONIST", "WAITER", "CHEF", "GUEST"];

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ role: string; isActive: boolean }>({ role: "GUEST", isActive: true });
  const [saving, setSaving] = useState<number | null>(null);
  
  const toast = useToastStore();

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get<User[]>("/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (user: User) => {
    setEditingId(user.userId);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (user: User) => {
    setSaving(user.userId);
    try {
      const updateData = {
        username: user.username,
        email: user.email,
        role: editForm.role,
        isActive: editForm.isActive
      };
      await apiClient.put(`/users/${user.userId}`, updateData);
      toast.push({ type: "success", message: `Updated ${user.username}'s role.` });
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to update user" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <AppShell title="User Management">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Role Assignments</h2>
            <p className="text-muted-foreground text-sm">Manage system access and assign staff roles to profiles.</p>
          </div>
          <Button variant="outline" onClick={fetchUsers} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Refresh List
          </Button>
        </div>

        <Card className="overflow-hidden border-border bg-card shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isEditing = editingId === user.userId;
                    const isSaving = saving === user.userId;
                    
                    return (
                      <tr key={user.userId} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {user.username}
                          {user.role === 'ADMIN' && <ShieldAlert size={14} className="inline ml-2 text-primary" />}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm(s => ({ ...s, role: e.target.value }))}
                              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none w-32"
                            >
                              {AVAILABLE_ROLES.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider
                              ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 
                                user.role === 'GUEST' ? 'bg-muted text-muted-foreground' : 
                                'bg-green-500/10 text-green-600 dark:text-green-400'}`}
                            >
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={editForm.isActive}
                                onChange={(e) => setEditForm(s => ({ ...s, isActive: e.target.checked }))}
                                className="rounded border-border text-primary focus:ring-primary/20"
                              />
                              <span className="text-xs">Active</span>
                            </label>
                          ) : (
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-destructive'}`} />
                              {user.isActive ? "Active" : "Disabled"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="h-8 px-2 text-muted-foreground">
                                <X size={14} />
                              </Button>
                              <Button size="sm" onClick={() => handleSave(user)} disabled={isSaving} className="h-8 px-3 gap-1.5 bg-green-600 hover:bg-green-700 text-white border-0">
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Save
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(user)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10">
                              <Edit2 size={16} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
