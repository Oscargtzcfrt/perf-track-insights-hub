
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Department, Kpi, KpiDataEntry, Person } from "@/types/models";
import {
  calculateKpiResult,
  deleteDepartment,
  deleteKpi,
  deleteKpiDataEntry,
  deletePerson,
  getDepartments,
  getKpiDataEntries,
  getKpis,
  getPeople,
  saveDepartment,
  saveKpi,
  saveKpiDataEntry,
  savePerson,
  seedInitialData
} from "@/services/dataService";
import { useToast } from "@/components/ui/use-toast";

interface DataContextType {
  // Data collections
  people: Person[];
  departments: Department[];
  kpis: Kpi[];
  kpiDataEntries: KpiDataEntry[];
  
  // Person operations
  addPerson: (person: Omit<Person, "id">) => void;
  updatePerson: (person: Person) => void;
  removePerson: (id: string) => void;
  
  // Department operations
  addDepartment: (department: Omit<Department, "id">) => void;
  updateDepartment: (department: Department) => void;
  removeDepartment: (id: string) => void;
  
  // KPI operations
  addKpi: (kpi: Omit<Kpi, "id">) => void;
  updateKpi: (kpi: Kpi) => void;
  removeKpi: (id: string) => void;
  
  // KPI Data operations
  addKpiDataEntry: (entry: Omit<KpiDataEntry, "id" | "dateRecorded">) => void;
  updateKpiDataEntry: (entry: KpiDataEntry) => void;
  removeKpiDataEntry: (id: string) => void;
  calculateKpiValue: (kpi: Kpi, variableValues: Record<string, number>) => number | null;
  
  // Loading state
  isLoading: boolean;
  
  // Reload data
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [kpiDataEntries, setKpiDataEntries] = useState<KpiDataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load data from local storage on initial render
  const loadData = () => {
    setIsLoading(true);
    try {
      // Seed initial data if needed
      seedInitialData();
      
      // Load data
      setPeople(getPeople());
      setDepartments(getDepartments());
      setKpis(getKpis());
      setKpiDataEntries(getKpiDataEntries());
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Person operations
  const addPerson = (person: Omit<Person, "id">) => {
    try {
      const newPerson = savePerson(person as Person);
      setPeople([...people, newPerson]);
      toast({
        title: "Success",
        description: "Person added successfully",
      });
    } catch (error) {
      console.error("Error adding person:", error);
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive",
      });
    }
  };

  const updatePerson = (person: Person) => {
    try {
      savePerson(person);
      setPeople(people.map(p => p.id === person.id ? person : p));
      toast({
        title: "Success",
        description: "Person updated successfully",
      });
    } catch (error) {
      console.error("Error updating person:", error);
      toast({
        title: "Error",
        description: "Failed to update person",
        variant: "destructive",
      });
    }
  };

