import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Eye, Edit, FileText, Users, CheckCircle, AlertCircle, 
  Clock, Upload, Download, X, Calendar, User, Building, ChevronRight,
  FileCheck, FileUp, Trash2, Check
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// ============= TYPES =============
interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  status: "pending" | "uploaded" | "verified" | "rejected";
}

interface StageData {
  status: "pending" | "in_progress" | "completed" | "failed";
  startDate: string | null;
  endDate: string | null;
  deadline?: string;
  note: string;
  progress?: number;
  score?: number;
  documents?: DocumentFile[];
}

interface Stage1Data extends StageData {
  introducerName: string;
  introducerPosition: string;
  introducerPhone: string;
  introducedDate: string;
  reason: string;
  initialRating: string;
}

interface Stage2Data extends StageData {
  className: string;
  classCode: string;
  instructor: string;
  location: string;
  totalSessions: number;
  attendedSessions: number;
  examScore?: number;
  examGrade?: string;
  certificateNumber?: string;
}

interface Stage3Data extends StageData {
  evaluationDate: string;
  politicalAwareness: number;
  studyAttitude: number;
  moralQuality: number;
  overallScore: number;
  grade: "A" | "B" | "C" | "D";
  evaluatorComments: string;
  agreedPercent: number;
  result: "pass" | "fail" | "conditional_pass";
}

interface Stage4Data extends StageData {
  commitmentDate: string;
  duration: number;
  mentorName: string;
  mentorPosition: string;
  mentorPhone: string;
  tasks: Array<{
    id: string;
    name: string;
    status: "pending" | "in_progress" | "completed";
    completedDate?: string;
  }>;
  completionRate: number;
}

interface Stage5DocumentChecklist {
  // Nhóm A: Hồ sơ cá nhân (5 bắt buộc)
  soYeuLyLich: DocumentFile | null;
  banKhaiLyLich: DocumentFile | null;
  lyLichTuThuật: DocumentFile | null;
  giayKhaiSinh: DocumentFile | null;
  cmndCccd: DocumentFile | null;
  
  // Nhóm B: Xác nhận (3 bắt buộc)
  xacNhanCongAn: DocumentFile | null;
  xacNhanDiaPhuong: DocumentFile | null;
  xacNhanCoQuan: DocumentFile | null;
  
  // Nhóm C: Hồ sơ Đảng (4 bắt buộc)
  donXinGiaNhap: DocumentFile | null;
  chungChiLopHoc: DocumentFile | null;
  camKetRenLuyen: DocumentFile | null;
  bienBanDanhGia: DocumentFile | null;
  
  // Nhóm D: Đánh giá (3 bắt buộc)
  phieuLayYKien: DocumentFile | null;
  tuKiemDiem: DocumentFile | null;
  nhanXetChiBo: DocumentFile | null;
  
  // Nhóm E: Bằng cấp (1 bắt buộc)
  bangTotNghiep: DocumentFile | null;
}

interface Stage5Data extends StageData {
  checklist: Stage5DocumentChecklist;
  completionRate: number;
  requiredCount: number;
  completedCount: number;
  reviewStatus: "pending" | "in_review" | "approved" | "rejected";
  reviewComments?: string;
}

interface Stage6Data extends StageData {
  meetingDate: string;
  totalMembers: number;
  presentMembers: number;
  agreedVotes: number;
  disagreedVotes: number;
  agreedPercent: number;
  decision: "approved" | "rejected" | "deferred";
  decisionNumber?: string;
  decisionDate?: string;
  signerName?: string;
  signerPosition?: string;
  decisionFile?: DocumentFile;
}

interface DevelopmentProfile {
  id: string;
  profileCode: string;
  status: "active" | "completed" | "suspended";
  currentStage: number;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: "male" | "female";
    idNumber: string;
    phone: string;
    email: string;
    address: string;
    unit: string;
    position: string;
  };
  stage1: Stage1Data;
  stage2: Stage2Data;
  stage3: Stage3Data;
  stage4: Stage4Data;
  stage5: Stage5Data;
  stage6: Stage6Data;
  createdAt: string;
  updatedAt: string;
}

// ============= CONSTANTS =============
const STAGE_CONFIG = {
  1: { name: "Ghi nhận thông tin", duration: 7, icon: FileText, color: "blue" },
  2: { name: "Lớp nhận thức", duration: 180, icon: Users, color: "purple" },
  3: { name: "Đánh giá sau lớp", duration: 60, icon: CheckCircle, color: "green" },
  4: { name: "Cam kết rèn luyện", duration: 365, icon: Clock, color: "orange" },
  5: { name: "Hoàn thiện hồ sơ", duration: 60, icon: Upload, color: "pink" },
  6: { name: "Quyết định kết nạp", duration: 7, icon: FileCheck, color: "emerald" },
};

const DOCUMENT_CHECKLIST = {
  groupA: {
    name: "Hồ sơ cá nhân",
    items: [
      { key: "soYeuLyLich", label: "Sơ yếu lý lịch (có ảnh 4x6)", required: true },
      { key: "banKhaiLyLich", label: "Bản khai lý lịch (Mẫu 2a-BNV/2008)", required: true },
      { key: "lyLichTuThuật", label: "Lý lịch tự thuật", required: true },
      { key: "giayKhaiSinh", label: "Giấy khai sinh (bản sao công chứng)", required: true },
      { key: "cmndCccd", label: "CMND/CCCD (bản sao công chứng)", required: true },
    ],
  },
  groupB: {
    name: "Xác nhận nhân thân",
    items: [
      { key: "xacNhanCongAn", label: "Xác nhận Công an (tiền án tiền sự)", required: true },
      { key: "xacNhanDiaPhuong", label: "Xác nhận địa phương cư trú", required: true },
      { key: "xacNhanCoQuan", label: "Xác nhận cơ quan công tác", required: true },
    ],
  },
  groupC: {
    name: "Hồ sơ Đảng",
    items: [
      { key: "donXinGiaNhap", label: "Đơn xin gia nhập Đảng (viết tay)", required: true },
      { key: "chungChiLopHoc", label: "Chứng chỉ lớp nhận thức về Đảng", required: true },
      { key: "camKetRenLuyen", label: "Bản cam kết rèn luyện", required: true },
      { key: "bienBanDanhGia", label: "Biên bản đánh giá rèn luyện", required: true },
    ],
  },
  groupD: {
    name: "Hồ sơ đánh giá",
    items: [
      { key: "phieuLayYKien", label: "Phiếu lấy ý kiến quần chúng (≥20 phiếu)", required: true },
      { key: "tuKiemDiem", label: "Bản tự kiểm điểm", required: true },
      { key: "nhanXetChiBo", label: "Nhận xét của Chi bộ", required: true },
    ],
  },
  groupE: {
    name: "Bằng cấp",
    items: [
      { key: "bangTotNghiep", label: "Bằng tốt nghiệp (cao nhất)", required: true },
    ],
  },
};

