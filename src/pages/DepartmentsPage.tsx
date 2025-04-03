
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/DataContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  kpiIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DepartmentsPage = () => {
  const { departments, kpis, people, addDepartment, updateDepartment, removeDepartment } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<{ id: string } & FormValues | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      kpiIds: [],
    },
  });
  
  const onSubmit = (values: FormValues) => {
    if (currentDepartment) {
      updateDepartment({
        id: currentDepartment.id,
        name: values.name,
        kpiIds: values.kpiIds || [],
      });
    } else {
      addDepartment({
        name: values.name,
        kpiIds: values.kpiIds || [],
      });
    }
    
    setIsDialogOpen(false);
    setCurrentDepartment(null);
    form.reset();
  };
  
  const handleAddClick = () => {
    form.reset({
      name: "",
      kpiIds: [],
    });
    setCurrentDepartment(null);
    setIsDialogOpen(true);
  };
  
  const handleEditClick = (department: typeof departments[0]) => {
    form.reset({
      name: department.name,
      kpiIds: department.kpiIds,
    });
    setCurrentDepartment(department);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    removeDepartment(id);
  };
  
  const filteredDepartments = departments.filter(department => 
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getPeopleCount = (departmentId: string) => {
    return people.filter(person => person.departmentId === departmentId).length;
  };
  
  const getKpiNames = (kpiIds: string[]) => {
    return kpiIds.map(id => kpis.find(kpi => kpi.id === id)?.name || "Unknown KPI");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Departments</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDepartments.map(department => (
          <Card key={department.id} className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <div className="text-xl">{department.name}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(department)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {department.name}? 
                          {getPeopleCount(department.id) > 0 && (
                            <span className="block text-destructive mt-2">
                              This department has {getPeopleCount(department.id)} people assigned to it.
                              You cannot delete departments with assigned people.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteClick(department.id)}
                          disabled={getPeopleCount(department.id) > 0}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{getPeopleCount(department.id)} People</span>
              </div>
              
              <div className="text-sm font-medium mb-2">Assigned KPIs:</div>
              <div className="flex flex-wrap gap-2">
                {department.kpiIds.length > 0 ? (
                  getKpiNames(department.kpiIds).map((name, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/10">{name}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No KPIs assigned</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No departments found. {searchTerm ? "Try a different search term." : "Add a new department to get started."}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="kpiIds"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Assigned KPIs</FormLabel>
                      <FormDescription>
                        Select the KPIs that apply to this department
                      </FormDescription>
                    </div>
                    {kpis.map((kpi) => (
                      <FormField
                        key={kpi.id}
                        control={form.control}
                        name="kpiIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={kpi.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(kpi.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), kpi.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== kpi.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {kpi.name}
                                <span className="text-muted-foreground text-xs block">
                                  {kpi.description}
                                </span>
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">{currentDepartment ? "Save Changes" : "Add Department"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
