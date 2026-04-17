
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updatePermission, createRole } from "@/app/actions/rbac-actions"
import { toast } from "@/hooks/use-toast"
import { Shield, ShieldAlert, ShieldCheck, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AccessControlManager({ roles, modules }: { roles: any[], modules: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({ name: "", description: "" })

  const handleToggle = async (roleId: string, moduleId: string, action: 'can_view' | 'can_edit' | 'can_delete', current: boolean) => {
    const key = `${roleId}-${moduleId}-${action}`
    setLoading(key)
    try {
      await updatePermission(roleId, moduleId, { [action]: !current })
      toast({ title: "Permission Updated", description: "The role access has been synchronized." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update permission", variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  const handleCreateRole = async () => {
    try {
      await createRole(newRole.name, newRole.description)
      toast({ title: "Role Created", description: "You can now assign permissions to this role." })
      setIsCreateDialogOpen(false)
      setNewRole({ name: "", description: "" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create role", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Role-Based Access Control
          </h2>
          <p className="text-muted-foreground">Define custom roles and their access to specific system modules.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input 
                  placeholder="e.g. Junior Accountant" 
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Briefly describe what this role does" 
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateRole} disabled={!newRole.name}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="overflow-hidden border-2 border-muted">
            <CardHeader className="bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] pl-6">Module</TableHead>
                    <TableHead className="text-center">View</TableHead>
                    <TableHead className="text-center">Edit</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => {
                    const perm = role.role_permissions?.find((p: any) => p.module_id === module.id) || {
                      can_view: false,
                      can_edit: false,
                      can_delete: false
                    }
                    
                    return (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium pl-6">
                          <div>{module.name}</div>
                          <div className="text-[10px] text-muted-foreground font-normal uppercase tracking-wider">{module.slug}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={perm.can_view}
                            onCheckedChange={() => handleToggle(role.id, module.id, 'can_view', perm.can_view)}
                            disabled={loading === `${role.id}-${module.id}-can_view`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={perm.can_edit}
                            onCheckedChange={() => handleToggle(role.id, module.id, 'can_edit', perm.can_edit)}
                            disabled={loading === `${role.id}-${module.id}-can_edit`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={perm.can_delete}
                            onCheckedChange={() => handleToggle(role.id, module.id, 'can_delete', perm.can_delete)}
                            disabled={loading === `${role.id}-${module.id}-can_delete`}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
