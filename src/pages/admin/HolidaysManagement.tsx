import { useState, useEffect } from 'react';
import { csvDataService, PublicHoliday } from '@/services/csvDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const HolidaysManagement = () => {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<PublicHoliday[]>([]);
  const [countryFilter, setCountryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2025');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PublicHoliday>>({});

  useEffect(() => {
    loadHolidays();
  }, []);

  useEffect(() => {
    filterHolidays();
  }, [holidays, countryFilter, yearFilter]);

  const loadHolidays = async () => {
    const data = await csvDataService.getAllHolidays();
    setHolidays(data);
  };

  const filterHolidays = () => {
    let filtered = [...holidays];

    if (countryFilter !== 'all') {
      filtered = filtered.filter(h => h.country === countryFilter);
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(h => h.year.toString() === yearFilter);
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime());

    setFilteredHolidays(filtered);
  };

  const handleAdd = () => {
    setFormData({
      country: 'Nigeria',
      holiday_name: '',
      holiday_date: '',
      year: 2025,
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    if (!formData.country || !formData.holiday_name || !formData.holiday_date) {
      toast.error('All fields are required');
      return;
    }

    const success = await csvDataService.createHoliday(formData as PublicHoliday);
    if (success) {
      toast.success('Holiday added successfully');
      setIsAddModalOpen(false);
      loadHolidays();
    } else {
      toast.error('Failed to add holiday');
    }
  };

  const handleDelete = async (country: string, date: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;

    const success = await csvDataService.deleteHoliday(country, date);
    if (success) {
      toast.success('Holiday deleted');
      loadHolidays();
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleExport = () => {
    csvDataService.downloadCSV('holidays', 'holidays-export.csv');
    toast.success('Exported successfully');
  };

  const uniqueCountries = [...new Set(holidays.map(h => h.country))];
  const uniqueYears = [...new Set(holidays.map(h => h.year.toString()))];

  // Group holidays by country
  const groupedHolidays = filteredHolidays.reduce((acc, holiday) => {
    if (!acc[holiday.country]) acc[holiday.country] = [];
    acc[holiday.country].push(holiday);
    return acc;
  }, {} as Record<string, PublicHoliday[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Public Holidays</h1>
          <p className="text-muted-foreground mt-1">
            Manage public holidays by country
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label>Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(groupedHolidays).map(([country, countryHolidays]) => (
        <Card key={country}>
          <CardHeader>
            <CardTitle>{country} ({countryHolidays.length} holidays)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holiday Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryHolidays.map((holiday) => (
                  <TableRow key={`${holiday.country}-${holiday.holiday_date}`}>
                    <TableCell className="font-medium">{holiday.holiday_name}</TableCell>
                    <TableCell>{new Date(holiday.holiday_date).toLocaleDateString()}</TableCell>
                    <TableCell>{holiday.year}</TableCell>
                    <TableCell>
                      <Badge variant={holiday.is_active ? 'default' : 'secondary'}>
                        {holiday.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(holiday.country, holiday.holiday_date, holiday.holiday_name)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Public Holiday</DialogTitle>
            <DialogDescription>Add a new public holiday</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Country *</Label>
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Holiday Name *</Label>
              <Input
                value={formData.holiday_name || ''}
                onChange={(e) => setFormData({ ...formData, holiday_name: e.target.value })}
                placeholder="Independence Day"
              />
            </div>
            <div className="space-y-2">
              <Label>Date (YYYY-MM-DD) *</Label>
              <Input
                type="date"
                value={formData.holiday_date || ''}
                onChange={(e) => {
                  const year = new Date(e.target.value).getFullYear();
                  setFormData({ ...formData, holiday_date: e.target.value, year });
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd}>Add Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HolidaysManagement;