  const removePerson = (id: string) => {
    try {
      deletePerson(id);
      setPeople(people.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Person removed successfully",
      });
    } catch (error) {
      console.error("Error removing person:", error);
      toast({
        title: "Error",
        description: "Failed to remove person",
        variant: "destructive",
      });
    }
  };

  // Department operations
  const addDepartment = (department: Omit<Department, "id">) => {
    try {
      const newDepartment = saveDepartment(department as Department);
      setDepartments([...departments, newDepartment]);
      toast({
        title: "Success",
        description: "Department added successfully",
      });
    } catch (error) {
      console.error("Error adding department:", error);
      toast({
        title: "Error",
        description: "Failed to add department",
        variant: "destructive",
      });
    }
  };

  const updateDepartment = (department: Department) => {
    try {
      saveDepartment(department);
      setDepartments(departments.map(d => d.id === department.id ? department : d));
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    } catch (error) {
      console.error("Error updating department:", error);
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const removeDepartment = (id: string) => {
    try {
      const hasPeople = people.some(person => person.departmentId === id);
      
      if (hasPeople) {
        toast({
          title: "Error",
          description: "Cannot delete department that has people assigned to it",
          variant: "destructive",
        });
        return;
      }
      
      deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
      toast({
        title: "Success",
        description: "Department removed successfully",
      });
    } catch (error) {
      console.error("Error removing department:", error);
      toast({
        title: "Error",
        description: "Failed to remove department",
        variant: "destructive",
      });
    }
  };

  // KPI operations
  const addKpi = (kpi: Omit<Kpi, "id">) => {
    try {
      const newKpi = saveKpi(kpi as Kpi);
      setKpis([...kpis, newKpi]);
      toast({
        title: "Success",
        description: "KPI added successfully",
      });
    } catch (error) {
      console.error("Error adding KPI:", error);
      toast({
        title: "Error",
        description: "Failed to add KPI",
        variant: "destructive",
      });
    }
  };

  const updateKpi = (kpi: Kpi) => {
    try {
      saveKpi(kpi);
      setKpis(kpis.map(k => k.id === kpi.id ? kpi : k));
      toast({
        title: "Success",
        description: "KPI updated successfully",
      });
    } catch (error) {
      console.error("Error updating KPI:", error);
      toast({
        title: "Error",
        description: "Failed to update KPI",
        variant: "destructive",
      });
    }
  };

  const removeKpi = (id: string) => {
    try {
      // Check if KPI is used in any department
      const isUsedInDepartment = departments.some(dept => dept.kpiIds.includes(id));
      
      if (isUsedInDepartment) {
        toast({
          title: "Error",
          description: "Cannot delete KPI that is used in departments",
          variant: "destructive",
        });
        return;
      }
      
      // Remove KPI and its data entries
      deleteKpi(id);
      setKpis(kpis.filter(k => k.id !== id));
      
      // Also remove related data entries
      const updatedEntries = kpiDataEntries.filter(entry => entry.kpiId !== id);
      updatedEntries.forEach(entry => {
        if (entry.kpiId === id) {
          deleteKpiDataEntry(entry.id);
        }
      });
      setKpiDataEntries(updatedEntries);
      
      toast({
        title: "Success",
        description: "KPI removed successfully",
      });
    } catch (error) {
      console.error("Error removing KPI:", error);
      toast({
        title: "Error",
        description: "Failed to remove KPI",
        variant: "destructive",
      });
    }
  };

  // KPI Data operations
  const addKpiDataEntry = (entry: Omit<KpiDataEntry, "id" | "dateRecorded">) => {
    try {
      const newEntry = saveKpiDataEntry(entry as KpiDataEntry);
      setKpiDataEntries([...kpiDataEntries, newEntry]);
      toast({
        title: "Success",
        description: "KPI data saved successfully",
      });
    } catch (error) {
      console.error("Error adding KPI data:", error);
      toast({
        title: "Error",
        description: "Failed to save KPI data",
        variant: "destructive",
      });
    }
  };

  const updateKpiDataEntry = (entry: KpiDataEntry) => {
    try {
      saveKpiDataEntry(entry);
      setKpiDataEntries(entries => entries.map(e => e.id === entry.id ? entry : e));
      toast({
        title: "Success",
        description: "KPI data updated successfully",
      });
    } catch (error) {
      console.error("Error updating KPI data:", error);
      toast({
        title: "Error",
        description: "Failed to update KPI data",
        variant: "destructive",
      });
    }
  };

  const removeKpiDataEntry = (id: string) => {
    try {
      deleteKpiDataEntry(id);
      setKpiDataEntries(entries => entries.filter(e => e.id !== id));
      toast({
        title: "Success",
        description: "KPI data entry removed successfully",
      });
    } catch (error) {
      console.error("Error removing KPI data:", error);
      toast({
        title: "Error",
        description: "Failed to remove KPI data",
        variant: "destructive",
      });
    }
  };

  const calculateKpiValue = (kpi: Kpi, variableValues: Record<string, number>) => {
    return calculateKpiResult(kpi, variableValues);
  };

  const value = {
    people,
    departments,
    kpis,
    kpiDataEntries,
    addPerson,
    updatePerson,
    removePerson,
    addDepartment,
    updateDepartment,
    removeDepartment,
    addKpi,
    updateKpi,
    removeKpi,
    addKpiDataEntry,
    updateKpiDataEntry,
    removeKpiDataEntry,
    calculateKpiValue,
    isLoading,
    refreshData: loadData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