// ============= MAIN COMPONENT =============
export default function HoSo() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<DevelopmentProfile[]>([
    {
      id: "profile_sample_1",
      profileCode: "HS-2024-001",
      status: "active",
      currentStage: 3,
      personalInfo: {
        fullName: "Nguyễn Văn An",
        dateOfBirth: "1995-03-15",
        gender: "male",
        idNumber: "001095012345",
        phone: "0912345678",
        email: "nguyenvanan@example.com",
        address: "123 Nguyễn Trãi, Hà Nội",
        unit: "Phòng Kế hoạch - Tài chính",
        position: "Chuyên viên",
      },
      stage1: {
        status: "completed",
        startDate: "2024-01-15",
        endDate: "2024-01-20",
        deadline: "2024-01-20",
        note: "Đã hoàn thành ghi nhận thông tin",
        introducerName: "Trần Thị Bình",
        introducerPosition: "Bí thư Chi bộ",
        introducerPhone: "0987654321",
        introducedDate: "2024-01-10",
        reason: "Có phẩm chất đạo đức tốt, nhiệt tình với công việc",
        initialRating: "excellent",
      },
      stage2: {
        status: "completed",
        startDate: "2024-01-22",
        endDate: "2024-07-15",
        deadline: "2024-07-20",
        note: "Hoàn thành lớp nhận thức xuất sắc",
        className: "Lớp nhận thức về Đảng khóa 1/2024",
        classCode: "LNT-2024-01",
        instructor: "PGS.TS Phạm Văn Đức",
        location: "Hội trường A - Tầng 3",
        totalSessions: 20,
        attendedSessions: 20,
        examScore: 9.2,
        examGrade: "A",
        certificateNumber: "CC-2024-001",
      },
      stage3: {
        status: "in_progress",
        startDate: "2024-07-16",
        endDate: null,
        deadline: "2024-09-15",
        note: "Đang chờ đánh giá",
        evaluationDate: "",
        politicalAwareness: 0,
        studyAttitude: 0,
        moralQuality: 0,
        overallScore: 0,
        grade: "C",
        evaluatorComments: "",
        agreedPercent: 0,
        result: "pass",
      },
      stage4: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        commitmentDate: "",
        duration: 12,
        mentorName: "",
        mentorPosition: "",
        mentorPhone: "",
        tasks: [],
        completionRate: 0,
      },
      stage5: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        checklist: {
          soYeuLyLich: null,
          banKhaiLyLich: null,
          lyLichTuThuật: null,
          giayKhaiSinh: null,
          cmndCccd: null,
          xacNhanCongAn: null,
          xacNhanDiaPhuong: null,
          xacNhanCoQuan: null,
          donXinGiaNhap: null,
          chungChiLopHoc: null,
          camKetRenLuyen: null,
          bienBanDanhGia: null,
          phieuLayYKien: null,
          tuKiemDiem: null,
          nhanXetChiBo: null,
          bangTotNghiep: null,
        },
        completionRate: 0,
        requiredCount: 16,
        completedCount: 0,
        reviewStatus: "pending",
      },
      stage6: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        meetingDate: "",
        totalMembers: 0,
        presentMembers: 0,
        agreedVotes: 0,
        disagreedVotes: 0,
        agreedPercent: 0,
        decision: "approved",
      },
      createdAt: "2024-01-15",
      updatedAt: "2024-07-16",
    }
]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<DevelopmentProfile | null>(null);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  
  // Form states
  const [newProfileForm, setNewProfileForm] = useState({
    fullName: "",
    unit: "",
    introducedDate: "",
    introducerName: "",
    initialRating: "",
  });

  // Stage 2 form state (CHỈ THÔNG TIN LỚP HỌC)
  const [stage2Form, setStage2Form] = useState({
    className: "",
    classCode: "",
    instructor: "",
    location: "",
    startDate: "",
    endDate: "",
    note: "",
  });

  // Stage 3 form state (ĐÁNH GIÁ SAU LỚP HỌC)
  const [stage3Form, setStage3Form] = useState({
    evaluator: "",
    evaluatorPosition: "",
    evaluationContent: "",
    politicalAwareness: 0,
    studyAttitude: 0,
    moralQuality: 0,
    overallScore: 0,
    grade: "C" as "A" | "B" | "C" | "D",
    className: "",
    note: "",
  });

  // Stage 4 form state (CAM KẾT RÈN LUYỆN)
  const [stage4Form, setStage4Form] = useState({
    commitmentContent: "",
    mentorName: "",
    mentorPosition: "",
    startDate: "",
    endDate: "",
    attachedFile: null as File | null,
    note: "",
  });

  // Stage 5 documents state
  const [stage5Documents, setStage5Documents] = useState<{
    [key: string]: {
      uploaded: boolean;
      file: File | null;
      fileName: string;
      uploadedDate: string;
    };
  }>({
    lyLichTuKhai: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    nhanXetChiUy: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    camKetRenLuyen: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    chungChiLopHoc: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    phieuNhanXet: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    kiemDiemPhanDau: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    anhCMND: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
  });

  // Stage 5 personal info form
  const [stage5PersonalForm, setStage5PersonalForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female",
    idNumber: "",
    phone: "",
    email: "",
    address: "",
    unit: "",
    position: "",
    education: "",
    workplace: "",
  });

  // Stage 5 work history
  const [stage5WorkHistory, setStage5WorkHistory] = useState([
    { id: 1, period: "", position: "", unit: "", description: "" }
  ]);

  // Stage 5 evaluation
  const [stage5Evaluation, setStage5Evaluation] = useState({
    partyEvaluation: "",
    unionEvaluation: "",
    trainingResult: "",
    mentorComment: "",
  });

  // Document list for stage 5
  const STAGE5_DOCUMENTS = [
    { key: "lyLichTuKhai", label: "Lý lịch tự khai (theo mẫu 2C-BTĐ)", required: true },
    { key: "nhanXetChiUy", label: "Nhận xét của chi ủy, đoàn thể", required: true },
    { key: "camKetRenLuyen", label: "Bản cam kết rèn luyện, phấn đấu", required: true },
    { key: "chungChiLopHoc", label: "Giấy chứng nhận hoàn thành lớp nhận thức", required: true },
    { key: "phieuNhanXet", label: "Phiếu nhận xét của đảng viên hướng dẫn", required: true },
    { key: "kiemDiemPhanDau", label: "Bản kiểm điểm quá trình phấn đấu", required: true },
    { key: "anhCMND", label: "Ảnh 3x4, CMND/CCCD scan", required: true },
  ];

  // ============= HELPER FUNCTIONS =============
  const generateProfileCode = () => {
    const year = new Date().getFullYear();
    const count = profiles.length + 1;
    return `HS-${year}-${String(count).padStart(3, '0')}`;
  };

  const calculateDeadline = (startDate: string, days: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const getOverallProgress = (profile: DevelopmentProfile) => {
    let completed = 0;
    Object.keys(profile).forEach(key => {
      if (key.startsWith('stage')) {
        const stage = profile[key as keyof DevelopmentProfile] as StageData;
        if (stage.status === "completed") completed++;
      }
    });
    return Math.round((completed / 6) * 100);
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in_progress": return "bg-primary text-primary-foreground";
      case "failed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ============= CREATE NEW PROFILE - TỰ ĐỘNG HOÀN THÀNH GIAI ĐOẠN 1 =============
  const handleCreateProfile = () => {
    const { fullName, unit, introducedDate, introducerName, initialRating } = newProfileForm;
    
    if (!fullName || !unit || !introducedDate || !introducerName || !initialRating) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deadline2 = calculateDeadline(today, STAGE_CONFIG[2].duration);

    const newProfile: DevelopmentProfile = {
      id: `profile_${Date.now()}`,
      profileCode: generateProfileCode(),
      status: "active",
      currentStage: 2,
      personalInfo: {
        fullName: newProfileForm.fullName,
        dateOfBirth: "",
        gender: "male",
        idNumber: "",
        phone: "",
        email: "",
        address: "",
        unit: newProfileForm.unit,
        position: "",
      },
      stage1: {
        status: "completed",
        startDate: today,
        endDate: today,
        deadline: today,
        note: "Đã ghi nhận thông tin quần chúng ưu tú",
        introducerName: newProfileForm.introducerName,
        introducerPosition: "",
        introducerPhone: "",
        introducedDate: newProfileForm.introducedDate,
        reason: "",
        initialRating: newProfileForm.initialRating,
      },
      stage2: {
        status: "in_progress",
        startDate: today,
        endDate: null,
        deadline: deadline2,
        note: "Chờ tham gia lớp học",
        className: "",
        classCode: "",
        instructor: "",
        location: "",
        totalSessions: 0,
        attendedSessions: 0,
      },
      stage3: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        evaluationDate: "",
        politicalAwareness: 0,
        studyAttitude: 0,
        moralQuality: 0,
        overallScore: 0,
        grade: "C",
        evaluatorComments: "",
        agreedPercent: 0,
        result: "pass",
      },
      stage4: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        commitmentDate: "",
        duration: 12,
        mentorName: "",
        mentorPosition: "",
        mentorPhone: "",
        tasks: [],
        completionRate: 0,
      },
      stage5: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        checklist: {
          soYeuLyLich: null,
          banKhaiLyLich: null,
          lyLichTuThuật: null,
          giayKhaiSinh: null,
          cmndCccd: null,
          xacNhanCongAn: null,
          xacNhanDiaPhuong: null,
          xacNhanCoQuan: null,
          donXinGiaNhap: null,
          chungChiLopHoc: null,
          camKetRenLuyen: null,
          bienBanDanhGia: null,
          phieuLayYKien: null,
          tuKiemDiem: null,
          nhanXetChiBo: null,
          bangTotNghiep: null,
        },
        completionRate: 0,
        requiredCount: 16,
        completedCount: 0,
        reviewStatus: "pending",
      },
      stage6: {
        status: "pending",
        startDate: null,
        endDate: null,
        note: "",
        meetingDate: "",
        totalMembers: 0,
        presentMembers: 0,
        agreedVotes: 0,
        disagreedVotes: 0,
        agreedPercent: 0,
        decision: "approved",
      },
      createdAt: today,
      updatedAt: today,
    };

    setProfiles([...profiles, newProfile]);
    setIsCreateDialogOpen(false);
    
    setNewProfileForm({
      fullName: "",
      unit: "",
      introducedDate: "",
      introducerName: "",
      initialRating: "",
    });

    toast({
      title: "✅ Thành công",
      description: `Đã tạo hồ sơ ${newProfile.profileCode} cho ${fullName}. Bắt đầu giai đoạn 2: Lớp nhận thức`,
    });
  };

  // ============= OPEN STAGE 2 DIALOG (CHỈ THÔNG TIN LỚP) =============
  const handleOpenStage2Dialog = (profile: DevelopmentProfile) => {
    setSelectedProfile(profile);
    setSelectedStage(2);
    
    setStage2Form({
      className: profile.stage2.className,
      classCode: profile.stage2.classCode,
      instructor: profile.stage2.instructor,
      location: profile.stage2.location,
      startDate: profile.stage2.startDate || "",
      endDate: profile.stage2.endDate || "",
      note: profile.stage2.note,
    });
    
    setIsStageDialogOpen(true);
  };

  // ============= UPDATE & COMPLETE STAGE 2 =============
  const handleUpdateStage2 = () => {
    if (!selectedProfile) return;

    const today = new Date().toISOString().split('T')[0];

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        return {
          ...p,
          stage2: {
            ...p.stage2,
            className: stage2Form.className,
            classCode: stage2Form.classCode,
            instructor: stage2Form.instructor,
            location: stage2Form.location,
            startDate: stage2Form.startDate || p.stage2.startDate,
            endDate: stage2Form.endDate || p.stage2.endDate,
            note: stage2Form.note,
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Cập nhật thành công",
      description: "Đã cập nhật thông tin lớp học",
    });
  };

  const handleCompleteStage2FromDialog = () => {
    if (!selectedProfile) return;

    const { className, startDate, endDate } = stage2Form;
    
    if (!className || !startDate || !endDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin lớp học!",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deadline3 = calculateDeadline(today, STAGE_CONFIG[3].duration);

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        return {
          ...p,
          currentStage: 3,
          stage2: {
            ...p.stage2,
            status: "completed" as const,
            endDate: today,
            className: stage2Form.className,
            classCode: stage2Form.classCode,
            instructor: stage2Form.instructor,
            location: stage2Form.location,
            startDate: stage2Form.startDate,
            note: stage2Form.note,
          },
          stage3: {
            ...p.stage3,
            status: "in_progress" as const,
            startDate: today,
            deadline: deadline3,
            note: "Chờ đánh giá sau lớp học",
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Hoàn thành giai đoạn 2",
      description: "Đã chuyển sang giai đoạn 3: Đánh giá sau lớp học",
    });
  };

  // ============= OPEN STAGE 3 DIALOG (ĐÁNH GIÁ) =============
  const handleOpenStage3Dialog = (profile: DevelopmentProfile) => {
    setSelectedProfile(profile);
    setSelectedStage(3);
    
    setStage3Form({
      evaluator: "",
      evaluatorPosition: "",
      evaluationContent: profile.stage3.evaluatorComments || "",
      politicalAwareness: profile.stage3.politicalAwareness,
      studyAttitude: profile.stage3.studyAttitude,
      moralQuality: profile.stage3.moralQuality,
      overallScore: profile.stage3.overallScore,
      grade: profile.stage3.grade,
      className: profile.stage2.className, // Lấy từ stage 2
      note: profile.stage3.note,
    });
    
    setIsStageDialogOpen(true);
  };

  // ============= UPDATE & COMPLETE STAGE 3 =============
  const handleUpdateStage3 = () => {
    if (!selectedProfile) return;

    const today = new Date().toISOString().split('T')[0];
    const avgScore = (stage3Form.politicalAwareness + stage3Form.studyAttitude + stage3Form.moralQuality) / 3;

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        return {
          ...p,
          stage3: {
            ...p.stage3,
            evaluationDate: today,
            politicalAwareness: stage3Form.politicalAwareness,
            studyAttitude: stage3Form.studyAttitude,
            moralQuality: stage3Form.moralQuality,
            overallScore: Math.round(avgScore * 10) / 10,
            grade: stage3Form.grade,
            evaluatorComments: stage3Form.evaluationContent,
            note: stage3Form.note,
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Cập nhật thành công",
      description: "Đã cập nhật đánh giá",
    });
  };

  const handleCompleteStage3FromDialog = () => {
    if (!selectedProfile) return;

    if (stage3Form.overallScore < 5) {
      toast({
        title: "Cảnh báo",
        description: "Điểm đánh giá dưới 5.0! Không thể hoàn thành giai đoạn.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deadline4 = calculateDeadline(today, STAGE_CONFIG[4].duration);

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        return {
          ...p,
          currentStage: 4,
          stage3: {
            ...p.stage3,
            status: "completed" as const,
            endDate: today,
            evaluationDate: today,
            politicalAwareness: stage3Form.politicalAwareness,
            studyAttitude: stage3Form.studyAttitude,
            moralQuality: stage3Form.moralQuality,
            overallScore: stage3Form.overallScore,
            grade: stage3Form.grade,
            evaluatorComments: stage3Form.evaluationContent,
            result: "pass",
          },
          stage4: {
            ...p.stage4,
            status: "in_progress" as const,
            startDate: today,
            deadline: deadline4,
            note: "Chờ cam kết rèn luyện",
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Hoàn thành giai đoạn 3",
      description: "Đã chuyển sang giai đoạn 4: Cam kết rèn luyện",
    });
  };

  // ============= OPEN STAGE 4 DIALOG (CAM KẾT) =============
  const handleOpenStage4Dialog = (profile: DevelopmentProfile) => {
    setSelectedProfile(profile);
    setSelectedStage(4);
    
    setStage4Form({
      commitmentContent: "",
      mentorName: profile.stage4.mentorName,
      mentorPosition: profile.stage4.mentorPosition,
      startDate: profile.stage4.startDate || "",
      endDate: profile.stage4.deadline || "",
      attachedFile: null,
      note: profile.stage4.note,
    });
    
    setIsStageDialogOpen(true);
  };

  // ============= HANDLE FILE UPLOAD =============
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStage4Form({...stage4Form, attachedFile: e.target.files[0]});
    }
  };

  // ============= UPDATE & COMPLETE STAGE 4 =============
  const handleUpdateStage4 = () => {
    if (!selectedProfile) return;

    const today = new Date().toISOString().split('T')[0];

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        return {
          ...p,
          stage4: {
            ...p.stage4,
            commitmentDate: stage4Form.startDate,
            mentorName: stage4Form.mentorName,
            mentorPosition: stage4Form.mentorPosition,
            note: stage4Form.commitmentContent,
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Cập nhật thành công",
      description: "Đã lưu cam kết rèn luyện",
    });
  };

  const handleCompleteStage4FromDialog = () => {
    if (!selectedProfile) return;

    if (!stage4Form.commitmentContent || !stage4Form.mentorName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin cam kết!",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deadline5 = calculateDeadline(today, STAGE_CONFIG[5].duration);

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        return {
          ...p,
          currentStage: 5,
          stage4: {
            ...p.stage4,
            status: "completed" as const,
            endDate: today,
            commitmentDate: stage4Form.startDate,
            mentorName: stage4Form.mentorName,
            mentorPosition: stage4Form.mentorPosition,
            note: stage4Form.commitmentContent,
            completionRate: 100,
          },
          stage5: {
            ...p.stage5,
            status: "in_progress" as const,
            startDate: today,
            deadline: deadline5,
            note: "Chờ hoàn thiện hồ sơ",
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Hoàn thành giai đoạn 4",
      description: "Đã chuyển sang giai đoạn 5: Hoàn thiện hồ sơ",
    });
  };
  // Thêm các hàm này vào sau handleCompleteStage4FromDialog (khoảng dòng 650):

// ============= OPEN STAGE 5 DIALOG (HOÀN THIỆN HỒ SƠ) =============
const handleOpenStage5Dialog = (profile: DevelopmentProfile) => {
  setSelectedProfile(profile);
  setSelectedStage(5);
  
  // Load existing personal info
  setStage5PersonalForm({
    fullName: profile.personalInfo.fullName,
    dateOfBirth: profile.personalInfo.dateOfBirth,
    gender: profile.personalInfo.gender,
    idNumber: profile.personalInfo.idNumber,
    phone: profile.personalInfo.phone,
    email: profile.personalInfo.email,
    address: profile.personalInfo.address,
    unit: profile.personalInfo.unit,
    position: profile.personalInfo.position,
    education: "",
    workplace: "",
  });
  
  // Reset documents
  setStage5Documents({
    lyLichTuKhai: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    nhanXetChiUy: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    camKetRenLuyen: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    chungChiLopHoc: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    phieuNhanXet: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    kiemDiemPhanDau: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
    anhCMND: { uploaded: false, file: null, fileName: "", uploadedDate: "" },
  });
  
  setIsStageDialogOpen(true);
};

// ============= HANDLE DOCUMENT UPLOAD =============
const handleDocumentUpload = (docKey: string, file: File | null) => {
  if (!file) return;

  const today = new Date().toISOString().split('T')[0];
  
  setStage5Documents({
    ...stage5Documents,
    [docKey]: {
      uploaded: true,
      file: file,
      fileName: file.name,
      uploadedDate: today,
    },
  });

  toast({
    title: "✅ Upload thành công",
    description: `Đã tải lên file: ${file.name}`,
  });
};

// ============= HANDLE DOCUMENT DELETE =============
const handleDocumentDelete = (docKey: string) => {
  setStage5Documents({
    ...stage5Documents,
    [docKey]: {
      uploaded: false,
      file: null,
      fileName: "",
      uploadedDate: "",
    },
  });

  toast({
    title: "🗑️ Đã xóa file",
    description: "File đã được xóa khỏi danh sách",
  });
};

// ============= ADD WORK HISTORY =============
const handleAddWorkHistory = () => {
  setStage5WorkHistory([
    ...stage5WorkHistory,
    { id: Date.now(), period: "", position: "", unit: "", description: "" }
  ]);
};

// ============= REMOVE WORK HISTORY =============
const handleRemoveWorkHistory = (id: number) => {
  setStage5WorkHistory(stage5WorkHistory.filter(item => item.id !== id));
};

// ============= UPDATE WORK HISTORY =============
const handleUpdateWorkHistory = (id: number, field: string, value: string) => {
  setStage5WorkHistory(stage5WorkHistory.map(item => 
    item.id === id ? { ...item, [field]: value } : item
  ));
};

// ============= CALCULATE STAGE 5 COMPLETION =============
const calculateStage5Completion = () => {
  const uploadedDocs = Object.values(stage5Documents).filter(doc => doc.uploaded).length;
  const totalDocs = STAGE5_DOCUMENTS.length;
  
  // Check personal info
  const personalInfoFilled = stage5PersonalForm.fullName && 
                            stage5PersonalForm.dateOfBirth && 
                            stage5PersonalForm.idNumber &&
                            stage5PersonalForm.phone &&
                            stage5PersonalForm.email;
  
  // Check work history
  const workHistoryFilled = stage5WorkHistory.length > 0 && 
                           stage5WorkHistory.every(item => item.period && item.position);
  
  // Check evaluation
  const evaluationFilled = stage5Evaluation.partyEvaluation && 
                          stage5Evaluation.trainingResult;
  
  const sectionsComplete = [
    personalInfoFilled,
    workHistoryFilled,
    evaluationFilled,
    uploadedDocs === totalDocs
  ].filter(Boolean).length;
  
  return {
    uploadedDocs,
    totalDocs,
    sectionsComplete,
    totalSections: 4,
    percentage: Math.round(((sectionsComplete / 4) * 100)),
    isComplete: sectionsComplete === 4,
  };
};

// ============= COMPLETE STAGE 5 =============
const handleCompleteStage5FromDialog = () => {
  if (!selectedProfile) return;

  const completion = calculateStage5Completion();
  
  if (!completion.isComplete) {
    toast({
      title: "⚠️ Chưa hoàn thiện",
      description: `Còn ${4 - completion.sectionsComplete} mục chưa hoàn thành. Vui lòng kiểm tra lại!`,
      variant: "destructive",
    });
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const deadline6 = calculateDeadline(today, STAGE_CONFIG[6].duration);

  const updatedProfiles = profiles.map(p => {
    if (p.id === selectedProfile.id) {
      return {
        ...p,
        currentStage: 6,
        personalInfo: {
          ...p.personalInfo,
          ...stage5PersonalForm,
        },
        stage5: {
          ...p.stage5,
          status: "completed" as const,
          endDate: today,
          completedCount: completion.uploadedDocs,
          completionRate: 100,
          reviewStatus: "approved" as const,
          note: "Đã hoàn thiện đầy đủ hồ sơ",
        },
        stage6: {
          ...p.stage6,
          status: "in_progress" as const,
          startDate: today,
          deadline: deadline6,
          note: "Chờ quyết định kết nạp",
        },
        updatedAt: today,
      };
    }
    return p;
  });

  setProfiles(updatedProfiles);
  setIsStageDialogOpen(false);
  setSelectedProfile(null);

  toast({
    title: "✅ Hoàn thành giai đoạn 5",
    description: "Hồ sơ đã được hoàn thiện. Chuyển sang giai đoạn 6: Quyết định kết nạp",
  });
};

  // ============= COMPLETE STAGE 1 =============
  const handleCompleteStage1 = (profile: DevelopmentProfile) => {
    const today = new Date().toISOString().split('T')[0];
    const deadline2 = calculateDeadline(today, STAGE_CONFIG[2].duration);

    const updatedProfiles = profiles.map(p => {
      if (p.id === profile.id) {
        return {
          ...p,
          currentStage: 2,
          stage1: {
            ...p.stage1,
            status: "completed" as const,
            endDate: today,
          },
          stage2: {
            ...p.stage2,
            status: "in_progress" as const,
            startDate: today,
            deadline: deadline2,
            note: "Chờ gán lớp học",
          },
          updatedAt: today,
        };
      }
      return p;
    });

    setProfiles(updatedProfiles);
    toast({
      title: "✅ Hoàn thành giai đoạn 1",
      description: "Đã chuyển sang giai đoạn 2: Lớp nhận thức",
    });
  };

  // ============= UPDATE STAGE (Generic) =============
  const handleUpdateStage = (stageNumber: number, updateData: any) => {
    if (!selectedProfile) return;

    const today = new Date().toISOString().split('T')[0];

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfile.id) {
        // Update specific stage based on stageNumber
        switch (stageNumber) {
          case 1:
            return {
              ...p,
              stage1: {
                ...p.stage1,
                ...updateData,
              },
              updatedAt: today,
            };
          case 2:
            return {
              ...p,
              stage2: {
                ...p.stage2,
                ...updateData,
              },
              updatedAt: today,
            };
          case 3:
            return {
              ...p,
              stage3: {
                ...p.stage3,
                ...updateData,
              },
              updatedAt: today,
            };
          case 4:
            return {
              ...p,
              stage4: {
                ...p.stage4,
                ...updateData,
              },
              updatedAt: today,
            };
          case 5:
            return {
              ...p,
              stage5: {
                ...p.stage5,
                ...updateData,
              },
              updatedAt: today,
            };
          case 6:
            return {
              ...p,
              stage6: {
                ...p.stage6,
                ...updateData,
              },
              updatedAt: today,
            };
          default:
            return p;
        }
      }
      return p;
    });

    setProfiles(updatedProfiles);
    setIsStageDialogOpen(false);
    setSelectedProfile(null);

    toast({
      title: "✅ Cập nhật thành công",
      description: `Đã cập nhật giai đoạn ${stageNumber}`,
    });
  };

  // ============= COMPLETE STAGE (Generic with auto-advance) =============
  const handleCompleteStage = (profile: DevelopmentProfile, stageNumber: number) => {
    const today = new Date().toISOString().split('T')[0];
    const nextStage = stageNumber + 1;

    if (nextStage > 6) {
      // Completed all stages
      const updatedProfiles = profiles.map(p => {
        if (p.id === profile.id) {
          // Update current stage
          switch (stageNumber) {
            case 1:
              return { ...p, status: "completed" as const, stage1: { ...p.stage1, status: "completed" as const, endDate: today }, updatedAt: today };
            case 2:
              return { ...p, status: "completed" as const, stage2: { ...p.stage2, status: "completed" as const, endDate: today }, updatedAt: today };
            case 3:
              return { ...p, status: "completed" as const, stage3: { ...p.stage3, status: "completed" as const, endDate: today }, updatedAt: today };
            case 4:
              return { ...p, status: "completed" as const, stage4: { ...p.stage4, status: "completed" as const, endDate: today }, updatedAt: today };
            case 5:
              return { ...p, status: "completed" as const, stage5: { ...p.stage5, status: "completed" as const, endDate: today }, updatedAt: today };
            case 6:
              return { ...p, status: "completed" as const, stage6: { ...p.stage6, status: "completed" as const, endDate: today }, updatedAt: today };
            default:
              return p;
          }
        }
        return p;
      });
      setProfiles(updatedProfiles);
      
      toast({
        title: "🎉 Hoàn thành toàn bộ quy trình",
        description: "Hồ sơ đã được chuyển sang Quản lý Đảng viên",
      });
      return;
    }

    const nextDeadline = calculateDeadline(today, STAGE_CONFIG[nextStage as keyof typeof STAGE_CONFIG].duration);

    const updatedProfiles = profiles.map(p => {
      if (p.id === profile.id) {
        // Complete current stage and start next stage
        switch (stageNumber) {
          case 1:
            return {
              ...p,
              currentStage: 2,
              stage1: { ...p.stage1, status: "completed" as const, endDate: today },
              stage2: { ...p.stage2, status: "in_progress" as const, startDate: today, deadline: nextDeadline },
              updatedAt: today,
            };
          case 2:
            return {
              ...p,
              currentStage: 3,
              stage2: { ...p.stage2, status: "completed" as const, endDate: today },
              stage3: { ...p.stage3, status: "in_progress" as const, startDate: today, deadline: nextDeadline },
              updatedAt: today,
            };
          case 3:
            return {
              ...p,
              currentStage: 4,
              stage3: { ...p.stage3, status: "completed" as const, endDate: today },
              stage4: { ...p.stage4, status: "in_progress" as const, startDate: today, deadline: nextDeadline },
              updatedAt: today,
            };
          case 4:
            return {
              ...p,
              currentStage: 5,
              stage4: { ...p.stage4, status: "completed" as const, endDate: today },
              stage5: { ...p.stage5, status: "in_progress" as const, startDate: today, deadline: nextDeadline },
              updatedAt: today,
            };
          case 5:
            return {
              ...p,
              currentStage: 6,
              stage5: { ...p.stage5, status: "completed" as const, endDate: today },
              stage6: { ...p.stage6, status: "in_progress" as const, startDate: today, deadline: nextDeadline },
              updatedAt: today,
            };
          case 6:
            return {
              ...p,
              status: "completed" as const,
              stage6: { ...p.stage6, status: "completed" as const, endDate: today },
              updatedAt: today,
            };
          default:
            return p;
        }
      }
      return p;
    });

    setProfiles(updatedProfiles);
    toast({
      title: `✅ Hoàn thành giai đoạn ${stageNumber}`,
      description: `Đã chuyển sang giai đoạn ${nextStage}: ${STAGE_CONFIG[nextStage as keyof typeof STAGE_CONFIG].name}`,
    });
  };

  // ============= FILTER & SEARCH =============
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.profileCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedStatus === "all") return matchesSearch;
    
    const statusMap: Record<string, number> = {
      "stage1": 1,
      "stage2": 2,
      "stage3": 3,
      "stage4": 4,
      "stage5": 5,
      "stage6": 6,
      "completed": 7,
    };
    
    return matchesSearch && profile.currentStage === statusMap[selectedStatus];
  });

  // ============= RENDER =============
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Quản lý Quy trình Kết nạp Đảng viên
          </h1>
          <p className="text-muted-foreground">
            Theo dõi toàn bộ vòng đời từ quần chúng ưu tú đến đảng viên chính thức
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Tạo hồ sơ mới
          </Button>
        </div>
      </div>

      {/* Pipeline Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {Object.entries(STAGE_CONFIG).map(([stageId, config]) => {
          const count = profiles.filter(p => p.currentStage === Number(stageId)).length;
          const Icon = config.icon;
          
          return (
            <Card key={stageId} className="relative overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full bg-${config.color}-100 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${config.color}-600`} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{count}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{config.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{config.duration} ngày
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hồ sơ ({filteredProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm kiếm theo tên hoặc mã hồ sơ..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo giai đoạn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="stage1">Giai đoạn 1</SelectItem>
                <SelectItem value="stage2">Giai đoạn 2</SelectItem>
                <SelectItem value="stage3">Giai đoạn 3</SelectItem>
                <SelectItem value="stage4">Giai đoạn 4</SelectItem>
                <SelectItem value="stage5">Giai đoạn 5</SelectItem>
                <SelectItem value="stage6">Giai đoạn 6</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profile Cards */}
          <div className="space-y-6">
            {filteredProfiles.length === 0 ? (
              // ...existing empty state...
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {searchQuery ? "Không tìm thấy hồ sơ" : "Chưa có hồ sơ nào"}
                </p>
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const progress = getOverallProgress(profile);
                
                return (
                  <Card key={profile.id} className="border-2 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {profile.personalInfo.fullName}
                            </h3>
                            <Badge variant="outline" className="font-mono">
                              {profile.profileCode}
                            </Badge>
                            {profile.status === "completed" && (
                              <Badge className="bg-success">Đã hoàn thành</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{profile.personalInfo.unit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{profile.stage1.introducerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(profile.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                              setSelectedProfile(profile);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </Button>
                        </div>
                      </div>

                      {/* Overall Progress */}
                      <div className="mb-6 bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-foreground">
                            Tiến độ tổng thể
                          </span>
                          <span className="text-lg font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Giai đoạn hiện tại: {profile.currentStage}/6 - {STAGE_CONFIG[profile.currentStage as keyof typeof STAGE_CONFIG].name}
                        </p>
                      </div>

                      {/* Timeline Stages */}
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((stageNum) => {
                          const stageKey = `stage${stageNum}` as keyof DevelopmentProfile;
                          const stageData = profile[stageKey] as StageData;
                          const config = STAGE_CONFIG[stageNum as keyof typeof STAGE_CONFIG];
                          const Icon = config.icon;
                          
                          return (
                            <div key={stageNum} className="relative">
                              <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                                stageData.status === "completed" 
                                  ? "border-success bg-success/5" 
                                  : stageData.status === "in_progress"
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : stageData.status === "failed"
                                  ? "border-destructive bg-destructive/5"
                                  : "border-muted bg-muted/20"
                              }`}>
                                {/* Stage Icon */}
                                <div className="flex-shrink-0">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStageStatusColor(stageData.status)}`}>
                                    {stageData.status === "completed" ? (
                                      <CheckCircle className="h-6 w-6" />
                                    ) : stageData.status === "in_progress" ? (
                                      <Clock className="h-6 w-6 animate-pulse" />
                                    ) : stageData.status === "failed" ? (
                                      <AlertCircle className="h-6 w-6" />
                                    ) : (
                                      <span className="text-lg font-bold">{stageNum}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Stage Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <h4 className="font-bold text-foreground">{config.name}</h4>
                                    
                                    {stageData.status === "completed" && (
                                      <Badge variant="outline" className="ml-auto bg-success/10 text-success border-success">
                                        ✓ Hoàn thành
                                      </Badge>
                                    )}
                                    {stageData.status === "in_progress" && (
                                      <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary">
                                        🔄 Đang thực hiện
                                      </Badge>
                                    )}
                                    {stageData.status === "pending" && (
                                      <Badge variant="outline" className="ml-auto">
                                        ⏳ Chưa bắt đầu
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Date Range */}
                                  {stageData.startDate && (
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Bắt đầu: {formatDate(stageData.startDate)}
                                      </span>
                                      {stageData.deadline && stageData.status !== "completed" && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          Deadline: {formatDate(stageData.deadline)}
                                        </span>
                                      )}
                                      {stageData.endDate && (
                                        <span className="flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          Hoàn thành: {formatDate(stageData.endDate)}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Note */}
                                  {stageData.note && (
                                    <p className="text-sm text-foreground mb-2">{stageData.note}</p>
                                  )}

                                  {/* Stage-specific info */}
                                  {stageNum === 2 && stageData.status !== "pending" && (
                                    <div className="text-sm text-muted-foreground">
                                      Lớp: {(stageData as Stage2Data).className || "Chưa gán"}
                                    </div>
                                  )}

                                  {stageNum === 3 && (stageData as Stage3Data).overallScore > 0 && (
                                    <div className="text-sm font-medium text-foreground">
                                      Điểm: {(stageData as Stage3Data).overallScore}/10 - 
                                      Xếp loại: {(stageData as Stage3Data).grade}
                                    </div>
                                  )}

                                  {stageNum === 4 && stageData.status === "in_progress" && (
                                    <div className="mt-2">
                                      <Progress value={(stageData as Stage4Data).completionRate} className="h-2" />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Hoàn thành: {(stageData as Stage4Data).completionRate}%
                                      </p>
                                    </div>
                                  )}

                                  {stageNum === 5 && stageData.status !== "pending" && (
                                    <div className="mt-2">
                                      <Progress value={(stageData as Stage5Data).completionRate} className="h-2" />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Hồ sơ: {(stageData as Stage5Data).completedCount}/{(stageData as Stage5Data).requiredCount} tài liệu
                                      </p>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  {stageData.status === "in_progress" && (
                                    <div className="flex gap-2 mt-3">
                                      {stageNum === 2 ? (
                                        // BUTTON ĐẶC BIỆT CHO GIAI ĐOẠN 2
                                        <Button 
                                          size="sm"
                                          onClick={() => handleOpenStage2Dialog(profile)}
                                          className="w-full"
                                        >
                                          <Edit className="h-3 w-3 mr-2" />
                                          Cập nhật thông tin lớp học
                                        </Button>
                                      ) : stageNum === 3 ? (
                                        <Button 
                                          size="sm"
                                          onClick={() => handleOpenStage3Dialog(profile)}
                                          className="w-full"
                                        >
                                          <Edit className="h-3 w-3 mr-2" />
                                          Cập nhật đánh giá
                                        </Button>
                                      ) : stageNum === 4 ? (
                                        <Button 
                                          size="sm"
                                          onClick={() => handleOpenStage4Dialog(profile)}
                                          className="w-full"
                                        >
                                          <Edit className="h-3 w-3 mr-2" />
                                          Cập nhật cam kết
                                        </Button>
                                      ) : stageNum === 5 ? (
                                        <Button 
                                          size="sm"
                                          onClick={() => handleOpenStage5Dialog(profile)}
                                          className="w-full"
                                        >
                                          <FileUp className="h-3 w-3 mr-2" />
                                          Hoàn thiện hồ sơ
                                        </Button>
                                      ) : (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedProfile(profile);
                                              setSelectedStage(stageNum);
                                              setIsStageDialogOpen(true);
                                            }}
                                          >
                                            <Edit className="h-3 w-3 mr-2" />
                                            Cập nhật
                                          </Button>
                                          <Button 
                                            size="sm"
                                            onClick={() => handleCompleteStage(profile, stageNum)}
                                          >
                                            <Check className="h-3 w-3 mr-2" />
                                            Hoàn thành
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Connector Line */}
                              {stageNum < 6 && (
                                <div className={`absolute left-6 top-[70px] w-0.5 h-6 ${
                                  stageData.status === "completed" ? "bg-success" : "bg-muted"
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo hồ sơ phát triển mới</DialogTitle>
            <DialogDescription>
              Giai đoạn 1: Ghi nhận thông tin quần chúng ưu tú
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* CHỈ 5 TRƯỜNG BẮT BUỘC */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={newProfileForm.fullName}
                onChange={(e) => setNewProfileForm({...newProfileForm, fullName: e.target.value})}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Đơn vị công tác <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit"
                value={newProfileForm.unit}
                onChange={(e) => setNewProfileForm({...newProfileForm, unit: e.target.value})}
                placeholder="Chi bộ Kinh doanh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introducedDate">
                Ngày giới thiệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="introducedDate"
                type="date"
                value={newProfileForm.introducedDate}
                onChange={(e) => setNewProfileForm({...newProfileForm, introducedDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introducerName">
                Người giới thiệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="introducerName"
                value={newProfileForm.introducerName}
                onChange={(e) => setNewProfileForm({...newProfileForm, introducerName: e.target.value})}
                placeholder="Trần Văn B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialRating">
                Kết quả đánh giá <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={newProfileForm.initialRating} 
                onValueChange={(value) => setNewProfileForm({...newProfileForm, initialRating: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kết quả đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Xuất sắc</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="average">Trung bình</SelectItem>
                  <SelectItem value="fair">Khá</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Lưu ý:</strong> Thông tin chi tiết khác sẽ được bổ sung ở 
                <strong className="text-foreground"> Giai đoạn 5: Hoàn thiện hồ sơ</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateProfile}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedProfile?.personalInfo.fullName}
              <Badge variant="outline">{selectedProfile?.profileCode}</Badge>
            </DialogTitle>
            <DialogDescription>
              Chi tiết toàn bộ quy trình phát triển
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Tài liệu</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Personal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Họ tên</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Ngày sinh</Label>
                      <p className="font-medium">{formatDate(selectedProfile.personalInfo.dateOfBirth)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">CMND/CCCD</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.idNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Số điện thoại</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Đơn vị</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.unit}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tiến độ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={getOverallProgress(selectedProfile)} className="h-4 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Giai đoạn {selectedProfile.currentStage}/6 - {STAGE_CONFIG[selectedProfile.currentStage as keyof typeof STAGE_CONFIG].name}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((stageNum) => {
                  const stageKey = `stage${stageNum}` as keyof DevelopmentProfile;
                  const stageData = selectedProfile[stageKey] as StageData;
                  const config = STAGE_CONFIG[stageNum as keyof typeof STAGE_CONFIG];
                  
                  return (
                    <Card key={stageNum} className={
                      stageData.status === "completed" ? "border-success" :
                      stageData.status === "in_progress" ? "border-primary" : ""
                    }>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageStatusColor(stageData.status)}`}>
                            {stageNum}
                          </span>
                          {config.name}
                          {stageData.status === "completed" && <CheckCircle className="h-5 w-5 text-success ml-auto" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        {stageData.startDate && (
                          <p><strong>Bắt đầu:</strong> {formatDate(stageData.startDate)}</p>
                        )}
                        {stageData.endDate && (
                          <p><strong>Kết thúc:</strong> {formatDate(stageData.endDate)}</p>
                        )}
                        {stageData.deadline && !stageData.endDate && (
                          <p><strong>Deadline:</strong> {formatDate(stageData.deadline)}</p>
                        )}
                        {stageData.note && (
                          <p><strong>Ghi chú:</strong> {stageData.note}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tài liệu đính kèm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Chức năng quản lý tài liệu sẽ được kích hoạt ở giai đoạn 5
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 2 DIALOG - CHỈ THÔNG TIN LỚP HỌC */}
      <Dialog open={isStageDialogOpen && selectedStage === 2} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Giai đoạn 2: Tham gia lớp nhận thức về Đảng
            </DialogTitle>
            <DialogDescription>
              Thông tin lớp học
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className">
                  Tên lớp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="className"
                  value={stage2Form.className}
                  onChange={(e) => setStage2Form({...stage2Form, className: e.target.value})}
                  placeholder="Lớp nhận thức về Đảng khóa 1/2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classCode">Mã lớp</Label>
                <Input
                  id="classCode"
                  value={stage2Form.classCode}
                  onChange={(e) => setStage2Form({...stage2Form, classCode: e.target.value})}
                  placeholder="LNT-2024-01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Ngày bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={stage2Form.startDate}
                  onChange={(e) => setStage2Form({...stage2Form, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Ngày kết thúc <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={stage2Form.endDate}
                  onChange={(e) => setStage2Form({...stage2Form, endDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Giảng viên</Label>
                <Input
                  id="instructor"
                  value={stage2Form.instructor}
                  onChange={(e) => setStage2Form({...stage2Form, instructor: e.target.value})}
                  placeholder="PGS.TS Nguyễn Văn A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  value={stage2Form.location}
                  onChange={(e) => setStage2Form({...stage2Form, location: e.target.value})}
                  placeholder="Hội trường A - Tầng 3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                value={stage2Form.note}
                onChange={(e) => setStage2Form({...stage2Form, note: e.target.value})}
                placeholder="Ghi chú về lớp học..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={handleUpdateStage2}>
              <Upload className="h-4 w-4 mr-2" />
              Lưu thông tin
            </Button>
            <Button onClick={handleCompleteStage2FromDialog}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 3 DIALOG - ĐÁNH GIÁ SAU LỚP HỌC */}
      <Dialog open={isStageDialogOpen && selectedStage === 3} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Giai đoạn 3: Đánh giá sau lớp học
            </DialogTitle>
            <DialogDescription>
              Đánh giá kết quả sau khi hoàn thành lớp: <strong>{stage3Form.className}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Người đánh giá */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Người đánh giá</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evaluator">Họ tên</Label>
                  <Input
                    id="evaluator"
                    value={stage3Form.evaluator}
                    onChange={(e) => setStage3Form({...stage3Form, evaluator: e.target.value})}
                    placeholder="PGS.TS Trần Văn B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluatorPosition">Chức vụ</Label>
                  <Input
                    id="evaluatorPosition"
                    value={stage3Form.evaluatorPosition}
                    onChange={(e) => setStage3Form({...stage3Form, evaluatorPosition: e.target.value})}
                    placeholder="Phó Bí thư"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Nội dung đánh giá */}
            <div className="space-y-2">
              <Label htmlFor="evaluationContent">Nội dung đánh giá</Label>
              <Textarea
                id="evaluationContent"
                value={stage3Form.evaluationContent}
                onChange={(e) => setStage3Form({...stage3Form, evaluationContent: e.target.value})}
                placeholder="Nhận xét chi tiết về quá trình học tập, thái độ, ý thức chính trị..."
                rows={4}
              />
            </div>

            <Separator />

            {/* Điểm đánh giá */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Điểm đánh giá (thang 10)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="politicalAwareness">Nhận thức chính trị</Label>
                  <Input
                    id="politicalAwareness"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={stage3Form.politicalAwareness}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const avg = (val + stage3Form.studyAttitude + stage3Form.moralQuality) / 3;
                      setStage3Form({
                        ...stage3Form, 
                        politicalAwareness: val,
                        overallScore: Math.round(avg * 10) / 10
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studyAttitude">Thái độ học tập</Label>
                  <Input
                    id="studyAttitude"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={stage3Form.studyAttitude}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const avg = (stage3Form.politicalAwareness + val + stage3Form.moralQuality) / 3;
                      setStage3Form({
                        ...stage3Form, 
                        studyAttitude: val,
                        overallScore: Math.round(avg * 10) / 10
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moralQuality">Phẩm chất đạo đức</Label>
                  <Input
                    id="moralQuality"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={stage3Form.moralQuality}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const avg = (stage3Form.politicalAwareness + stage3Form.studyAttitude + val) / 3;
                      setStage3Form({
                        ...stage3Form, 
                        moralQuality: val,
                        overallScore: Math.round(avg * 10) / 10
                      });
                    }}
                  />
                </div>
              </div>

              {/* Điểm tổng & Xếp loại */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Điểm tổng (tự động)</Label>
                  <Input
                    value={stage3Form.overallScore.toFixed(1)}
                    disabled
                    className="font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Xếp loại</Label>
                  <Select value={stage3Form.grade} onValueChange={(value: "A" | "B" | "C" | "D") => setStage3Form({...stage3Form, grade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Xuất sắc (8.5-10)</SelectItem>
                      <SelectItem value="B">B - Tốt (7.0-8.4)</SelectItem>
                      <SelectItem value="C">C - Khá (5.0-6.9)</SelectItem>
                      <SelectItem value="D">D - Không đạt (&lt;5.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Warning */}
            {stage3Form.overallScore > 0 && (
              <div className={`p-4 rounded-lg ${
                stage3Form.overallScore >= 5
                  ? "bg-success/10 border border-success"
                  : "bg-destructive/10 border border-destructive"
              }`}>
                <p className="text-sm font-medium">
                  {stage3Form.overallScore >= 5 
                    ? "✅ Đạt yêu cầu - Có thể chuyển giai đoạn tiếp theo"
                    : "❌ Chưa đạt - Cần xem xét lại hoặc học lại"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={handleUpdateStage3}>
              <Upload className="h-4 w-4 mr-2" />
              Lưu đánh giá
            </Button>
            <Button onClick={handleCompleteStage3FromDialog}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 4 DIALOG - CAM KẾT RÈN LUYỆN */}
      <Dialog open={isStageDialogOpen && selectedStage === 4} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Giai đoạn 4: Cam kết rèn luyện
            </DialogTitle>
            <DialogDescription>
              Cam kết và kế hoạch rèn luyện
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nội dung cam kết */}
            <div className="space-y-2">
              <Label htmlFor="commitmentContent">
                Nội dung cam kết <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="commitmentContent"
                value={stage4Form.commitmentContent}
                onChange={(e) => setStage4Form({...stage4Form, commitmentContent: e.target.value})}
                placeholder="Cam kết về việc rèn luyện đạo đức, lối sống, nâng cao nhận thức chính trị..."
                rows={6}
              />
            </div>

            <Separator />

            {/* Người hướng dẫn */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Người hướng dẫn</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mentorName">
                    Họ tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mentorName"
                    value={stage4Form.mentorName}
                    onChange={(e) => setStage4Form({...stage4Form, mentorName: e.target.value})}
                    placeholder="Đồng chí ABC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentorPosition">Chức vụ</Label>
                  <Input
                    id="mentorPosition"
                    value={stage4Form.mentorPosition}
                    onChange={(e) => setStage4Form({...stage4Form, mentorPosition: e.target.value})}
                    placeholder="Bí thư Chi bộ"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Thời gian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={stage4Form.startDate}
                  onChange={(e) => setStage4Form({...stage4Form, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày dự kiến hoàn thành</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={stage4Form.endDate}
                  onChange={(e) => setStage4Form({...stage4Form, endDate: e.target.value})}
                />
              </div>
            </div>

            <Separator />

            {/* File đính kèm */}
            <div className="space-y-2">
              <Label htmlFor="attachedFile">File cam kết đính kèm (PDF)</Label>
              <Input
                id="attachedFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {stage4Form.attachedFile && (
                <p className="text-xs text-muted-foreground">
                  ✓ Đã chọn: {stage4Form.attachedFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={handleUpdateStage4}>
              <Upload className="h-4 w-4 mr-2" />
              Lưu cam kết
            </Button>
            <Button onClick={handleCompleteStage4FromDialog}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo hồ sơ phát triển mới</DialogTitle>
            <DialogDescription>
              Giai đoạn 1: Ghi nhận thông tin quần chúng ưu tú
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* CHỈ 5 TRƯỜNG BẮT BUỘC */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={newProfileForm.fullName}
                onChange={(e) => setNewProfileForm({...newProfileForm, fullName: e.target.value})}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Đơn vị công tác <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit"
                value={newProfileForm.unit}
                onChange={(e) => setNewProfileForm({...newProfileForm, unit: e.target.value})}
                placeholder="Chi bộ Kinh doanh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introducedDate">
                Ngày giới thiệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="introducedDate"
                type="date"
                value={newProfileForm.introducedDate}
                onChange={(e) => setNewProfileForm({...newProfileForm, introducedDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introducerName">
                Người giới thiệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="introducerName"
                value={newProfileForm.introducerName}
                onChange={(e) => setNewProfileForm({...newProfileForm, introducerName: e.target.value})}
                placeholder="Trần Văn B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialRating">
                Kết quả đánh giá <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={newProfileForm.initialRating} 
                onValueChange={(value) => setNewProfileForm({...newProfileForm, initialRating: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kết quả đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Xuất sắc</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="average">Trung bình</SelectItem>
                  <SelectItem value="fair">Khá</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Lưu ý:</strong> Thông tin chi tiết khác sẽ được bổ sung ở 
                <strong className="text-foreground"> Giai đoạn 5: Hoàn thiện hồ sơ</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateProfile}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedProfile?.personalInfo.fullName}
              <Badge variant="outline">{selectedProfile?.profileCode}</Badge>
            </DialogTitle>
            <DialogDescription>
              Chi tiết toàn bộ quy trình phát triển
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Tài liệu</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Personal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Họ tên</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Ngày sinh</Label>
                      <p className="font-medium">{formatDate(selectedProfile.personalInfo.dateOfBirth)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">CMND/CCCD</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.idNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Số điện thoại</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Đơn vị</Label>
                      <p className="font-medium">{selectedProfile.personalInfo.unit}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tiến độ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={getOverallProgress(selectedProfile)} className="h-4 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Giai đoạn {selectedProfile.currentStage}/6 - {STAGE_CONFIG[selectedProfile.currentStage as keyof typeof STAGE_CONFIG].name}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((stageNum) => {
                  const stageKey = `stage${stageNum}` as keyof DevelopmentProfile;
                  const stageData = selectedProfile[stageKey] as StageData;
                  const config = STAGE_CONFIG[stageNum as keyof typeof STAGE_CONFIG];
                  
                  return (
                    <Card key={stageNum} className={
                      stageData.status === "completed" ? "border-success" :
                      stageData.status === "in_progress" ? "border-primary" : ""
                    }>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageStatusColor(stageData.status)}`}>
                            {stageNum}
                          </span>
                          {config.name}
                          {stageData.status === "completed" && <CheckCircle className="h-5 w-5 text-success ml-auto" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        {stageData.startDate && (
                          <p><strong>Bắt đầu:</strong> {formatDate(stageData.startDate)}</p>
                        )}
                        {stageData.endDate && (
                          <p><strong>Kết thúc:</strong> {formatDate(stageData.endDate)}</p>
                        )}
                        {stageData.deadline && !stageData.endDate && (
                          <p><strong>Deadline:</strong> {formatDate(stageData.deadline)}</p>
                        )}
                        {stageData.note && (
                          <p><strong>Ghi chú:</strong> {stageData.note}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tài liệu đính kèm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Chức năng quản lý tài liệu sẽ được kích hoạt ở giai đoạn 5
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 2 DIALOG - CHỈ THÔNG TIN LỚP HỌC */}
      <Dialog open={isStageDialogOpen && selectedStage === 2} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Giai đoạn 2: Tham gia lớp nhận thức về Đảng
            </DialogTitle>
            <DialogDescription>
              Thông tin lớp học
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className">
                  Tên lớp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="className"
                  value={stage2Form.className}
                  onChange={(e) => setStage2Form({...stage2Form, className: e.target.value})}
                  placeholder="Lớp nhận thức về Đảng khóa 1/2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classCode">Mã lớp</Label>
                <Input
                  id="classCode"
                  value={stage2Form.classCode}
                  onChange={(e) => setStage2Form({...stage2Form, classCode: e.target.value})}
                  placeholder="LNT-2024-01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Ngày bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={stage2Form.startDate}
                  onChange={(e) => setStage2Form({...stage2Form, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Ngày kết thúc <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={stage2Form.endDate}
                  onChange={(e) => setStage2Form({...stage2Form, endDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Giảng viên</Label>
                <Input
                  id="instructor"
                  value={stage2Form.instructor}
                  onChange={(e) => setStage2Form({...stage2Form, instructor: e.target.value})}
                  placeholder="PGS.TS Nguyễn Văn A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  value={stage2Form.location}
                  onChange={(e) => setStage2Form({...stage2Form, location: e.target.value})}
                  placeholder="Hội trường A - Tầng 3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                value={stage2Form.note}
                onChange={(e) => setStage2Form({...stage2Form, note: e.target.value})}
                placeholder="Ghi chú về lớp học..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={handleUpdateStage2}>
              <Upload className="h-4 w-4 mr-2" />
              Lưu thông tin
            </Button>
            <Button onClick={handleCompleteStage2FromDialog}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 3 DIALOG - ĐÁNH GIÁ SAU LỚP HỌC */}
      <Dialog open={isStageDialogOpen && selectedStage === 3} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Giai đoạn 3: Đánh giá sau lớp học
            </DialogTitle>
            <DialogDescription>
              Đánh giá kết quả sau khi hoàn thành lớp: <strong>{stage3Form.className}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Người đánh giá */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Người đánh giá</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evaluator">Họ tên</Label>
                  <Input
                    id="evaluator"
                    value={stage3Form.evaluator}
                    onChange={(e) => setStage3Form({...stage3Form, evaluator: e.target.value})}
                    placeholder="PGS.TS Trần Văn B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluatorPosition">Chức vụ</Label>
                  <Input
                    id="evaluatorPosition"
                    value={stage3Form.evaluatorPosition}
                    onChange={(e) => setStage3Form({...stage3Form, evaluatorPosition: e.target.value})}
                    placeholder="Phó Bí thư"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Nội dung đánh giá */}
            <div className="space-y-2">
              <Label htmlFor="evaluationContent">Nội dung đánh giá</Label>
              <Textarea
                id="evaluationContent"
                value={stage3Form.evaluationContent}
                onChange={(e) => setStage3Form({...stage3Form, evaluationContent: e.target.value})}
                placeholder="Nhận xét chi tiết về quá trình học tập, thái độ, ý thức chính trị..."
                rows={4}
              />
            </div>

            <Separator />

            {/* Điểm đánh giá */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Điểm đánh giá (thang 10)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="politicalAwareness">Nhận thức chính trị</Label>
                  <Input
                    id="politicalAwareness"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={stage3Form.politicalAwareness}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const avg = (val + stage3Form.studyAttitude + stage3Form.moralQuality) / 3;
                      setStage3Form({
                        ...stage3Form, 
                        politicalAwareness: val,
                        overallScore: Math.round(avg * 10) / 10
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studyAttitude">Thái độ học tập</Label>
                  <Input
                    id="studyAttitude"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={stage3Form.studyAttitude}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const avg = (stage3Form.politicalAwareness + val + stage3Form.moralQuality) / 3;
                      setStage3Form({
                        ...stage3Form, 
                        studyAttitude: val,
                        overallScore: Math.round(avg * 10) / 10
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moralQuality">Phẩm chất đạo đức</Label>
                  <Input
                    id="moralQuality"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={stage3Form.moralQuality}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const avg = (stage3Form.politicalAwareness + stage3Form.studyAttitude + val) / 3;
                      setStage3Form({
                        ...stage3Form, 
                        moralQuality: val,
                        overallScore: Math.round(avg * 10) / 10
                      });
                    }}
                  />
                </div>
              </div>

              {/* Điểm tổng & Xếp loại */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Điểm tổng (tự động)</Label>
                  <Input
                    value={stage3Form.overallScore.toFixed(1)}
                    disabled
                    className="font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Xếp loại</Label>
                  <Select value={stage3Form.grade} onValueChange={(value: "A" | "B" | "C" | "D") => setStage3Form({...stage3Form, grade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Xuất sắc (8.5-10)</SelectItem>
                      <SelectItem value="B">B - Tốt (7.0-8.4)</SelectItem>
                      <SelectItem value="C">C - Khá (5.0-6.9)</SelectItem>
                      <SelectItem value="D">D - Không đạt (&lt;5.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Warning */}
            {stage3Form.overallScore > 0 && (
              <div className={`p-4 rounded-lg ${
                stage3Form.overallScore >= 5
                  ? "bg-success/10 border border-success"
                  : "bg-destructive/10 border border-destructive"
              }`}>
                <p className="text-sm font-medium">
                  {stage3Form.overallScore >= 5 
                    ? "✅ Đạt yêu cầu - Có thể chuyển giai đoạn tiếp theo"
                    : "❌ Chưa đạt - Cần xem xét lại hoặc học lại"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={handleUpdateStage3}>
              <Upload className="h-4 w-4 mr-2" />
              Lưu đánh giá
            </Button>
            <Button onClick={handleCompleteStage3FromDialog}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 4 DIALOG - CAM KẾT RÈN LUYỆN */}
      <Dialog open={isStageDialogOpen && selectedStage === 4} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Giai đoạn 4: Cam kết rèn luyện
            </DialogTitle>
            <DialogDescription>
              Cam kết và kế hoạch rèn luyện
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nội dung cam kết */}
            <div className="space-y-2">
              <Label htmlFor="commitmentContent">
                Nội dung cam kết <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="commitmentContent"
                value={stage4Form.commitmentContent}
                onChange={(e) => setStage4Form({...stage4Form, commitmentContent: e.target.value})}
                placeholder="Cam kết về việc rèn luyện đạo đức, lối sống, nâng cao nhận thức chính trị..."
                rows={6}
              />
            </div>

            <Separator />

            {/* Người hướng dẫn */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Người hướng dẫn</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mentorName">
                    Họ tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mentorName"
                    value={stage4Form.mentorName}
                    onChange={(e) => setStage4Form({...stage4Form, mentorName: e.target.value})}
                    placeholder="Đồng chí ABC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentorPosition">Chức vụ</Label>
                  <Input
                    id="mentorPosition"
                    value={stage4Form.mentorPosition}
                    onChange={(e) => setStage4Form({...stage4Form, mentorPosition: e.target.value})}
                    placeholder="Bí thư Chi bộ"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Thời gian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={stage4Form.startDate}
                  onChange={(e) => setStage4Form({...stage4Form, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày dự kiến hoàn thành</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={stage4Form.endDate}
                  onChange={(e) => setStage4Form({...stage4Form, endDate: e.target.value})}
                />
              </div>
            </div>

            <Separator />

            {/* File đính kèm */}
            <div className="space-y-2">
              <Label htmlFor="attachedFile">File cam kết đính kèm (PDF)</Label>
              <Input
                id="attachedFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {stage4Form.attachedFile && (
                <p className="text-xs text-muted-foreground">
                  ✓ Đã chọn: {stage4Form.attachedFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button variant="secondary" onClick={handleUpdateStage4}>
              <Upload className="h-4 w-4 mr-2" />
              Lưu cam kết
            </Button>
            <Button onClick={handleCompleteStage4FromDialog}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STAGE 5 DIALOG - HOÀN THIỆN HỒ SƠ */}
      <Dialog open={isStageDialogOpen && selectedStage === 5} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Giai đoạn 5: Hoàn thiện hồ sơ cá nhân
            </DialogTitle>
            <DialogDescription>
              Tổng hợp đầy đủ thông tin và tài liệu để hoàn thiện hồ sơ kết nạp
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="work">Quá trình công tác</TabsTrigger>
              <TabsTrigger value="evaluation">Kết quả đánh giá</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu đính kèm</TabsTrigger>
            </TabsList>

            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên đầy đủ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={stage5PersonalForm.fullName}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, fullName: e.target.value})}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      Ngày sinh <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={stage5PersonalForm.dateOfBirth}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, dateOfBirth: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select 
                      value={stage5PersonalForm.gender} 
                      onValueChange={(value: "male" | "female") => setStage5PersonalForm({...stage5PersonalForm, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">
                      CMND/CCCD <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="idNumber"
                      value={stage5PersonalForm.idNumber}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, idNumber: e.target.value})}
                      placeholder="001095012345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={stage5PersonalForm.phone}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, phone: e.target.value})}
                      placeholder="0912345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={stage5PersonalForm.email}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, email: e.target.value})}
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Địa chỉ thường trú</Label>
                    <Input
                      id="address"
                      value={stage5PersonalForm.address}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, address: e.target.value})}
                      placeholder="123 Nguyễn Trãi, Hà Nội"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Đơn vị công tác</Label>
                    <Input
                      id="unit"
                      value={stage5PersonalForm.unit}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, unit: e.target.value})}
                      placeholder="Phòng Kế hoạch"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Chức vụ</Label>
                    <Input
                      id="position"
                      value={stage5PersonalForm.position}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, position: e.target.value})}
                      placeholder="Chuyên viên"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Trình độ học vấn</Label>
                    <Select 
                      value={stage5PersonalForm.education} 
                      onValueChange={(value) => setStage5PersonalForm({...stage5PersonalForm, education: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high_school">THPT</SelectItem>
                        <SelectItem value="college">Cao đẳng</SelectItem>
                        <SelectItem value="bachelor">Đại học</SelectItem>
                        <SelectItem value="master">Thạc sĩ</SelectItem>
                        <SelectItem value="phd">Tiến sĩ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workplace">Nơi làm việc hiện tại</Label>
                    <Input
                      id="workplace"
                      value={stage5PersonalForm.workplace}
                      onChange={(e) => setStage5PersonalForm({...stage5PersonalForm, workplace: e.target.value})}
                      placeholder="Công ty ABC"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Các trường có dấu <span className="text-destructive">*</span> là bắt buộc
                </p>
              </div>
            </TabsContent>

            {/* TAB 2: QUÁ TRÌNH CÔNG TÁC */}
            <TabsContent value="work" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Quá trình học tập, công tác
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={handleAddWorkHistory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stage5WorkHistory.map((item, index) => (
                    <Card key={item.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold">Mục {index + 1}</h4>
                          {stage5WorkHistory.length > 1 && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRemoveWorkHistory(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              Thời gian <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              value={item.period}
                              onChange={(e) => handleUpdateWorkHistory(item.id, 'period', e.target.value)}
                              placeholder="01/2020 - 12/2022"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>
                              Chức vụ/Vị trí <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              value={item.position}
                              onChange={(e) => handleUpdateWorkHistory(item.id, 'position', e.target.value)}
                              placeholder="Nhân viên kinh doanh"
                            />
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Đơn vị/Tổ chức</Label>
                            <Input
                              value={item.unit}
                              onChange={(e) => handleUpdateWorkHistory(item.id, 'unit', e.target.value)}
                              placeholder="Công ty TNHH ABC"
                            />
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Mô tả công việc</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => handleUpdateWorkHistory(item.id, 'description', e.target.value)}
                              placeholder="Mô tả chi tiết công việc và trách nhiệm..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            {/* TAB 3: KẾT QUẢ RÈN LUYỆN, ĐÁNH GIÁ */}
            <TabsContent value="evaluation" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Kết quả rèn luyện và đánh giá
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="partyEvaluation">
                      Nhận xét của Chi bộ <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="partyEvaluation"
                      value={stage5Evaluation.partyEvaluation}
                      onChange={(e) => setStage5Evaluation({...stage5Evaluation, partyEvaluation: e.target.value})}
                      placeholder="Nhận xét về ý thức chính trị, phẩm chất đạo đức, thái độ học tập và rèn luyện..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unionEvaluation">Nhận xét của Đoàn thể</Label>
                    <Textarea
                      id="unionEvaluation"
                      value={stage5Evaluation.unionEvaluation}
                      onChange={(e) => setStage5Evaluation({...stage5Evaluation, unionEvaluation: e.target.value})}
                      placeholder="Nhận xét từ Công đoàn, Đoàn thanh niên..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainingResult">
                      Kết quả quá trình rèn luyện <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="trainingResult"
                      value={stage5Evaluation.trainingResult}
                      onChange={(e) => setStage5Evaluation({...stage5Evaluation, trainingResult: e.target.value})}
                      placeholder="Tổng hợp kết quả cam kết rèn luyện, những tiến bộ đạt được..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mentorComment">Nhận xét của đảng viên hướng dẫn</Label>
                    <Textarea
                      id="mentorComment"
                      value={stage5Evaluation.mentorComment}
                      onChange={(e) => setStage5Evaluation({...stage5Evaluation, mentorComment: e.target.value})}
                      placeholder="Nhận xét từ đảng viên hướng dẫn về quá trình rèn luyện..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* TAB 4: TÀI LIỆU ĐÍNH KÈM */}
            <TabsContent value="documents" className="space-y-4 mt-4">
              {/* Progress Summary */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Tiến độ upload tài liệu</span>
                    <span className="text-2xl font-bold text-primary">
                      {Object.values(stage5Documents).filter(d => d.uploaded).length}/{STAGE5_DOCUMENTS.length}
                    </span>
                  </div>
                  <Progress 
                    value={(Object.values(stage5Documents).filter(d => d.uploaded).length / STAGE5_DOCUMENTS.length) * 100} 
                    className="h-3 mb-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((Object.values(stage5Documents).filter(d => d.uploaded).length / STAGE5_DOCUMENTS.length) * 100)}% hoàn thành
                  </p>
                </CardContent>
              </Card>

              {/* Document Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left font-semibold text-sm w-12">STT</th>
                      <th className="p-3 text-left font-semibold text-sm">Tên tài liệu</th>
                      <th className="p-3 text-center font-semibold text-sm w-40">File đính kèm</th>
                      <th className="p-3 text-center font-semibold text-sm w-32">Trạng thái</th>
                      <th className="p-3 text-center font-semibold text-sm w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAGE5_DOCUMENTS.map((doc, index) => {
                      const docData = stage5Documents[doc.key];
                      
                      return (
                        <tr key={doc.key} className="border-t hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-center font-medium">{index + 1}</td>
                          
                          <td className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{doc.label}</p>
                                {doc.required && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    Bắt buộc
                                  </Badge>
                                )}
                                {docData.uploaded && docData.uploadedDate && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    📅 {formatDate(docData.uploadedDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-3">
                            {docData.uploaded ? (
                              <div className="flex items-center justify-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-xs truncate max-w-[100px]" title={docData.fileName}>
                                  {docData.fileName}
                                </span>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <label className="cursor-pointer">
                                  <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDocumentUpload(doc.key, file);
                                    }}
                                  />
                                  <Button size="sm" variant="outline" className="gap-2" asChild>
                                    <span>
                                      <Upload className="h-3 w-3" />
                                      Upload
                                    </span>
                                  </Button>
                                </label>
                              </div>
                            )}
                          </td>
                          
                          <td className="p-3 text-center">
                            {docData.uploaded ? (
                              <Badge className="bg-success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã nộp
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Thiếu
                              </Badge>
                            )}
                          </td>
                          
                          <td className="p-3 text-center">
                            {docData.uploaded ? (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    toast({
                                      title: "Xem file",
                                      description: docData.fileName,
                                    });
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDocumentDelete(doc.key)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Warning Note */}
              <div className="p-4 rounded-lg border bg-warning/10 border-warning">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">Lưu ý quan trọng:</p>
                    <ul className="text-xs space-y-1 list-disc ml-4">
                      <li>Tất cả 7 tài liệu đều bắt buộc phải upload</li>
                      <li>File chấp nhận: PDF, DOC, DOCX, JPG, PNG</li>
                      <li>Kích thước tối đa: 10MB/file</li>
                      <li>Đảm bảo file rõ ràng, đầy đủ thông tin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Overall Progress Summary */}
          <Card className="border-2 border-primary/20 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {calculateStage5Completion().sectionsComplete}/4
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tiến độ hoàn thiện tổng thể</p>
                    <p className="text-sm text-muted-foreground">
                      {calculateStage5Completion().percentage}% - {
                        calculateStage5Completion().isComplete 
                          ? "✅ Sẵn sàng hoàn thành" 
                          : `Còn ${4 - calculateStage5Completion().sectionsComplete} mục chưa xong`
                      }
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Thông tin", done: stage5PersonalForm.fullName && stage5PersonalForm.dateOfBirth && stage5PersonalForm.idNumber },
                    { label: "Công tác", done: stage5WorkHistory.length > 0 && stage5WorkHistory.every(i => i.period && i.position) },
                    { label: "Đánh giá", done: stage5Evaluation.partyEvaluation && stage5Evaluation.trainingResult },
                    { label: "Tài liệu", done: Object.values(stage5Documents).filter(d => d.uploaded).length === STAGE5_DOCUMENTS.length },
                  ].map((section, idx) => (
                    <div key={idx} className="text-center">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                        section.done ? "bg-success text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {section.done ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <p className="text-xs">{section.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Đóng
            </Button>
            <Button 
              onClick={handleCompleteStage5FromDialog}
              disabled={!calculateStage5Completion().isComplete}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Hoàn thành hồ sơ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}        