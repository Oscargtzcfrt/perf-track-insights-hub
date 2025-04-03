
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/context/DataContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Edit, Plus, Search, Trash2, Plus as PlusIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { KpiOptimumType, KpiVariable } from "@/types/models";

const variableSchema = z.object({
  name: z.string().min(1, "Variable name is required"),
  label: z.string().min(1, "Label is required"),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  optimumType: z.enum(["higher", "lower", "target"], {
    required_error: "Optimum type is required",
  }),
  variables: z.array(variableSchema).min(1, "At least one variable is required"),
  formula: z.string().min(1, "Formula is required"),
});

type FormValues = z.infer<typeof formSchema>;

const KpisPage = () => {
  const { kpis, departments, addKpi, updateKpi, removeKpi } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentKpi, setCurrentKpi] = useState<{ id: string } & FormValues | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      unit: "",
      optimumType: "higher",
      variables: [{ name: "", label: "" }],
      formula: "",
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variables",
  });
  
  const onSubmit = (values: FormValues) => {
    if (currentKpi) {
      updateKpi({
        id: currentKpi.id,
        name: values.name,
        description: values.description || "",
        unit: values.unit,
        optimumType: values.optimumType,
        variables: values.variables as KpiVariable[], // Ensure variables match KpiVariable type
        formula: values.formula,
      });
    } else {
      addKpi({
        name: values.name,
        description: values.description || "",
        unit: values.unit,
        optimumType: values.optimumType,
        variables: values.variables as KpiVariable[], // Ensure variables match KpiVariable type
        formula: values.formula,
      });
    }
    
    setIsDialogOpen(false);
    setCurrentKpi(null);
    form.reset();
  };
  
  const handleAddClick = () => {
    form.reset({
      name: "",
      description: "",
      unit: "",
      optimumType: "higher",
      variables: [{ name: "", label: "" }],
      formula: "",
    });
    setCurrentKpi(null);
    setIsDialogOpen(true);
  };
  
  const handleEditClick = (kpi: typeof kpis[0]) => {
    form.reset({
      name: kpi.name,
      description: kpi.description,
      unit: kpi.unit,
      optimumType: kpi.optimumType,
      variables: kpi.variables,
      formula: kpi.formula,
    });
    setCurrentKpi(kpi);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    removeKpi(id);
  };
  
  const filteredKpis = kpis.filter(kpi => 
    kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kpi.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getDepartmentsUsingKpi = (kpiId: string) => {
    return departments.filter(dept => dept.kpiIds.includes(kpiId));
  };
  
  const getOptimumTypeLabel = (type: KpiOptimumType) => {
    switch (type) {
      case "higher":
        return "Higher is better";
      case "lower":
        return "Lower is better";
      case "target":
        return "Target is best";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">KPIs</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search KPIs..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" /> Add KPI
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKpis.map(kpi => (
          <Card key={kpi.id} className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <div>
                  <div className="text-xl flex items-center gap-2">
                    {kpi.name}
                    <Badge variant="outline" className="ml-2">{kpi.unit}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {kpi.description}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(kpi)}>
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
                        <AlertDialogTitle>Delete KPI</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {kpi.name}? This action cannot be undone.
                          {getDepartmentsUsingKpi(kpi.id).length > 0 && (
                            <span className="block text-destructive mt-2">
                              This KPI is used by {getDepartmentsUsingKpi(kpi.id).length} departments.
                              You cannot delete KPIs that are in use.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteClick(kpi.id)}
                          disabled={getDepartmentsUsingKpi(kpi.id).length > 0}
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
              <div className="text-sm mb-3">
                <span className="font-medium">Optimum Type:</span> {getOptimumTypeLabel(kpi.optimumType)}
              </div>
              
              <div className="text-sm mb-2">
                <span className="font-medium">Formula:</span> {kpi.formula}
              </div>
              
              <div className="text-sm font-medium mb-2">Required Variables:</div>
              <div className="flex flex-wrap gap-2">
                {kpi.variables.map((variable, i) => (
                  <Badge key={i} variant="outline" className="bg-primary/5">
                    {variable.name}: {variable.label}
                  </Badge>
                ))}
              </div>
              
              {getDepartmentsUsingKpi(kpi.id).length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Used in {getDepartmentsUsingKpi(kpi.id).length} departments
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredKpis.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No KPIs found. {searchTerm ? "Try a different search term." : "Add a new KPI to get started."}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentKpi ? "Edit KPI" : "Add New KPI"}</DialogTitle>
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
                      <Input placeholder="KPI name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="%, $, points, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="optimumType"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Optimum Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="higher">Higher is better</SelectItem>
                          <SelectItem value="lower">Lower is better</SelectItem>
                          <SelectItem value="target">Target is best</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel>Variables</FormLabel>
                <FormDescription>
                  Define the variables needed for this KPI
                </FormDescription>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name={`variables.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. actual, target" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`variables.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Label</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Actual Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ name: "", label: "" })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Variable
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="formula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formula</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. (actual / target) * 100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use the variable names in your formula with basic math operators (+, -, *, /).
                      Example: (actual / target) * 100
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">{currentKpi ? "Save Changes" : "Add KPI"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KpisPage;
