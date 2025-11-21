import { useState, useEffect } from 'react';
import { csvDataService, Policy } from '@/services/csvDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState<Partial<Policy>>({});

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    const data = await csvDataService.getPolicies();
    setPolicies(data);
  };

  const handleEdit = (policy: Policy) => {
    setSelectedPolicy(policy);
    setFormData(policy);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      policy_name: '',
      leave_type: '',
      days_entitled: 0,
      leave_days: 'workday',
      minimum_employment_months: 0,
      advance_notice_days: 0,
      requires_manager_approval: true,
      requires_hr_approval: true,
      requires_handover: true,
      active: true,
      last_updated: new Date().toISOString().split('T')[0],
      updated_by: 'oa@curacel.com',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPolicy || !formData.leave_type) return;

    const updateData = {
      ...formData,
      last_updated: new Date().toISOString().split('T')[0],
      updated_by: 'oa@curacel.com',
    };

    const success = await csvDataService.updatePolicy(selectedPolicy.leave_type, updateData);
    if (success) {
      toast.success('Policy updated successfully');
      setIsEditModalOpen(false);
      loadPolicies();
    } else {
      toast.error('Failed to update policy');
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.leave_type || !formData.policy_name) {
      toast.error('Leave type and policy name are required');
      return;
    }

    const success = await csvDataService.createPolicy(formData as Policy);
    if (success) {
      toast.success('Policy added successfully');
      setIsAddModalOpen(false);
      loadPolicies();
    } else {
      toast.error('Failed to add policy - leave type may already exist');
    }
  };

  const handleDelete = async (leaveType: string, policyName: string) => {
    if (!confirm(`Are you sure you want to delete ${policyName}?`)) return;

    const success = await csvDataService.deletePolicy(leaveType);
    if (success) {
      toast.success('Policy deleted successfully');
      loadPolicies();
    } else {
      toast.error('Failed to delete policy');
    }
  };

  const handleExport = () => {
    csvDataService.downloadCSV('policies', 'policies-export.csv');
    toast.success('Policies exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage leave policies, entitlements, and approval workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Policy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Policies ({policies.length})</CardTitle>
          <CardDescription>Configure leave types and their requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Days Entitled</TableHead>
                  <TableHead>Leave Days</TableHead>
                  <TableHead>Min Employment</TableHead>
                  <TableHead>Advance Notice</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead>Handover</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.leave_type}>
                    <TableCell className="font-medium">{policy.leave_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{policy.days_entitled} days</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.leave_days === 'workday' ? 'default' : 'secondary'}>
                        {policy.leave_days}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{policy.minimum_employment_months} months</TableCell>
                    <TableCell className="text-sm">{policy.advance_notice_days} days</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {policy.requires_manager_approval && <Badge variant="outline" className="text-xs">MGR</Badge>}
                        {policy.requires_hr_approval && <Badge variant="outline" className="text-xs">HR</Badge>}
                        {!policy.requires_manager_approval && !policy.requires_hr_approval && <span className="text-xs text-muted-foreground">Auto</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {policy.requires_handover ? (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.active ? 'default' : 'secondary'}>
                        {policy.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(policy)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(policy.leave_type, policy.policy_name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
            <DialogDescription>Update leave policy configuration</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Policy Name *</Label>
                <Input
                  value={formData.policy_name || ''}
                  onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Input
                  value={formData.leave_type || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days Entitled *</Label>
                <Input
                  type="number"
                  value={formData.days_entitled || 0}
                  onChange={(e) => setFormData({ ...formData, days_entitled: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Leave Days Type *</Label>
                <Select
                  value={formData.leave_days || 'workday'}
                  onValueChange={(value: 'workday' | 'calendarday') => setFormData({ ...formData, leave_days: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workday">Workday (Mon-Fri)</SelectItem>
                    <SelectItem value="calendarday">Calendar Day (All days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Employment (months)</Label>
                <Input
                  type="number"
                  value={formData.minimum_employment_months || 0}
                  onChange={(e) => setFormData({ ...formData, minimum_employment_months: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Advance Notice (days)</Label>
                <Input
                  type="number"
                  value={formData.advance_notice_days || 0}
                  onChange={(e) => setFormData({ ...formData, advance_notice_days: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requires Manager Approval</Label>
                  <p className="text-sm text-muted-foreground">Manager must approve before HR</p>
                </div>
                <Switch
                  checked={formData.requires_manager_approval || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_manager_approval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requires HR Approval</Label>
                  <p className="text-sm text-muted-foreground">HR final approval required</p>
                </div>
                <Switch
                  checked={formData.requires_hr_approval || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_hr_approval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requires Handover Document</Label>
                  <p className="text-sm text-muted-foreground">Handover link must be provided</p>
                </div>
                <Switch
                  checked={formData.requires_handover || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_handover: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Policy</Label>
                  <p className="text-sm text-muted-foreground">Enable/disable this leave type</p>
                </div>
                <Switch
                  checked={formData.active || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Policy</DialogTitle>
            <DialogDescription>Create a new leave type policy</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Policy Name *</Label>
                <Input
                  value={formData.policy_name || ''}
                  onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                  placeholder="Study Leave Entitlement"
                />
              </div>
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Input
                  value={formData.leave_type || ''}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  placeholder="Study"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days Entitled *</Label>
                <Input
                  type="number"
                  value={formData.days_entitled || 0}
                  onChange={(e) => setFormData({ ...formData, days_entitled: parseInt(e.target.value) })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Leave Days Type *</Label>
                <Select
                  value={formData.leave_days || 'workday'}
                  onValueChange={(value: 'workday' | 'calendarday') => setFormData({ ...formData, leave_days: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workday">Workday (Mon-Fri)</SelectItem>
                    <SelectItem value="calendarday">Calendar Day (All days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Employment (months)</Label>
                <Input
                  type="number"
                  value={formData.minimum_employment_months || 0}
                  onChange={(e) => setFormData({ ...formData, minimum_employment_months: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Advance Notice (days)</Label>
                <Input
                  type="number"
                  value={formData.advance_notice_days || 0}
                  onChange={(e) => setFormData({ ...formData, advance_notice_days: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Requires Manager Approval</Label>
                <Switch
                  checked={formData.requires_manager_approval || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_manager_approval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires HR Approval</Label>
                <Switch
                  checked={formData.requires_hr_approval || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_hr_approval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires Handover Document</Label>
                <Switch
                  checked={formData.requires_handover || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_handover: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd}>Add Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyManagement;
