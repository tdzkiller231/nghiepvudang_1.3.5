import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, FileDown, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Target {
  id: number;
  unit: string;
  year: number;
  training: number;
  recruitment: number;
  trainingDone: number;
  recruitmentDone: number;
  rate: number;
}

export default function ChiTieu() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    unit: "",
    year: "2025",
    training: 0,
    recruitment: 0,
    trainingDone: 0,
    recruitmentDone: 0,
  });

  const [targets, setTargets] = useState<Target[]>([
    { id: 1, unit: "Chi bộ Kinh doanh", year: 2025, training: 25, recruitment: 20, trainingDone: 20, recruitmentDone: 15, rate: 75 },
    { id: 2, unit: "Chi bộ Sản xuất", year: 2025, training: 30, recruitment: 25, trainingDone: 24, recruitmentDone: 18, rate: 72 },
    { id: 3, unit: "Chi bộ Kỹ thuật", year: 2025, training: 20, recruitment: 15, trainingDone: 18, recruitmentDone: 12, rate: 80 },
    { id: 4, unit: "Chi bộ Hành chính", year: 2025, training: 15, recruitment: 10, trainingDone: 12, recruitmentDone: 7, rate: 70 },
    { id: 5, unit: "Chi bộ CNTT", year: 2025, training: 18, recruitment: 15, trainingDone: 14, recruitmentDone: 10, rate: 67 },
  ]);

  const units = [
    "Chi bộ Kinh doanh",
    "Chi bộ Sản xuất",
    "Chi bộ Kỹ thuật",
    "Chi bộ Hành chính",
    "Chi bộ CNTT",
  ];

  // Calculate rate
  const calculateRate = (trainingDone: number, recruitmentDone: number, training: number, recruitment: number) => {
    const total = training + recruitment;
    const done = trainingDone + recruitmentDone;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  // Filter targets
  const filteredTargets = targets.filter((target) => {
    const matchYear = selectedYear === "all" || target.year.toString() === selectedYear;
    const matchUnit = selectedUnit === "all" || target.unit === selectedUnit;
    const matchSearch = target.unit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchYear && matchUnit && matchSearch;
  });

  // Get totals
  const getTotalTargets = () => {
    return filteredTargets.reduce((acc, t) => ({
      training: acc.training + t.training,
      recruitment: acc.recruitment + t.recruitment,
      trainingDone: acc.trainingDone + t.trainingDone,
      recruitmentDone: acc.recruitmentDone + t.recruitmentDone,
    }), { training: 0, recruitment: 0, trainingDone: 0, recruitmentDone: 0 });
  };

  const totals = getTotalTargets();
  const totalRate = totals.training + totals.recruitment > 0 
    ? Math.round(((totals.trainingDone + totals.recruitmentDone) / (totals.training + totals.recruitment)) * 100) 
    : 0;

  // Handle add target
  const handleAddTarget = () => {
    if (!formData.unit || !formData.year || formData.training <= 0 || formData.recruitment <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin!",
        variant: "destructive",
      });
      return;
    }

    const newTarget: Target = {
      id: Math.max(...targets.map(t => t.id)) + 1,
      unit: formData.unit,
      year: parseInt(formData.year),
      training: formData.training,
      recruitment: formData.recruitment,
      trainingDone: formData.trainingDone,
      recruitmentDone: formData.recruitmentDone,
      rate: calculateRate(formData.trainingDone, formData.recruitmentDone, formData.training, formData.recruitment),
    };

    setTargets([...targets, newTarget]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Thành công",
      description: "Đã thêm chỉ tiêu mới!",
    });
  };

  // Handle edit target
  const handleEditTarget = () => {
    if (!editingTarget) return;

    if (formData.trainingDone > formData.training || formData.recruitmentDone > formData.recruitment) {
      toast({
        title: "Lỗi",
        description: "Số đã hoàn thành không được lớn hơn chỉ tiêu!",
        variant: "destructive",
      });
      return;
    }

    const updatedTargets = targets.map(t => 
      t.id === editingTarget.id 
        ? {
            ...t,
            training: formData.training,
            recruitment: formData.recruitment,
            trainingDone: formData.trainingDone,
            recruitmentDone: formData.recruitmentDone,
            rate: calculateRate(formData.trainingDone, formData.recruitmentDone, formData.training, formData.recruitment),
          }
        : t
    );

    setTargets(updatedTargets);
    setIsEditDialogOpen(false);
    setEditingTarget(null);
    resetForm();

    toast({
      title: "Thành công",
      description: "Đã cập nhật chỉ tiêu!",
    });
  };

  // Open edit dialog
  const openEditDialog = (target: Target) => {
    setEditingTarget(target);
    setFormData({
      unit: target.unit,
      year: target.year.toString(),
      training: target.training,
      recruitment: target.recruitment,
      trainingDone: target.trainingDone,
      recruitmentDone: target.recruitmentDone,
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      unit: "",
      year: "2025",
      training: 0,
      recruitment: 0,
      trainingDone: 0,
      recruitmentDone: 0,
    });
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ["Đơn vị", "Năm", "CT Bồi dưỡng", "CT Kết nạp", "Đã bồi dưỡng", "Đã kết nạp", "Hoàn thành (%)"],
      ...filteredTargets.map(t => [
        t.unit,
        t.year,
        t.training,
        t.recruitment,
        t.trainingDone,
        t.recruitmentDone,
        t.rate
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chi-tieu-${selectedYear}.csv`;
    link.click();

    toast({
      title: "Thành công",
      description: "Đã xuất báo cáo!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Chỉ tiêu Phát triển Đảng</h1>
          <p className="text-muted-foreground">Đăng ký và theo dõi chỉ tiêu hàng năm</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <FileDown className="h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Đăng ký chỉ tiêu
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-accent border-accent-foreground/10">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Tổng chỉ tiêu bồi dưỡng</p>
              <p className="text-4xl font-bold text-primary mb-1">{totals.training}</p>
              <p className="text-sm text-muted-foreground">Đã hoàn thành: {totals.trainingDone}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent border-accent-foreground/10">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Tổng chỉ tiêu kết nạp</p>
              <p className="text-4xl font-bold text-primary mb-1">{totals.recruitment}</p>
              <p className="text-sm text-muted-foreground">Đã hoàn thành: {totals.recruitmentDone}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent border-accent-foreground/10">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Tỷ lệ hoàn thành</p>
              <p className="text-4xl font-bold text-success mb-1">{totalRate}%</p>
              <p className="text-sm text-muted-foreground">Toàn Đảng bộ BSR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chỉ tiêu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm kiếm đơn vị..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả năm</SelectItem>
                <SelectItem value="2023">Năm 2023</SelectItem>
                <SelectItem value="2024">Năm 2024</SelectItem>
                <SelectItem value="2025">Năm 2025</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Đơn vị</TableHead>
                  <TableHead className="font-semibold">Năm</TableHead>
                  <TableHead className="font-semibold text-center">CT Bồi dưỡng</TableHead>
                  <TableHead className="font-semibold text-center">CT Kết nạp</TableHead>
                  <TableHead className="font-semibold text-center">Đã bồi dưỡng</TableHead>
                  <TableHead className="font-semibold text-center">Đã kết nạp</TableHead>
                  <TableHead className="font-semibold text-center">Hoàn thành</TableHead>
                  <TableHead className="font-semibold text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTargets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTargets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">{target.unit}</TableCell>
                      <TableCell>{target.year}</TableCell>
                      <TableCell className="text-center">{target.training}</TableCell>
                      <TableCell className="text-center">{target.recruitment}</TableCell>
                      <TableCell className="text-center font-medium text-info">{target.trainingDone}</TableCell>
                      <TableCell className="text-center font-medium text-info">{target.recruitmentDone}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={target.rate >= 75 ? "default" : target.rate >= 50 ? "secondary" : "destructive"}>
                          {target.rate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => openEditDialog(target)}>
                          <Edit className="h-4 w-4" />
                          Sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Đăng ký chỉ tiêu mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chỉ tiêu phát triển đảng cho năm
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="unit">Đơn vị *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Năm *</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="training">Chỉ tiêu bồi dưỡng *</Label>
                <Input 
                  id="training"
                  type="number"
                  min="0"
                  value={formData.training || ""}
                  onChange={(e) => setFormData({...formData, training: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recruitment">Chỉ tiêu kết nạp *</Label>
                <Input 
                  id="recruitment"
                  type="number"
                  min="0"
                  value={formData.recruitment || ""}
                  onChange={(e) => setFormData({...formData, recruitment: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="trainingDone">Đã bồi dưỡng</Label>
                <Input 
                  id="trainingDone"
                  type="number"
                  min="0"
                  value={formData.trainingDone || ""}
                  onChange={(e) => setFormData({...formData, trainingDone: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recruitmentDone">Đã kết nạp</Label>
                <Input 
                  id="recruitmentDone"
                  type="number"
                  min="0"
                  value={formData.recruitmentDone || ""}
                  onChange={(e) => setFormData({...formData, recruitmentDone: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Hủy
            </Button>
            <Button onClick={handleAddTarget}>Thêm mới</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật chỉ tiêu</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chỉ tiêu của {editingTarget?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Đơn vị</Label>
              <Input value={formData.unit} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Năm</Label>
              <Input value={formData.year} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-training">Chỉ tiêu bồi dưỡng *</Label>
                <Input 
                  id="edit-training"
                  type="number"
                  min="0"
                  value={formData.training || ""}
                  onChange={(e) => setFormData({...formData, training: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-recruitment">Chỉ tiêu kết nạp *</Label>
                <Input 
                  id="edit-recruitment"
                  type="number"
                  min="0"
                  value={formData.recruitment || ""}
                  onChange={(e) => setFormData({...formData, recruitment: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-trainingDone">Đã bồi dưỡng *</Label>
                <Input 
                  id="edit-trainingDone"
                  type="number"
                  min="0"
                  max={formData.training}
                  value={formData.trainingDone || ""}
                  onChange={(e) => setFormData({...formData, trainingDone: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-recruitmentDone">Đã kết nạp *</Label>
                <Input 
                  id="edit-recruitmentDone"
                  type="number"
                  min="0"
                  max={formData.recruitment}
                  value={formData.recruitmentDone || ""}
                  onChange={(e) => setFormData({...formData, recruitmentDone: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Tỷ lệ hoàn thành: <span className="font-bold text-foreground">
                  {calculateRate(formData.trainingDone, formData.recruitmentDone, formData.training, formData.recruitment)}%
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingTarget(null);
              resetForm();
            }}>
              Hủy
            </Button>
            <Button onClick={handleEditTarget}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}