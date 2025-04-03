
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload } from "lucide-react";
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
