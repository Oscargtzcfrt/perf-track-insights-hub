
import { Department, Kpi, KpiDataEntry, Person } from "@/types/models";

// Local storage keys
const PEOPLE_KEY = 'perftrack_people';
const DEPARTMENTS_KEY = 'perftrack_departments';
const KPIS_KEY = 'perftrack_kpis';
const DATA_ENTRIES_KEY = 'perftrack_data_entries';

// Helper function to generate IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Load data from localStorage
const loadData = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} data:`, error);
    return fallback;
  }
};

// Save data to localStorage
const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} data:`, error);
  }
};

// People service functions
export const getPeople = (): Person[] => {
  return loadData<Person[]>(PEOPLE_KEY, []);
};

export const getPerson = (id: string): Person | undefined => {
  const people = getPeople();
  return people.find(person => person.id === id);
};

export const savePerson = (person: Person): Person => {
  const people = getPeople();
  const existingIndex = people.findIndex(p => p.id === person.id);
  
  if (existingIndex >= 0) {
    // Update existing person
    const updatedPeople = [
      ...people.slice(0, existingIndex),
      person,
      ...people.slice(existingIndex + 1)
    ];
    saveData(PEOPLE_KEY, updatedPeople);
  } else {
    // Add new person with generated ID
    const newPerson = { ...person, id: generateId() };
    saveData(PEOPLE_KEY, [...people, newPerson]);
    return newPerson;
  }
  
  return person;
};

export const deletePerson = (id: string): void => {
  const people = getPeople();
  const filteredPeople = people.filter(person => person.id !== id);
  saveData(PEOPLE_KEY, filteredPeople);
};

// Department service functions
export const getDepartments = (): Department[] => {
  return loadData<Department[]>(DEPARTMENTS_KEY, []);
};

export const getDepartment = (id: string): Department | undefined => {
  const departments = getDepartments();
  return departments.find(dept => dept.id === id);
};

export const saveDepartment = (department: Department): Department => {
  const departments = getDepartments();
  const existingIndex = departments.findIndex(d => d.id === department.id);
  
  if (existingIndex >= 0) {
    // Update existing department
    const updatedDepartments = [
      ...departments.slice(0, existingIndex),
      department,
      ...departments.slice(existingIndex + 1)
    ];
    saveData(DEPARTMENTS_KEY, updatedDepartments);
  } else {
    // Add new department with generated ID
    const newDepartment = { ...department, id: generateId() };
    saveData(DEPARTMENTS_KEY, [...departments, newDepartment]);
    return newDepartment;
  }
  
  return department;
};

export const deleteDepartment = (id: string): void => {
  const departments = getDepartments();
  const filteredDepartments = departments.filter(dept => dept.id !== id);
  saveData(DEPARTMENTS_KEY, filteredDepartments);
};

// KPI service functions
export const getKpis = (): Kpi[] => {
  return loadData<Kpi[]>(KPIS_KEY, []);
};

export const getKpi = (id: string): Kpi | undefined => {
  const kpis = getKpis();
  return kpis.find(kpi => kpi.id === id);
};

export const saveKpi = (kpi: Kpi): Kpi => {
  const kpis = getKpis();
  const existingIndex = kpis.findIndex(k => k.id === kpi.id);
  
  if (existingIndex >= 0) {
    // Update existing KPI
    const updatedKpis = [
      ...kpis.slice(0, existingIndex),
      kpi,
      ...kpis.slice(existingIndex + 1)
    ];
    saveData(KPIS_KEY, updatedKpis);
  } else {
    // Add new KPI with generated ID
    const newKpi = { ...kpi, id: generateId() };
    saveData(KPIS_KEY, [...kpis, newKpi]);
    return newKpi;
  }
  
  return kpi;
};

export const deleteKpi = (id: string): void => {
  const kpis = getKpis();
  const filteredKpis = kpis.filter(kpi => kpi.id !== id);
  saveData(KPIS_KEY, filteredKpis);
};

// KPI Data Entry service functions
export const getKpiDataEntries = (): KpiDataEntry[] => {
  return loadData<KpiDataEntry[]>(DATA_ENTRIES_KEY, []);
};

export const getKpiDataEntriesForPerson = (personId: string): KpiDataEntry[] => {
  const entries = getKpiDataEntries();
  return entries.filter(entry => entry.personId === personId);
};

export const getKpiDataEntriesForDepartment = (departmentId: string): KpiDataEntry[] => {
  const entries = getKpiDataEntries();
  return entries.filter(entry => entry.departmentId === departmentId);
};

