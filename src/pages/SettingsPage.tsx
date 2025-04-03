
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, FileDown } from "lucide-react";
import * as XLSX from 'xlsx';

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

  // Download template Excel file with example data
  const downloadTemplate = () => {
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
      XLSX.writeFile(wb, `perftrack-template.xlsx`);
      
      toast({
        title: "Éxito",
        description: "Plantilla de datos descargada correctamente",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Error al descargar la plantilla",
        variant: "destructive",
      });
    }
  };

  // Import data from Excel file
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
          
          // Validate required data sheets
          if (!importedData.people || !importedData.departments || !importedData.kpis) {
            throw new Error("Formato de archivo inválido: faltan hojas requeridas");
          }
          
          // Save to localStorage
          localStorage.setItem('perftrack_people', JSON.stringify(importedData.people));
          localStorage.setItem('perftrack_departments', JSON.stringify(importedData.departments));
          localStorage.setItem('perftrack_kpis', JSON.stringify(importedData.kpis));
          
          if (importedData.kpidataentries) {
            localStorage.setItem('perftrack_data_entries', JSON.stringify(importedData.kpidataentries));
          }
          
          // Refresh data
          refreshData();
          
          toast({
            title: "Éxito",
            description: "Datos importados correctamente desde Excel",
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
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={exportData}>
                <Download className="mr-2 h-4 w-4" /> Exportar a Excel
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={importData}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Importar desde Excel
                </Button>
              </div>
              
              <Button variant="secondary" onClick={downloadTemplate}>
                <FileDown className="mr-2 h-4 w-4" /> Descargar Plantilla
              </Button>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-2">Zona de Peligro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Esta acción eliminará permanentemente todos tus datos y no se puede deshacer.
              </p>
              <Button variant="destructive" onClick={resetData}>
                Resetear Todos los Datos
              </Button>
            </div>
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
