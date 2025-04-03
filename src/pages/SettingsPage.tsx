
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, FileDown, Users, BarChart } from "lucide-react";
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { people, departments, kpis, kpiDataEntries, refreshData } = useData();
  const { toast } = useToast();

  // Export all data to Excel file
  const exportData = () => {
    try {
      // Prepare data for Excel sheets
      const data = {
        people,
        departments,
        kpis,
        kpiDataEntries
      };
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert each data type to a worksheet and add to workbook
      Object.entries(data).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `perftrack-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Éxito",
        description: "Datos exportados correctamente a Excel",
      });
    } catch (error) {
      console.error("Error exporting data to Excel:", error);
      toast({
        title: "Error",
        description: "Error al exportar datos a Excel",
        variant: "destructive",
      });
    }
  };
  
  // Export only people and departments
  const exportPeopleAndDepartments = () => {
    try {
      // Prepare data for Excel sheets
      const data = {
        people,
        departments,
      };
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert each data type to a worksheet and add to workbook
      Object.entries(data).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `perftrack-personas-departamentos-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Éxito",
        description: "Personas y departamentos exportados correctamente",
      });
    } catch (error) {
      console.error("Error exporting people and departments:", error);
      toast({
        title: "Error",
        description: "Error al exportar personas y departamentos",
        variant: "destructive",
      });
    }
  };
  
  // Export only KPIs
  const exportKpis = () => {
    try {
      // Prepare data for Excel sheets
      const data = {
        kpis,
      };
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert each data type to a worksheet and add to workbook
      Object.entries(data).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `perftrack-kpis-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Éxito",
        description: "KPIs exportados correctamente",
      });
    } catch (error) {
      console.error("Error exporting KPIs:", error);
      toast({
        title: "Error",
        description: "Error al exportar KPIs",
        variant: "destructive",
      });
    }
  };
  
  // Download template for KPIs
  const downloadKpisTemplate = () => {
    try {
      // Create example data
      const exampleData = {
        kpis: [
          { 
            id: "k1", 
            name: "Ventas Mensuales", 
            description: "Total de ventas mensuales",
            unit: "€",
            optimumType: "higher",
            variables: [
              { name: "ventas", label: "Ventas" },
              { name: "objetivo", label: "Objetivo" }
            ],
            formula: "ventas / objetivo * 100"
          },
          { 
            id: "k2", 
            name: "Satisfacción Cliente", 
            description: "Puntuación de satisfacción del cliente",
            unit: "%",
            optimumType: "higher",
            variables: [
              { name: "puntuacion", label: "Puntuación" }
            ],
            formula: "puntuacion"
          },
          { 
            id: "k3", 
            name: "Costes Marketing", 
            description: "Costes de marketing como % de ventas",
            unit: "%",
            optimumType: "lower",
            variables: [
              { name: "costes", label: "Costes" },
              { name: "ventas", label: "Ventas" }
            ],
            formula: "costes / ventas * 100"
          }
        ]
      };
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert each data type to a worksheet and add to workbook
      Object.entries(exampleData).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `perftrack-template-kpis.xlsx`);
      
      toast({
        title: "Éxito",
        description: "Plantilla de KPIs descargada correctamente",
      });
    } catch (error) {
      console.error("Error downloading KPIs template:", error);
      toast({
        title: "Error",
        description: "Error al descargar la plantilla de KPIs",
        variant: "destructive",
      });
    }
  };
  
  // Download template for People and Departments
  const downloadPeopleAndDepartmentsTemplate = () => {
    try {
      // Create example data
      const exampleData = {
        people: [
          { id: "p1", name: "Juan Pérez", email: "juan@example.com", departmentId: "d1" },
          { id: "p2", name: "María García", email: "maria@example.com", departmentId: "d2" }
        ],
        departments: [
          { id: "d1", name: "Ventas", kpiIds: ["k1", "k2"] },
          { id: "d2", name: "Marketing", kpiIds: ["k2", "k3"] }
        ]
      };
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert each data type to a worksheet and add to workbook
      Object.entries(exampleData).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `perftrack-template-personas-departamentos.xlsx`);
      
      toast({
        title: "Éxito",
        description: "Plantilla de personas y departamentos descargada correctamente",
      });
    } catch (error) {
      console.error("Error downloading people and departments template:", error);
      toast({
        title: "Error",
        description: "Error al descargar la plantilla de personas y departamentos",
        variant: "destructive",
      });
    }
  };

  // Download template Excel file with example data (complete)
  const downloadCompleteTemplate = () => {
    try {
      // Create example data
      const exampleData = {
        people: [
          { id: "p1", name: "Juan Pérez", email: "juan@example.com", departmentId: "d1" },
          { id: "p2", name: "María García", email: "maria@example.com", departmentId: "d2" }
        ],
        departments: [
          { id: "d1", name: "Ventas", kpiIds: ["k1", "k2"] },
          { id: "d2", name: "Marketing", kpiIds: ["k2", "k3"] }
        ],
        kpis: [
          { 
            id: "k1", 
            name: "Ventas Mensuales", 
            description: "Total de ventas mensuales",
            unit: "€",
            optimumType: "higher",
            variables: [
              { name: "ventas", label: "Ventas" },
              { name: "objetivo", label: "Objetivo" }
            ],
            formula: "ventas / objetivo * 100"
          },
          { 
            id: "k2", 
            name: "Satisfacción Cliente", 
            description: "Puntuación de satisfacción del cliente",
            unit: "%",
            optimumType: "higher",
            variables: [
              { name: "puntuacion", label: "Puntuación" }
            ],
            formula: "puntuacion"
          },
          { 
            id: "k3", 
            name: "Costes Marketing", 
            description: "Costes de marketing como % de ventas",
            unit: "%",
            optimumType: "lower",
            variables: [
              { name: "costes", label: "Costes" },
              { name: "ventas", label: "Ventas" }
            ],
            formula: "costes / ventas * 100"
          }
        ],
        kpiDataEntries: [
          {
            id: "e1",
            personId: "p1",
            departmentId: "d1",
            kpiId: "k1",
            period: { year: 2023, month: 1 },
            variableValues: { "ventas": 15000, "objetivo": 10000 },
            dateRecorded: new Date().toISOString()
          },
          {
            id: "e2",
            personId: "p2",
            departmentId: "d2",
            kpiId: "k2",
            period: { year: 2023, month: 1 },
            variableValues: { "puntuacion": 85 },
            dateRecorded: new Date().toISOString()
          }
        ]
      };
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert each data type to a worksheet and add to workbook
      Object.entries(exampleData).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `perftrack-template-completo.xlsx`);
      
      toast({
        title: "Éxito",
        description: "Plantilla completa de datos descargada correctamente",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Error al descargar la plantilla completa",
        variant: "destructive",
      });
    }
  };

  // Import data from Excel file - with type checking
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          const importedData: Record<string, any[]> = {};
          
          // Process each sheet in the workbook
          workbook.SheetNames.forEach(sheetName => {
            // Convert sheet data to JSON
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            importedData[sheetName.toLowerCase()] = jsonData;
          });

          // Determine type of import based on sheets present
          const hasKpis = importedData.kpis && importedData.kpis.length > 0;
          const hasPeople = importedData.people && importedData.people.length > 0;
          const hasDepartments = importedData.departments && importedData.departments.length > 0;
          const hasKpiData = importedData.kpidataentries && importedData.kpidataentries.length > 0;
          
          let importType = 'unknown';
          let importMessage = '';
          
          // Handle KPIs-only import
          if (hasKpis && !hasPeople && !hasDepartments) {
            importType = 'kpis';
            localStorage.setItem('perftrack_kpis', JSON.stringify(importedData.kpis));
            importMessage = "KPIs importados correctamente";
          } 
          // Handle People/Departments import
          else if (!hasKpis && hasPeople && hasDepartments) {
            importType = 'people-departments';
            localStorage.setItem('perftrack_people', JSON.stringify(importedData.people));
            localStorage.setItem('perftrack_departments', JSON.stringify(importedData.departments));
            importMessage = "Personas y departamentos importados correctamente";
          }
          // Handle complete import
          else if (hasKpis && hasPeople && hasDepartments) {
            importType = 'complete';
            localStorage.setItem('perftrack_people', JSON.stringify(importedData.people));
            localStorage.setItem('perftrack_departments', JSON.stringify(importedData.departments));
            localStorage.setItem('perftrack_kpis', JSON.stringify(importedData.kpis));
            
            if (hasKpiData) {
              localStorage.setItem('perftrack_data_entries', JSON.stringify(importedData.kpidataentries));
              importMessage = "Datos completos importados correctamente";
            } else {
              importMessage = "Personas, departamentos y KPIs importados correctamente";
            }
          } else {
            throw new Error("El archivo no contiene las hojas requeridas o el formato es incorrecto");
          }
          
          // Refresh data
          refreshData();
          
          toast({
            title: "Éxito",
            description: importMessage,
          });
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast({
            title: "Error",
            description: "Formato de archivo Excel inválido",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error importing Excel data:", error);
      toast({
        title: "Error",
        description: "Error al importar datos desde Excel",
        variant: "destructive",
      });
    }
    
    // Clear the input
    event.target.value = '';
  };

  // Reset all data
  const resetData = () => {
    if (confirm("¿Estás seguro de que deseas resetear todos los datos? ¡Esta acción no se puede deshacer!")) {
      try {
        localStorage.removeItem('perftrack_people');
        localStorage.removeItem('perftrack_departments');
        localStorage.removeItem('perftrack_kpis');
        localStorage.removeItem('perftrack_data_entries');
        
        // Refresh data
        refreshData();
        
        toast({
          title: "Éxito",
          description: "Datos reseteados correctamente",
        });
      } catch (error) {
        console.error("Error resetting data:", error);
        toast({
          title: "Error",
          description: "Error al resetear datos",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Datos</CardTitle>
          <CardDescription>
            Exporta, importa o resetea tus datos de PerfTrack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import-export" className="w-full mb-6">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="import-export">Importar/Exportar</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="import-export" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium mb-2">Exportar Datos</h3>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <Button onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" /> Exportar Todos los Datos
                </Button>
                
                <Button variant="outline" onClick={exportPeopleAndDepartments}>
                  <Users className="mr-2 h-4 w-4" /> Exportar Personas y Departamentos
                </Button>
                
                <Button variant="outline" onClick={exportKpis}>
                  <BarChart className="mr-2 h-4 w-4" /> Exportar KPIs
                </Button>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Importar Datos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona un archivo Excel para importar datos. El archivo debe contener las hojas adecuadas según el tipo de datos que quieras importar.
                </p>
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={importData}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <Button variant="secondary">
                    <Upload className="mr-2 h-4 w-4" /> Seleccionar Archivo Excel
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium mb-2">Descargar Plantillas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga plantillas para facilitar la importación de datos. Cada plantilla incluye ejemplos del formato correcto.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <Button variant="outline" onClick={downloadCompleteTemplate}>
                  <FileDown className="mr-2 h-4 w-4" /> Plantilla Completa
                </Button>
                
                <Button variant="outline" onClick={downloadKpisTemplate}>
                  <BarChart className="mr-2 h-4 w-4" /> Plantilla de KPIs
                </Button>
                
                <Button variant="outline" onClick={downloadPeopleAndDepartmentsTemplate}>
                  <Users className="mr-2 h-4 w-4" /> Plantilla de Personas y Departamentos
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-2">Zona de Peligro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción eliminará permanentemente todos tus datos y no se puede deshacer.
            </p>
            <Button variant="destructive" onClick={resetData}>
              Resetear Todos los Datos
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Acerca de PerfTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              PerfTrack es una aplicación simple para seguimiento de desempeño por KPIs.
            </p>
            <p>
              Versión: 1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PerfTrack. Todos los derechos reservados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
