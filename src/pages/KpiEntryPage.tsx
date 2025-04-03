import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const KpiEntryPage = () => {
  const { kpis, departments, people, addKpiDataEntry } = useData();
  const [entryType, setEntryType] = useState<"department" | "person">("department");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [kpiValues, setKpiValues] = useState<Record<string, Record<string, number>>>({});

  // Get relevant KPIs based on the selected department or person
  const relevantKpis = () => {
    if (entryType === "department" && selectedDepartment) {
      const dept = departments.find(d => d.id === selectedDepartment);
      if (dept) {
        return kpis.filter(kpi => dept.kpiIds.includes(kpi.id));
      }
    } else if (entryType === "person" && selectedPerson) {
      const person = people.find(p => p.id === selectedPerson);
      if (person) {
        const dept = departments.find(d => d.id === person.departmentId);
        if (dept) {
          return kpis.filter(kpi => dept.kpiIds.includes(kpi.id));
        }
      }
    }
    return [];
  };

  const handleKpiValueChange = (kpiId: string, varName: string, value: string) => {
    setKpiValues(prev => ({
      ...prev,
      [kpiId]: {
        ...(prev[kpiId] || {}),
        [varName]: parseFloat(value) || 0
      }
    }));
  };

  const handleSubmit = () => {
    const period = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1
    };

    // For each KPI that has values entered, create an entry
    Object.entries(kpiValues).forEach(([kpiId, varValues]) => {
      // Only submit if any values have been entered
      if (Object.keys(varValues).length > 0) {
        const entry = {
          kpiId,
          period,
          variableValues: varValues,
          ...(entryType === "department" 
            ? { departmentId: selectedDepartment } 
            : { personId: selectedPerson })
        };
        
        addKpiDataEntry(entry);
      }
    });

    // Clear form
    if (entryType === "department") {
      setSelectedDepartment("");
    } else {
      setSelectedPerson("");
    }
    setKpiValues({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">KPI Data Entry</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter KPI Values</CardTitle>
          <CardDescription>
            Record KPI values for a specific period to track performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Select period */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    showOutsideDays={false}
                    defaultMonth={selectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Tabs value={entryType} onValueChange={(value) => setEntryType(value as "department" | "person")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="department">Department KPIs</TabsTrigger>
              <TabsTrigger value="person">Person KPIs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="department" className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Select 
                  value={selectedDepartment} 
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="person" className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
                <Select 
                  value={selectedPerson} 
                  onValueChange={setSelectedPerson}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} ({departments.find(d => d.id === person.departmentId)?.name || 'No Department'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* KPI values form */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">KPI Values</h3>
            
            {(selectedDepartment && entryType === "department") || 
             (selectedPerson && entryType === "person") ? (
              <div className="space-y-4">
                {relevantKpis().length > 0 ? (
                  relevantKpis().map(kpi => (
                    <Card key={kpi.id} className="p-4 border border-border">
                      <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-md">{kpi.name}</CardTitle>
                        <CardDescription>{kpi.description} ({kpi.unit})</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kpi.variables.map(variable => (
                            <div key={variable.name}>
                              <label className="block text-sm font-medium mb-1">
                                {variable.label}
                              </label>
                              <Input
                                type="number"
                                value={kpiValues[kpi.id]?.[variable.name] || ""}
                                onChange={(e) => handleKpiValueChange(
                                  kpi.id, 
                                  variable.name, 
                                  e.target.value
                                )}
                                placeholder={`Enter ${variable.label.toLowerCase()}`}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No KPIs assigned to this {entryType}.</p>
                )}
                
                <div className="pt-4">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={relevantKpis().length === 0 || Object.keys(kpiValues).length === 0}
                  >
                    Save KPI Values
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Please select a {entryType} to view and enter KPI values.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiEntryPage;
