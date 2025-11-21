import { useState, useEffect } from 'react';
import { csvDataService, Employee } from '@/services/csvDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Download, Search, Calculator, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Calculate prorated leave entitlement based on employment date
// Rules: <6 months = 0 days, 6-12 months = prorated, 1+ year = full entitlement (14 days)
function calculateProratedEntitlement(employmentDateStr: string, fullEntitlement: number = 14): { days: number; status: string; monthsEmployed: number } {
  // Parse date string (various formats: "February 3, 2024" or "DD/MM/YYYY")
  let employmentDate: Date;

  // Try parsing "Month Day, Year" format
  const parsed = Date.parse(employmentDateStr);
  if (!isNaN(parsed)) {
    employmentDate = new Date(parsed);
  } else {
    // Try DD/MM/YYYY format
    const parts = employmentDateStr.split('/');
    if (parts.length === 3) {
      employmentDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      return { days: fullEntitlement, status: 'Unable to parse date', monthsEmployed: 12 };
    }
  }

  const now = new Date();
  const diffMs = now.getTime() - employmentDate.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // Average month length

  if (diffMonths < 6) {
    return { days: 0, status: 'Not yet eligible (< 6 months)', monthsEmployed: Math.floor(diffMonths) };
  } else if (diffMonths < 12) {
    // Prorated: (months / 12) * full entitlement, rounded
    const prorated = Math.round((diffMonths / 12) * fullEntitlement);
    return { days: prorated, status: 'Prorated (6-12 months)', monthsEmployed: Math.floor(diffMonths) };
  } else {
    return { days: fullEntitlement, status: 'Full entitlement (1+ year)', monthsEmployed: Math.floor(diffMonths) };
  }
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, countryFilter, teamFilter]);

  const loadEmployees = async () => {
    const data = await csvDataService.getEmployees();
    setEmployees(data);
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter(emp => emp.country === countryFilter);
    }

    if (teamFilter !== 'all') {
      filtered = filtered.filter(emp => emp.team === teamFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData(employee);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      email: '',
      full_name: '',
      manager_email: '',
      manager_name: '',
      employment_date: '',
      Current: '2025',
      team: '',
      role: '',
      country: 'Nigeria',
      annual_entitlement: 14,
      annual_taken: 0,
      sick_entitlement: 7,
      sick_taken: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEmployee || !formData.email) return;

    const success = await csvDataService.updateEmployee(selectedEmployee.email, formData);
    if (success) {
      toast.success('Employee updated successfully');
      setIsEditModalOpen(false);
      loadEmployees();
    } else {
      toast.error('Failed to update employee');
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.email || !formData.full_name) {
      toast.error('Email and name are required');
      return;
    }

    const success = await csvDataService.createEmployee(formData as Employee);
    if (success) {
      toast.success('Employee added successfully');
      setIsAddModalOpen(false);
      loadEmployees();
    } else {
      toast.error('Failed to add employee - email may already exist');
    }
  };

  const handleDelete = async (email: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const success = await csvDataService.deleteEmployee(email);
    if (success) {
      toast.success('Employee deleted successfully');
      loadEmployees();
    } else {
      toast.error('Failed to delete employee');
    }
  };

  const handleExport = () => {
    csvDataService.downloadCSV('employees', 'employees-export.csv');
    toast.success('Employees exported successfully');
  };

  const uniqueCountries = [...new Set(employees.map(e => e.country))];
  const uniqueTeams = [...new Set(employees.map(e => e.team))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee data, leave balances, and assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {uniqueTeams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
          <CardDescription>Total employees in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Employed Since</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Annual</TableHead>
                  <TableHead>Sick</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.email}>
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell><code className="text-xs">{employee.email}</code></TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.team}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {employee.employment_date || 'N/A'}
                    </TableCell>
                    <TableCell>{employee.country}</TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {employee.annual_taken}/{employee.annual_entitlement}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {employee.sick_taken}/{employee.sick_entitlement}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(employee.email, employee.full_name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  value={formData.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Input
                  value={formData.team || ''}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manager Email</Label>
                <Input
                  value={formData.manager_email || ''}
                  onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Manager Name</Label>
                <Input
                  value={formData.manager_name || ''}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={formData.country || 'Nigeria'}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                    <SelectItem value="Uganda">Uganda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Date (Month Day, Year)</Label>
                <Input
                  value={formData.employment_date || ''}
                  onChange={(e) => setFormData({ ...formData, employment_date: e.target.value })}
                  placeholder="January 1, 2023"
                />
              </div>
            </div>
            {/* Auto-calculated entitlement info */}
            {formData.employment_date && (
              <Alert className="border-blue-200 bg-blue-50">
                <Calculator className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  {(() => {
                    const calc = calculateProratedEntitlement(formData.employment_date, 14);
                    return (
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>{calc.monthsEmployed} months</strong> employed - {calc.status}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, annual_entitlement: calc.days })}
                          className="ml-4"
                        >
                          Set to {calc.days} days
                        </Button>
                      </div>
                    );
                  })()}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Annual Entitlement</Label>
                <Input
                  type="number"
                  value={formData.annual_entitlement || 0}
                  onChange={(e) => setFormData({ ...formData, annual_entitlement: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Taken</Label>
                <Input
                  type="number"
                  value={formData.annual_taken || 0}
                  onChange={(e) => setFormData({ ...formData, annual_taken: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sick Entitlement</Label>
                <Input
                  type="number"
                  value={formData.sick_entitlement || 0}
                  onChange={(e) => setFormData({ ...formData, sick_entitlement: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sick Taken</Label>
                <Input
                  type="number"
                  value={formData.sick_taken || 0}
                  onChange={(e) => setFormData({ ...formData, sick_taken: parseInt(e.target.value) })}
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
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Create a new employee record</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jd@curacel.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Input
                  value={formData.team || ''}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manager Email</Label>
                <Input
                  value={formData.manager_email || ''}
                  onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                  placeholder="ho@curacel.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Manager Name</Label>
                <Input
                  value={formData.manager_name || ''}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  placeholder="Henry Okonkwo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={formData.country || 'Nigeria'}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                    <SelectItem value="Uganda">Uganda</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Date (Month Day, Year)</Label>
                <Input
                  value={formData.employment_date || ''}
                  onChange={(e) => setFormData({ ...formData, employment_date: e.target.value })}
                  placeholder="November 21, 2025"
                />
              </div>
            </div>
            {/* Auto-calculated entitlement for new employees */}
            {formData.employment_date && (
              <Alert className="border-blue-200 bg-blue-50">
                <Calculator className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  {(() => {
                    const calc = calculateProratedEntitlement(formData.employment_date, 14);
                    return (
                      <div className="text-sm">
                        <strong>{calc.monthsEmployed} months</strong> since employment - {calc.status}
                        <span className="ml-2 font-semibold text-blue-700">
                          → Suggested: {calc.days} days annual leave
                        </span>
                      </div>
                    );
                  })()}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
