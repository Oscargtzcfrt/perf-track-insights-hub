
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload } from "lucide-react";

const SettingsPage = () => {
  const { people, departments, kpis, kpiDataEntries, refreshData } = useData();
  const { toast } = useToast();

  // Export all data to JSON file
  const exportData = () => {
    try {
      const data = {
        people,
        departments,
        kpis,
        kpiDataEntries
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `perftrack-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Import data from JSON file
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Validate data structure
          if (!data.people || !data.departments || !data.kpis) {
            throw new Error("Invalid data format");
          }
          
          // Save to localStorage
          localStorage.setItem('perftrack_people', JSON.stringify(data.people));
          localStorage.setItem('perftrack_departments', JSON.stringify(data.departments));
          localStorage.setItem('perftrack_kpis', JSON.stringify(data.kpis));
          
          if (data.kpiDataEntries) {
            localStorage.setItem('perftrack_data_entries', JSON.stringify(data.kpiDataEntries));
          }
          
          // Refresh data
          refreshData();
          
          toast({
            title: "Success",
            description: "Data imported successfully",
          });
        } catch (error) {
          console.error("Error parsing import file:", error);
          toast({
            title: "Error",
            description: "Invalid import file format",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    }
    
    // Clear the input
    event.target.value = '';
  };

  // Reset all data
  const resetData = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone!")) {
      try {
        localStorage.removeItem('perftrack_people');
        localStorage.removeItem('perftrack_departments');
        localStorage.removeItem('perftrack_kpis');
        localStorage.removeItem('perftrack_data_entries');
        
        // Refresh data
        refreshData();
        
        toast({
          title: "Success",
          description: "Data reset successfully",
        });
      } catch (error) {
        console.error("Error resetting data:", error);
        toast({
          title: "Error",
          description: "Failed to reset data",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export, import, or reset your PerfTrack data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={exportData}>
                <Download className="mr-2 h-4 w-4" /> Export All Data
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Import Data
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action will permanently delete all your data and cannot be undone.
              </p>
              <Button variant="destructive" onClick={resetData}>
                Reset All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About PerfTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              PerfTrack is a simple KPI performance tracking application.
            </p>
            <p>
              Version: 1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PerfTrack. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