export const saveKpiDataEntry = (entry: KpiDataEntry): KpiDataEntry => {
  const entries = getKpiDataEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    // Update existing entry
    const updatedEntries = [
      ...entries.slice(0, existingIndex),
      entry,
      ...entries.slice(existingIndex + 1)
    ];
    saveData(DATA_ENTRIES_KEY, updatedEntries);
  } else {
    // Add new entry with generated ID
    const newEntry = { ...entry, id: generateId(), dateRecorded: new Date().toISOString() };
    saveData(DATA_ENTRIES_KEY, [...entries, newEntry]);
    return newEntry;
  }
  
  return entry;
};

export const deleteKpiDataEntry = (id: string): void => {
  const entries = getKpiDataEntries();
  const filteredEntries = entries.filter(entry => entry.id !== id);
  saveData(DATA_ENTRIES_KEY, filteredEntries);
};

// KPI calculation function
export const calculateKpiResult = (kpi: Kpi, variableValues: Record<string, number>): number | null => {
  try {
    // Create a function that evaluates the formula with the given variable values
    const formula = kpi.formula;
    
    // Replace variable names with their values
    let evalFormula = formula;
    for (const varName in variableValues) {
      const regex = new RegExp(varName, 'g');
      evalFormula = evalFormula.replace(regex, variableValues[varName].toString());
    }
    
    // Evaluate the formula
    // eslint-disable-next-line no-new-func
    const result = Function(`return ${evalFormula}`)();
    return typeof result === 'number' ? result : null;
  } catch (error) {
    console.error('Error calculating KPI result:', error);
    return null;
  }
};

// Seed initial data if none exists
export const seedInitialData = (): void => {
  const people = getPeople();
  const departments = getDepartments();
  const kpis = getKpis();
  
  if (people.length === 0 && departments.length === 0 && kpis.length === 0) {
    // Create sample departments
    const salesDept = {
      id: generateId(),
      name: "Sales",
      kpiIds: []
    };
    
    const marketingDept = {
      id: generateId(),
      name: "Marketing",
      kpiIds: []
    };
    
    saveData(DEPARTMENTS_KEY, [salesDept, marketingDept]);
    
    // Create sample KPIs
    const salesKpi = {
      id: generateId(),
      name: "Sales Target Achievement",
      description: "Percentage of sales target achieved",
      unit: "%",
      optimumType: "higher" as const,
      variables: [
        { name: "actual", label: "Actual Sales" },
        { name: "target", label: "Sales Target" }
      ],
      formula: "(actual / target) * 100"
    };
    
    const customerKpi = {
      id: generateId(),
      name: "Customer Satisfaction",
      description: "Average customer satisfaction score (1-10)",
      unit: "points",
      optimumType: "higher" as const,
      variables: [
        { name: "score", label: "Satisfaction Score" },
        { name: "responses", label: "Number of Responses" }
      ],
      formula: "score / responses"
    };
    
    saveData(KPIS_KEY, [salesKpi, customerKpi]);
    
    // Update departments with KPI IDs
    salesDept.kpiIds = [salesKpi.id, customerKpi.id];
    marketingDept.kpiIds = [customerKpi.id];
    
    saveData(DEPARTMENTS_KEY, [salesDept, marketingDept]);
    
    // Create sample people
    const samplePeople = [
      {
        id: generateId(),
        name: "John Doe",
        email: "john.doe@example.com",
        departmentId: salesDept.id
      },
      {
        id: generateId(),
        name: "Jane Smith",
        email: "jane.smith@example.com",
        departmentId: marketingDept.id
      }
    ];
    
    saveData(PEOPLE_KEY, samplePeople);
    
    // Create sample KPI data entries
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const sampleEntries = [
      {
        id: generateId(),
        personId: samplePeople[0].id,
        departmentId: salesDept.id,
        kpiId: salesKpi.id,
        period: { year: currentYear, month: currentMonth },
        variableValues: { actual: 85000, target: 100000 },
        dateRecorded: currentDate.toISOString()
      },
      {
        id: generateId(),
        personId: samplePeople[1].id,
        departmentId: marketingDept.id,
        kpiId: customerKpi.id,
        period: { year: currentYear, month: currentMonth },
        variableValues: { score: 450, responses: 50 },
        dateRecorded: currentDate.toISOString()
      }
    ];
    
    saveData(DATA_ENTRIES_KEY, sampleEntries);
  }
};
