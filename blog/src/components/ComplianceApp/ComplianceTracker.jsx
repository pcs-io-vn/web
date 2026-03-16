import { useState, useMemo, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// DATA — ISO 27001:2022 Controls (Annex A — 93 controls, 4 themes)
// ISO 42001:2023 Controls + M365 Adoption Score mapping
// ═══════════════════════════════════════════════════════════════════════════

const COMPANY_SIZES = [
  { id: "solo", label: "Solo (1 người)", icon: "👤", max: 1 },
  { id: "micro", label: "Micro (2–9)", icon: "👥", max: 9 },
  { id: "small", label: "Nhỏ (10–49)", icon: "🏢", max: 49 },
  { id: "medium", label: "Vừa (50+)", icon: "🏗", max: 999 },
];

const FRAMEWORKS = [
  { id: "iso27001", label: "ISO 27001:2022", color: "#0EA5E9", icon: "🔐", desc: "Hệ thống quản lý ATTT" },
  { id: "iso42001", label: "ISO 42001:2023", color: "#8B5CF6", icon: "🤖", desc: "Quản lý hệ thống AI" },
  { id: "m365", label: "M365 Adoption Score", color: "#10B981", icon: "☁️", desc: "Microsoft 365 usage score" },
];

// ISO 27001:2022 — Annex A (simplified, grouped by theme)
const ISO27001_CONTROLS = [
  // Theme A: Organizational (A.5 — 37 controls)
  { id:"5.1",  theme:"org",  title:"Chính sách ATTT",            effort:"low",   sizes:["solo","micro","small","medium"], m365:"", iso42:"",     desc:"Ban hành và phổ biến chính sách ATTT"},
  { id:"5.2",  theme:"org",  title:"Vai trò & trách nhiệm ATTT", effort:"low",   sizes:["solo","micro","small","medium"], m365:"", iso42:"",     desc:"Phân công rõ ràng ai chịu trách nhiệm gì"},
  { id:"5.3",  theme:"org",  title:"Phân tách nhiệm vụ",         effort:"med",   sizes:["small","medium"],               m365:"", iso42:"",     desc:"Tránh xung đột lợi ích — cần ≥2 người"},
  { id:"5.4",  theme:"org",  title:"Trách nhiệm quản lý",        effort:"low",   sizes:["solo","micro","small","medium"], m365:"", iso42:"5.2",  desc:"Lãnh đạo cam kết với ATTT"},
  { id:"5.5",  theme:"org",  title:"Liên lạc cơ quan chức năng", effort:"low",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Quy trình liên hệ CA khi có sự cố"},
  { id:"5.7",  theme:"org",  title:"Thông tin tình báo đe dọa",  effort:"med",   sizes:["small","medium"],               m365:"", iso42:"",     desc:"Thu thập & phân tích threat intelligence"},
  { id:"5.8",  theme:"org",  title:"ATTT trong quản lý dự án",   effort:"med",   sizes:["small","medium"],               m365:"", iso42:"",     desc:"Tích hợp ATTT vào vòng đời dự án"},
  { id:"5.9",  theme:"org",  title:"Kiểm kê tài sản thông tin",  effort:"med",   sizes:["solo","micro","small","medium"], m365:"Endpoint Analytics", iso42:"", desc:"Danh sách tài sản + owner"},
  { id:"5.10", theme:"org",  title:"Sử dụng tài sản được chấp nhận",effort:"low",sizes:["solo","micro","small","medium"], m365:"", iso42:"",     desc:"AUP — Acceptable Use Policy"},
  { id:"5.11", theme:"org",  title:"Trả lại tài sản",            effort:"low",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Quy trình khi nhân viên nghỉ việc"},
  { id:"5.12", theme:"org",  title:"Phân loại thông tin",        effort:"med",   sizes:["micro","small","medium"],       m365:"Microsoft Purview", iso42:"", desc:"Confidential / Internal / Public"},
  { id:"5.13", theme:"org",  title:"Gán nhãn thông tin",         effort:"med",   sizes:["small","medium"],               m365:"Microsoft Purview", iso42:"", desc:"Label tài liệu, email, file"},
  { id:"5.14", theme:"org",  title:"Chuyển giao thông tin",      effort:"med",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Quy tắc chia sẻ thông tin nội/ngoại bộ"},
  { id:"5.15", theme:"org",  title:"Kiểm soát truy cập",         effort:"high",  sizes:["solo","micro","small","medium"], m365:"Entra ID", iso42:"6.5", desc:"Who can access what — IAM policy"},
  { id:"5.16", theme:"org",  title:"Quản lý danh tính",          effort:"med",   sizes:["solo","micro","small","medium"], m365:"Entra ID",  iso42:"",    desc:"Identity lifecycle management"},
  { id:"5.17", theme:"org",  title:"Thông tin xác thực",         effort:"med",   sizes:["solo","micro","small","medium"], m365:"Entra ID MFA", iso42:"", desc:"Password policy + MFA"},
  { id:"5.18", theme:"org",  title:"Quyền truy cập",             effort:"med",   sizes:["solo","micro","small","medium"], m365:"Entra ID", iso42:"",    desc:"Principle of least privilege"},
  { id:"5.19", theme:"org",  title:"ATTT trong quan hệ NCC",     effort:"med",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Yêu cầu ATTT với nhà cung cấp"},
  { id:"5.23", theme:"org",  title:"ATTT dùng dịch vụ đám mây",  effort:"med",   sizes:["solo","micro","small","medium"], m365:"M365 Security Score", iso42:"", desc:"Cloud security baseline"},
  { id:"5.24", theme:"org",  title:"Lập kế hoạch ATTT sự cố",   effort:"med",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"IRP — Incident Response Plan"},
  { id:"5.25", theme:"org",  title:"Đánh giá & quyết định ATTT sự cố",effort:"med",sizes:["micro","small","medium"],    m365:"", iso42:"",     desc:"Phân loại mức độ nghiêm trọng sự cố"},
  { id:"5.26", theme:"org",  title:"Phản hồi sự cố ATTT",        effort:"high",  sizes:["small","medium"],               m365:"Defender XDR", iso42:"", desc:"Playbook xử lý sự cố"},
  { id:"5.29", theme:"org",  title:"ATTT trong gián đoạn",       effort:"high",  sizes:["small","medium"],               m365:"", iso42:"",     desc:"Business Continuity + ATTT"},
  { id:"5.30", theme:"org",  title:"Sẵn sàng CNTT cho BCMS",     effort:"high",  sizes:["medium"],                       m365:"", iso42:"",     desc:"IT readiness for business continuity"},
  { id:"5.31", theme:"org",  title:"Yêu cầu pháp lý & hợp đồng", effort:"med",  sizes:["solo","micro","small","medium"], m365:"", iso42:"5.4",  desc:"Tuân thủ luật pháp, hợp đồng ATTT"},
  { id:"5.33", theme:"org",  title:"Bảo vệ hồ sơ",               effort:"med",  sizes:["solo","micro","small","medium"], m365:"SharePoint / OneDrive", iso42:"", desc:"Retention policy cho dữ liệu quan trọng"},
  { id:"5.34", theme:"org",  title:"Quyền riêng tư & PII",       effort:"med",  sizes:["micro","small","medium"],       m365:"Microsoft Purview", iso42:"", desc:"Xử lý dữ liệu cá nhân (PDPA/GDPR)"},
  { id:"5.36", theme:"org",  title:"Tuân thủ chính sách ATTT",   effort:"med",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Kiểm tra, đo lường tuân thủ nội bộ"},
  { id:"5.37", theme:"org",  title:"Quy trình vận hành được lập thành văn bản",effort:"med",sizes:["micro","small","medium"],m365:"","iso42":"",desc:"SOP documentation"},
  // Theme B: People (A.6 — 8 controls)
  { id:"6.1",  theme:"ppl",  title:"Kiểm tra lý lịch",           effort:"med",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Background check khi tuyển dụng"},
  { id:"6.2",  theme:"ppl",  title:"Điều khoản tuyển dụng",      effort:"low",   sizes:["solo","micro","small","medium"], m365:"", iso42:"",     desc:"NDA, cam kết bảo mật trong hợp đồng"},
  { id:"6.3",  theme:"ppl",  title:"Nhận thức, giáo dục & đào tạo",effort:"med", sizes:["solo","micro","small","medium"], m365:"Viva Learning", iso42:"6.6.2",desc:"Security awareness training"},
  { id:"6.4",  theme:"ppl",  title:"Quy trình kỷ luật",          effort:"low",   sizes:["small","medium"],               m365:"", iso42:"",     desc:"Xử lý vi phạm ATTT"},
  { id:"6.5",  theme:"ppl",  title:"Trách nhiệm khi chấm dứt",   effort:"low",   sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Offboarding — thu hồi quyền truy cập"},
  { id:"6.6",  theme:"ppl",  title:"Thỏa thuận bảo mật & không tiết lộ",effort:"low",sizes:["solo","micro","small","medium"],m365:"","iso42":"",desc:"NDA với bên thứ ba"},
  { id:"6.7",  theme:"ppl",  title:"Làm việc từ xa",              effort:"med",  sizes:["solo","micro","small","medium"], m365:"Teams + Intune", iso42:"", desc:"Remote work security policy"},
  { id:"6.8",  theme:"ppl",  title:"Báo cáo sự kiện ATTT",       effort:"low",  sizes:["solo","micro","small","medium"], m365:"", iso42:"",     desc:"Kênh báo cáo sự cố cho nhân viên"},
  // Theme C: Physical (A.7 — 14 controls)
  { id:"7.1",  theme:"phy",  title:"Vành đai bảo mật vật lý",    effort:"med",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Kiểm soát vào ra văn phòng, server room"},
  { id:"7.2",  theme:"phy",  title:"Kiểm soát vào vật lý",       effort:"med",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Khóa, thẻ từ, camera"},
  { id:"7.3",  theme:"phy",  title:"Bảo vệ văn phòng, phòng",    effort:"low",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Clean desk, tủ khóa"},
  { id:"7.4",  theme:"phy",  title:"Giám sát vật lý",            effort:"med",  sizes:["small","medium"],               m365:"", iso42:"",     desc:"CCTV, phát hiện xâm nhập"},
  { id:"7.6",  theme:"phy",  title:"Làm việc trong khu vực bảo mật",effort:"low",sizes:["small","medium"],             m365:"", iso42:"",     desc:"Quy tắc trong phòng server/nhạy cảm"},
  { id:"7.7",  theme:"phy",  title:"Màn hình sạch & bàn sạch",  effort:"low",  sizes:["solo","micro","small","medium"], m365:"", iso42:"",     desc:"Lock screen, không để tài liệu trên bàn"},
  { id:"7.8",  theme:"phy",  title:"Vị trí & bảo vệ thiết bị",  effort:"low",  sizes:["solo","micro","small","medium"], m365:"Intune", iso42:"", desc:"Thiết bị được đặt đúng vị trí, bảo vệ"},
  { id:"7.9",  theme:"phy",  title:"Tài sản bên ngoài tổ chức",  effort:"low",  sizes:["solo","micro","small","medium"], m365:"Intune MDM", iso42:"", desc:"Laptop, điện thoại mang ra ngoài"},
  { id:"7.10", theme:"phy",  title:"Phương tiện lưu trữ",        effort:"med",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Quản lý USB, ổ cứng ngoài"},
  { id:"7.13", theme:"phy",  title:"Bảo trì thiết bị",           effort:"low",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Lịch bảo trì, sửa chữa thiết bị"},
  { id:"7.14", theme:"phy",  title:"Hủy hoặc tái sử dụng thiết bị",effort:"low",sizes:["solo","micro","small","medium"],m365:"","iso42":"",    desc:"Xóa dữ liệu trước khi thanh lý"},
  // Theme D: Technological (A.8 — 34 controls)
  { id:"8.1",  theme:"tech", title:"Thiết bị đầu cuối người dùng",effort:"med",  sizes:["solo","micro","small","medium"], m365:"Intune + Defender", iso42:"", desc:"Endpoint security — antivirus, patch"},
  { id:"8.2",  theme:"tech", title:"Quyền truy cập đặc quyền",   effort:"med",  sizes:["micro","small","medium"],       m365:"Entra PIM", iso42:"", desc:"Admin account management — PAM"},
  { id:"8.3",  theme:"tech", title:"Giới hạn truy cập thông tin", effort:"med",  sizes:["solo","micro","small","medium"], m365:"Entra ID RBAC", iso42:"", desc:"Need-to-know principle"},
  { id:"8.4",  theme:"tech", title:"Truy cập mã nguồn",          effort:"low",  sizes:["small","medium"],               m365:"Azure DevOps", iso42:"", desc:"Source code access control"},
  { id:"8.5",  theme:"tech", title:"Xác thực bảo mật",           effort:"med",  sizes:["solo","micro","small","medium"], m365:"Entra MFA", iso42:"",  desc:"MFA, SSO, passwordless"},
  { id:"8.6",  theme:"tech", title:"Quản lý năng lực",           effort:"low",  sizes:["small","medium"],               m365:"", iso42:"",     desc:"CPU, storage, bandwidth monitoring"},
  { id:"8.7",  theme:"tech", title:"Chống phần mềm độc hại",     effort:"med",  sizes:["solo","micro","small","medium"], m365:"Defender AV", iso42:"", desc:"Antimalware policy + EDR"},
  { id:"8.8",  theme:"tech", title:"Quản lý lỗ hổng kỹ thuật",  effort:"high", sizes:["micro","small","medium"],       m365:"Defender VM", iso42:"",  desc:"Patch management + vulnerability scanning"},
  { id:"8.9",  theme:"tech", title:"Quản lý cấu hình",           effort:"high", sizes:["micro","small","medium"],       m365:"Intune + RDPS", iso42:"",desc:"Configuration baseline — đây là RDPS!"},
  { id:"8.10", theme:"tech", title:"Xóa thông tin",              effort:"med",  sizes:["micro","small","medium"],       m365:"Microsoft Purview", iso42:"", desc:"Xóa dữ liệu khi không cần thiết"},
  { id:"8.11", theme:"tech", title:"Ẩn dữ liệu",                 effort:"high", sizes:["small","medium"],               m365:"", iso42:"",     desc:"Data masking, tokenization"},
  { id:"8.12", theme:"tech", title:"Ngăn chặn rò rỉ dữ liệu",   effort:"high", sizes:["small","medium"],               m365:"Defender DLP", iso42:"", desc:"DLP policy cho email, file, endpoint"},
  { id:"8.13", theme:"tech", title:"Sao lưu thông tin",          effort:"med",  sizes:["solo","micro","small","medium"], m365:"OneDrive + Azure Backup", iso42:"", desc:"Backup 3-2-1 rule"},
  { id:"8.14", theme:"tech", title:"Dự phòng cơ sở hạ tầng",    effort:"high", sizes:["medium"],                       m365:"", iso42:"",     desc:"Redundancy — HA, failover"},
  { id:"8.15", theme:"tech", title:"Ghi nhật ký",                effort:"med",  sizes:["micro","small","medium"],       m365:"Microsoft Sentinel", iso42:"", desc:"Security logging + SIEM"},
  { id:"8.16", theme:"tech", title:"Giám sát hoạt động",         effort:"high", sizes:["small","medium"],               m365:"Defender XDR", iso42:"", desc:"Security monitoring + alerting"},
  { id:"8.17", theme:"tech", title:"Đồng bộ đồng hồ",           effort:"low",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"NTP sync cho audit log chính xác"},
  { id:"8.18", theme:"tech", title:"Sử dụng chương trình tiện ích",effort:"low", sizes:["small","medium"],              m365:"", iso42:"",     desc:"Kiểm soát công cụ quản trị đặc quyền"},
  { id:"8.19", theme:"tech", title:"Cài đặt phần mềm trên hệ thống vận hành",effort:"med",sizes:["micro","small","medium"],m365:"Intune App Mgmt",iso42:"",desc:"Software installation control"},
  { id:"8.20", theme:"tech", title:"Bảo mật mạng",               effort:"high", sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Network segmentation, firewall"},
  { id:"8.21", theme:"tech", title:"Bảo mật dịch vụ mạng",       effort:"med",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Bảo vệ DNS, VPN, proxy"},
  { id:"8.22", theme:"tech", title:"Phân tách mạng",             effort:"high", sizes:["small","medium"],               m365:"", iso42:"",     desc:"VLAN, network zones"},
  { id:"8.23", theme:"tech", title:"Lọc web",                    effort:"med",  sizes:["solo","micro","small","medium"], m365:"Defender SmartScreen", iso42:"", desc:"Web filtering — RDPS browser policy!"},
  { id:"8.24", theme:"tech", title:"Sử dụng mật mã",             effort:"med",  sizes:["micro","small","medium"],       m365:"BitLocker + TLS", iso42:"", desc:"Encryption policy + key management"},
  { id:"8.25", theme:"tech", title:"Chu kỳ phát triển bảo mật",  effort:"high", sizes:["small","medium"],               m365:"Azure DevOps", iso42:"", desc:"Secure SDLC"},
  { id:"8.26", theme:"tech", title:"Yêu cầu bảo mật ứng dụng",  effort:"high", sizes:["small","medium"],               m365:"", iso42:"",     desc:"AppSec requirements"},
  { id:"8.28", theme:"tech", title:"Lập trình bảo mật",          effort:"high", sizes:["small","medium"],               m365:"", iso42:"",     desc:"Secure coding standards"},
  { id:"8.29", theme:"tech", title:"Kiểm thử bảo mật trong phát triển",effort:"high",sizes:["small","medium"],         m365:"", iso42:"",     desc:"SAST, DAST, penetration testing"},
  { id:"8.32", theme:"tech", title:"Quản lý thay đổi",           effort:"med",  sizes:["micro","small","medium"],       m365:"", iso42:"",     desc:"Change management process"},
  { id:"8.33", theme:"tech", title:"Thông tin kiểm thử",         effort:"med",  sizes:["small","medium"],               m365:"", iso42:"",     desc:"Test data management"},
  { id:"8.34", theme:"tech", title:"Bảo vệ hệ thống thông tin trong kiểm toán",effort:"med",sizes:["small","medium"],  m365:"", iso42:"",     desc:"Audit access controls"},
];

// ISO 42001:2023 — AI Management specific additions
const ISO42001_CONTROLS = [
  { id:"ai.5.2", title:"Chính sách AI",                    effort:"low",  sizes:["solo","micro","small","medium"], desc:"Ban hành chính sách sử dụng AI trong tổ chức"},
  { id:"ai.5.4", title:"Vai trò trách nhiệm AI",           effort:"low",  sizes:["solo","micro","small","medium"], desc:"Ai chịu trách nhiệm về AI risk"},
  { id:"ai.6.1", title:"Đánh giá rủi ro AI",               effort:"med",  sizes:["solo","micro","small","medium"], desc:"Xác định rủi ro khi dùng AI (ChatGPT, Copilot...)"},
  { id:"ai.6.2", title:"Mục tiêu AI",                      effort:"low",  sizes:["micro","small","medium"],       desc:"Đặt mục tiêu sử dụng AI có trách nhiệm"},
  { id:"ai.6.3", title:"Tác động AI đến con người",        effort:"med",  sizes:["micro","small","medium"],       desc:"Human impact assessment khi deploy AI"},
  { id:"ai.6.5", title:"Kiểm soát truy cập hệ thống AI",  effort:"med",  sizes:["solo","micro","small","medium"], desc:"Ai được dùng AI tool nào, với data gì"},
  { id:"ai.6.6.2",title:"Đào tạo nhận thức AI",           effort:"low",  sizes:["solo","micro","small","medium"], desc:"Training về AI safety & responsible use"},
  { id:"ai.8.1", title:"Vận hành hệ thống AI",             effort:"high", sizes:["small","medium"],               desc:"AI system lifecycle management"},
  { id:"ai.8.4", title:"Tài liệu hệ thống AI",             effort:"med",  sizes:["micro","small","medium"],       desc:"Document AI models, data sources, decision logic"},
  { id:"ai.9.1", title:"Giám sát hiệu suất AI",            effort:"med",  sizes:["micro","small","medium"],       desc:"Monitor AI accuracy, bias, drift"},
  { id:"ai.10.1",title:"Cải tiến liên tục AI",             effort:"low",  sizes:["micro","small","medium"],       desc:"Review và cải thiện AI policy định kỳ"},
];

// M365 Adoption Score dimensions
const M365_DIMENSIONS = [
  { id:"communication", label:"Communication",       icon:"💬", score:0,  tools:["Teams","Outlook","Yammer"],      controls:["6.3","8.23","5.14"] },
  { id:"meetings",      label:"Meetings & calls",    icon:"📹", score:0,  tools:["Teams Meetings","Whiteboard"],   controls:["6.7","7.7"] },
  { id:"content",       label:"Content collaboration",icon:"📄",score:0,  tools:["SharePoint","OneDrive","Loop"],  controls:["5.33","8.13","5.12"] },
  { id:"teamwork",      label:"Teamwork",             icon:"👥", score:0,  tools:["Teams","Channels","Apps"],       controls:["6.7","5.14"] },
  { id:"mobility",      label:"Mobility",             icon:"📱", score:0,  tools:["Intune","M365 Mobile"],          controls:["7.9","8.1","8.5"] },
  { id:"endpoint",      label:"Endpoint Analytics",  icon:"💻", score:0,  tools:["Intune","Endpoint Manager"],     controls:["8.1","8.8","8.9"] },
  { id:"network",       label:"Network connectivity", icon:"🌐", score:0,  tools:["Network Insights"],              controls:["8.20","8.21"] },
  { id:"apps",          label:"Microsoft 365 Apps",  icon:"⚙️", score:0,  tools:["Office Apps","Update Rings"],    controls:["8.19","8.8"] },
];

const THEME_META = {
  org:  { label: "Tổ chức",     color: "#0EA5E9", icon: "🏛" },
  ppl:  { label: "Con người",   color: "#F59E0B", icon: "👥" },
  phy:  { label: "Vật lý",      color: "#10B981", icon: "🏢" },
  tech: { label: "Công nghệ",   color: "#8B5CF6", icon: "⚙️" },
};

const EFFORT_META = {
  low:  { label: "Dễ",    color: "#10B981", bg: "#10B98118" },
  med:  { label: "Vừa",   color: "#F59E0B", bg: "#F59E0B18" },
  high: { label: "Khó",   color: "#EF4444", bg: "#EF444418" },
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const S = {
  bg: "#070B12",
  card: "#0D1420",
  cardBorder: "rgba(255,255,255,0.07)",
  text: "#E8EDF5",
  muted: "rgba(255,255,255,0.38)",
  faint: "rgba(255,255,255,0.08)",
  accent: "#0EA5E9",
};

const font = "'IBM Plex Mono', 'Fira Code', monospace";

// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING WIZARD
// ═══════════════════════════════════════════════════════════════════════════
function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    companyName: "", size: "", frameworks: [], m365: false, useAI: false,
  });

  const canNext = () => {
    if (step === 0) return data.companyName.trim().length > 0;
    if (step === 1) return data.size !== "";
    if (step === 2) return data.frameworks.length > 0;
    return true;
  };

  const toggleFramework = (id) => {
    setData(d => ({
      ...d, frameworks: d.frameworks.includes(id)
        ? d.frameworks.filter(f => f !== id)
        : [...d.frameworks, id]
    }));
  };

  return (
    <div style={{
      minHeight: "100vh", background: S.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: font, padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 4,
              background: i <= step ? S.accent : S.faint,
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Step 0: Company name */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 11, color: S.accent, letterSpacing: 3, textTransform:"uppercase", marginBottom: 10 }}>Bắt đầu</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: S.text, marginBottom: 8 }}>Tổ chức của bạn là gì?</div>
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 32 }}>Tên này chỉ dùng để hiển thị trong dashboard của bạn</div>
            <input
              value={data.companyName}
              onChange={e => setData(d => ({...d, companyName: e.target.value}))}
              placeholder="Ví dụ: KIENA Corp, ABC Startup..."
              style={{
                width: "100%", background: S.card, border: `1px solid ${S.cardBorder}`,
                borderRadius: 10, padding: "14px 16px", fontSize: 14,
                color: S.text, fontFamily: font, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Step 1: Company size */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, color: S.accent, letterSpacing: 3, textTransform:"uppercase", marginBottom: 10 }}>Quy mô</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: S.text, marginBottom: 8 }}>Tổ chức có bao nhiêu người?</div>
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 28 }}>Chúng tôi sẽ ẩn các control không phù hợp với quy mô của bạn</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COMPANY_SIZES.map(s => (
                <div key={s.id} onClick={() => setData(d => ({...d, size: s.id}))}
                  style={{
                    border: `1px solid ${data.size === s.id ? S.accent : S.cardBorder}`,
                    borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                    background: data.size === s.id ? `${S.accent}12` : S.card,
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{s.label}</div>
                  {data.size === s.id && <div style={{ marginLeft:"auto", color: S.accent, fontSize: 16 }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Frameworks */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 11, color: S.accent, letterSpacing: 3, textTransform:"uppercase", marginBottom: 10 }}>Tiêu chuẩn</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: S.text, marginBottom: 8 }}>Bạn muốn tuân thủ tiêu chuẩn nào?</div>
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 28 }}>Chọn một hoặc nhiều — có thể thêm sau</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FRAMEWORKS.map(f => {
                const active = data.frameworks.includes(f.id);
                return (
                  <div key={f.id} onClick={() => toggleFramework(f.id)}
                    style={{
                      border: `1px solid ${active ? f.color : S.cardBorder}`,
                      borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                      background: active ? `${f.color}10` : S.card,
                      display: "flex", alignItems: "center", gap: 14,
                      transition: "all 0.15s",
                    }}>
                    <span style={{ fontSize: 22 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? f.color : S.text }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: S.muted }}>{f.desc}</div>
                    </div>
                    {active && <div style={{ marginLeft:"auto", color: f.color, fontSize: 16 }}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Options */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 11, color: S.accent, letterSpacing: 3, textTransform:"uppercase", marginBottom: 10 }}>Tuỳ chọn</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: S.text, marginBottom: 8 }}>Một vài câu hỏi nhanh</div>
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 28 }}>Giúp cá nhân hoá roadmap cho bạn</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key:"m365", icon:"☁️", q:"Công ty đang dùng Microsoft 365?", sub:"Teams, SharePoint, OneDrive, Exchange Online..." },
                { key:"useAI", icon:"🤖", q:"Công ty đang dùng AI tools?", sub:"ChatGPT, Microsoft Copilot, GitHub Copilot..." },
              ].map(item => (
                <div key={item.key} onClick={() => setData(d => ({...d, [item.key]: !d[item.key]}))}
                  style={{
                    border: `1px solid ${data[item.key] ? S.accent : S.cardBorder}`,
                    borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                    background: data[item.key] ? `${S.accent}10` : S.card,
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{item.q}</div>
                    <div style={{ fontSize: 11, color: S.muted }}>{item.sub}</div>
                  </div>
                  <div style={{
                    marginLeft:"auto", width: 24, height: 24, borderRadius: 6,
                    border: `1px solid ${data[item.key] ? S.accent : S.cardBorder}`,
                    background: data[item.key] ? S.accent : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink: 0,
                  }}>
                    {data[item.key] && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 36 }}>
          {step > 0
            ? <button onClick={() => setStep(s => s-1)} style={{
                background:"none", border:`1px solid ${S.cardBorder}`, color:S.muted,
                borderRadius: 10, padding:"10px 22px", cursor:"pointer", fontFamily:font, fontSize:13,
              }}>← Quay lại</button>
            : <div />
          }
          <button
            disabled={!canNext()}
            onClick={() => step < 3 ? setStep(s => s+1) : onComplete(data)}
            style={{
              background: canNext() ? S.accent : S.faint,
              border:"none", color: canNext() ? "#fff" : S.muted,
              borderRadius: 10, padding:"10px 28px", cursor: canNext() ? "pointer" : "default",
              fontFamily:font, fontSize:13, fontWeight:700, transition:"all 0.15s",
            }}
          >{step < 3 ? "Tiếp theo →" : "🚀 Tạo Dashboard"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ config, controlStatus: externalStatus, setControlStatus: externalSetStatus, onReset }) {
  const [activeTab, setActiveTab] = useState("overview");
  // Use external controlStatus if provided (from wrapper), else internal
  const [internalStatus, setInternalStatus] = useState({});
  const controlStatus = externalStatus ?? internalStatus;
  const setControlStatus = externalSetStatus ?? setInternalStatus; // id -> "done"|"partial"|"notdone"|"na"
  const [activeFramework, setActiveFramework] = useState("iso27001");
  const [activeTheme, setActiveTheme] = useState("all");
  const [activeEffort, setActiveEffort] = useState("all");
  const [m365Scores, setM365Scores] = useState(
    Object.fromEntries(M365_DIMENSIONS.map(d => [d.id, 0]))
  );
  const [expandedControl, setExpandedControl] = useState(null);

  // Filter controls by company size
  const relevantControls = useMemo(() =>
    ISO27001_CONTROLS.filter(c => c.sizes.includes(config.size)),
    [config.size]
  );

  const relevantAI = useMemo(() =>
    ISO42001_CONTROLS.filter(c => c.sizes.includes(config.size)),
    [config.size]
  );

  // Stats
  const stats = useMemo(() => {
    const total = relevantControls.length;
    const done = relevantControls.filter(c => controlStatus[c.id] === "done").length;
    const partial = relevantControls.filter(c => controlStatus[c.id] === "partial").length;
    const na = relevantControls.filter(c => controlStatus[c.id] === "na").length;
    const applicable = total - na;
    const score = applicable > 0 ? Math.round(((done + partial * 0.5) / applicable) * 100) : 0;
    return { total, done, partial, na, applicable, score };
  }, [relevantControls, controlStatus]);

  const aiStats = useMemo(() => {
    const total = relevantAI.length;
    const done = relevantAI.filter(c => controlStatus[c.id] === "done").length;
    const partial = relevantAI.filter(c => controlStatus[c.id] === "partial").length;
    const score = total > 0 ? Math.round(((done + partial * 0.5) / total) * 100) : 0;
    return { total, done, partial, score };
  }, [relevantAI, controlStatus]);

  const m365Score = useMemo(() => {
    const vals = Object.values(m365Scores);
    return Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
  }, [m365Scores]);

  // Filter displayed controls
  const filteredControls = useMemo(() => {
    let list = relevantControls;
    if (activeTheme !== "all") list = list.filter(c => c.theme === activeTheme);
    if (activeEffort !== "all") list = list.filter(c => c.effort === activeEffort);
    return list;
  }, [relevantControls, activeTheme, activeEffort]);

  const setStatus = (id, status) => setControlStatus(s => ({...s, [id]: status}));

  const STATUS_OPTS = [
    { id:"done",    label:"✅ Đã làm",     color:"#10B981", bg:"#10B98120" },
    { id:"partial", label:"⚠ Một phần",   color:"#F59E0B", bg:"#F59E0B20" },
    { id:"notdone", label:"❌ Chưa làm",   color:"#EF4444", bg:"#EF444420" },
    { id:"na",      label:"⊘ N/A",         color:"#64748B", bg:"#64748B20" },
  ];

  const tabs = [
    { id:"overview",   label:"📊 Tổng quan" },
    { id:"iso27001",   label:"🔐 ISO 27001" },
    ...(config.frameworks.includes("iso42001") ? [{ id:"iso42001", label:"🤖 ISO 42001" }] : []),
    ...(config.m365 ? [{ id:"m365", label:"☁️ M365 Score" }] : []),
    { id:"roadmap",    label:"🗺 Lộ trình" },
  ];

  // Score ring component
  const ScoreRing = ({ score, color, size=80, label }) => {
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const progress = (score / 100) * circ;
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={S.faint} strokeWidth={6} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
            style={{ transition:"stroke-dasharray 0.5s" }}
          />
        </svg>
        <div style={{ position:"relative", marginTop:-(size/2+6+6), height:size/2, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:size/4, fontWeight:700, color, lineHeight:1 }}>{score}%</div>
        </div>
        {label && <div style={{ fontSize:10, color:S.muted, marginTop:size/2-4 }}>{label}</div>}
      </div>
    );
  };

  return (
    <div style={{
      minHeight:"100vh", background:S.bg, color:S.text,
      fontFamily:font, fontSize:13,
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom:`1px solid ${S.cardBorder}`,
        padding:"12px 24px", display:"flex", alignItems:"center", gap:16,
        background:"rgba(7,11,18,0.95)", position:"sticky", top:0, zIndex:10,
      }}>
        <div style={{
          width:30, height:30, borderRadius:8,
          background:"linear-gradient(135deg,#0EA5E9,#7C3AED)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
        }}>⬡</div>
        <div>
          <div style={{ fontSize:10, color:S.muted, letterSpacing:2, textTransform:"uppercase" }}>PCS Compliance</div>
          <div style={{ fontSize:14, fontWeight:700 }}>{config.companyName}</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:4, alignItems:"center" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background:"none", border:`1px solid ${activeTab===t.id ? S.accent : "transparent"}`,
              color: activeTab===t.id ? S.text : S.muted,
              borderRadius:8, padding:"5px 12px", cursor:"pointer",
              fontFamily:font, fontSize:11,
              background: activeTab===t.id ? `${S.accent}14` : "none",
            }}>{t.label}</button>
          ))}
          {onReset && (
            <button onClick={onReset} style={{
              background:"none", border:"1px solid rgba(239,68,68,0.3)",
              color:"rgba(239,68,68,0.6)", borderRadius:8, padding:"5px 10px",
              cursor:"pointer", fontFamily:font, fontSize:10, marginLeft:8,
            }} title="Xoá data tenant này">⊗ Reset</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>

        {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, color:S.accent, letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>Dashboard</div>
              <div style={{ fontSize:22, fontWeight:700 }}>Tổng quan tuân thủ</div>
              <div style={{ fontSize:12, color:S.muted, marginTop:4 }}>
                Quy mô: {COMPANY_SIZES.find(s=>s.id===config.size)?.label} ·
                {relevantControls.length} controls phù hợp với tổ chức của bạn
              </div>
            </div>

            {/* Score cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", gap:16, marginBottom:28 }}>
              {/* ISO 27001 */}
              {config.frameworks.includes("iso27001") && (
                <div style={{ background:S.card, border:`1px solid ${S.cardBorder}`, borderRadius:14, padding:"20px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                    <span style={{ fontSize:18 }}>🔐</span>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0EA5E9" }}>ISO 27001:2022</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <ScoreRing score={stats.score} color="#0EA5E9" size={72} />
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <div style={{ fontSize:11, color:S.muted }}>{stats.done} / {stats.applicable} hoàn thành</div>
                      <div style={{ display:"flex", gap:4 }}>
                        <span style={{ fontSize:10, background:"#10B98120", color:"#10B981", padding:"2px 6px", borderRadius:4 }}>✅ {stats.done}</span>
                        <span style={{ fontSize:10, background:"#F59E0B20", color:"#F59E0B", padding:"2px 6px", borderRadius:4 }}>⚠ {stats.partial}</span>
                        <span style={{ fontSize:10, background:"#EF444420", color:"#EF4444", padding:"2px 6px", borderRadius:4 }}>❌ {stats.applicable - stats.done - stats.partial}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ISO 42001 */}
              {config.frameworks.includes("iso42001") && (
                <div style={{ background:S.card, border:`1px solid ${S.cardBorder}`, borderRadius:14, padding:"20px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                    <span style={{ fontSize:18 }}>🤖</span>
                    <div style={{ fontSize:12, fontWeight:700, color:"#8B5CF6" }}>ISO 42001:2023</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <ScoreRing score={aiStats.score} color="#8B5CF6" size={72} />
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <div style={{ fontSize:11, color:S.muted }}>{aiStats.done} / {aiStats.total} hoàn thành</div>
                      <div style={{ display:"flex", gap:4 }}>
                        <span style={{ fontSize:10, background:"#10B98120", color:"#10B981", padding:"2px 6px", borderRadius:4 }}>✅ {aiStats.done}</span>
                        <span style={{ fontSize:10, background:"#F59E0B20", color:"#F59E0B", padding:"2px 6px", borderRadius:4 }}>⚠ {aiStats.partial}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* M365 */}
              {config.m365 && (
                <div style={{ background:S.card, border:`1px solid ${S.cardBorder}`, borderRadius:14, padding:"20px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                    <span style={{ fontSize:18 }}>☁️</span>
                    <div style={{ fontSize:12, fontWeight:700, color:"#10B981" }}>M365 Adoption</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <ScoreRing score={m365Score} color="#10B981" size={72} />
                    <div style={{ fontSize:11, color:S.muted }}>Nhập điểm từ M365 Admin Center</div>
                  </div>
                </div>
              )}

              {/* Quick wins */}
              <div style={{ background:S.card, border:`1px solid #F59E0B30`, borderRadius:14, padding:"20px 24px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#F59E0B", marginBottom:12 }}>⚡ Quick wins</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {relevantControls
                    .filter(c => c.effort==="low" && !controlStatus[c.id])
                    .slice(0,4)
                    .map(c => (
                      <div key={c.id} style={{ fontSize:11, color:S.muted, display:"flex", gap:6 }}>
                        <span style={{ color:"#F59E0B", flexShrink:0 }}>{c.id}</span>
                        <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</span>
                      </div>
                    ))}
                  <div style={{ fontSize:10, color:"#F59E0B", marginTop:4, cursor:"pointer" }}
                    onClick={() => { setActiveTab("iso27001"); setActiveEffort("low"); }}>
                    Xem tất cả →
                  </div>
                </div>
              </div>
            </div>

            {/* Progress by theme */}
            {config.frameworks.includes("iso27001") && (
              <div style={{ background:S.card, border:`1px solid ${S.cardBorder}`, borderRadius:14, padding:"20px 24px", marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Tiến độ theo nhóm control</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
                  {Object.entries(THEME_META).map(([tid, meta]) => {
                    const group = relevantControls.filter(c => c.theme === tid);
                    const done = group.filter(c => controlStatus[c.id]==="done").length;
                    const partial = group.filter(c => controlStatus[c.id]==="partial").length;
                    const na = group.filter(c => controlStatus[c.id]==="na").length;
                    const applicable = group.length - na;
                    const pct = applicable > 0 ? Math.round(((done + partial*0.5)/applicable)*100) : 0;
                    return (
                      <div key={tid} style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <span style={{ fontSize:18 }}>{meta.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                            <span style={{ fontSize:12, fontWeight:600 }}>{meta.label}</span>
                            <span style={{ fontSize:11, color:meta.color, fontWeight:700 }}>{pct}%</span>
                          </div>
                          <div style={{ height:6, background:S.faint, borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:meta.color, borderRadius:3, transition:"width 0.4s" }} />
                          </div>
                          <div style={{ fontSize:10, color:S.muted, marginTop:3 }}>{done}/{applicable} controls</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* M365 ↔ ISO 27001 mapping hint */}
            {config.m365 && config.frameworks.includes("iso27001") && (
              <div style={{ background:`#0EA5E908`, border:`1px solid #0EA5E930`, borderRadius:14, padding:"16px 20px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.accent, marginBottom:10 }}>
                  🔗 M365 có thể chứng minh cho {relevantControls.filter(c=>c.m365).length} ISO 27001 controls
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {relevantControls.filter(c=>c.m365).slice(0,8).map(c => (
                    <span key={c.id} style={{
                      fontSize:10, background:`${S.accent}14`, color:S.accent,
                      padding:"3px 8px", borderRadius:20, border:`1px solid ${S.accent}30`,
                    }}>{c.id} ← {c.m365}</span>
                  ))}
                  <span style={{ fontSize:10, color:S.muted, padding:"3px 8px" }}>+{relevantControls.filter(c=>c.m365).length - 8} khác</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ISO 27001 CHECKLIST ───────────────────────────────────────── */}
        {activeTab === "iso27001" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11, color:"#0EA5E9", letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Annex A Controls</div>
                <div style={{ fontSize:20, fontWeight:700 }}>ISO 27001:2022 Checklist</div>
                <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>{filteredControls.length} controls hiển thị · {stats.score}% hoàn thành</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {/* Theme filter */}
                <div style={{ display:"flex", gap:4 }}>
                  {[{id:"all",label:"Tất cả"}, ...Object.entries(THEME_META).map(([id,m])=>({id,label:m.label}))].map(t => (
                    <button key={t.id} onClick={() => setActiveTheme(t.id)} style={{
                      background: activeTheme===t.id ? `#0EA5E914` : "none",
                      border:`1px solid ${activeTheme===t.id ? "#0EA5E9" : S.cardBorder}`,
                      color: activeTheme===t.id ? S.text : S.muted,
                      borderRadius:8, padding:"4px 10px", cursor:"pointer",
                      fontFamily:font, fontSize:10,
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Effort filter */}
            <div style={{ display:"flex", gap:6, marginBottom:16 }}>
              {[{id:"all",label:"Mọi độ khó"}, ...Object.entries(EFFORT_META).map(([id,m])=>({id,label:m.label}))].map(e => (
                <button key={e.id} onClick={() => setActiveEffort(e.id)} style={{
                  background: activeEffort===e.id ? S.faint : "none",
                  border:`1px solid ${activeEffort===e.id ? S.accent : S.cardBorder}`,
                  color: activeEffort===e.id ? S.text : S.muted,
                  borderRadius:20, padding:"3px 10px", cursor:"pointer",
                  fontFamily:font, fontSize:10,
                }}>{e.label}</button>
              ))}
            </div>

            {/* Control rows */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {filteredControls.map(c => {
                const status = controlStatus[c.id] || "notdone";
                const expanded = expandedControl === c.id;
                const statusOpt = STATUS_OPTS.find(s => s.id === status) || STATUS_OPTS[2];
                const themeM = THEME_META[c.theme];
                const effortM = EFFORT_META[c.effort];
                return (
                  <div key={c.id} style={{
                    background:S.card,
                    border:`1px solid ${status==="done" ? "#10B98130" : status==="partial" ? "#F59E0B30" : S.cardBorder}`,
                    borderRadius:10, overflow:"hidden",
                    transition:"all 0.15s",
                  }}>
                    <div
                      onClick={() => setExpandedControl(expanded ? null : c.id)}
                      style={{ padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}
                    >
                      {/* ID */}
                      <span style={{ fontSize:10, color:themeM.color, fontWeight:700, minWidth:32 }}>{c.id}</span>
                      {/* Title */}
                      <span style={{ flex:1, fontSize:12, fontWeight:600,
                        color: status==="done" ? "#10B981" : status==="na" ? S.muted : S.text,
                        textDecoration: status==="na" ? "line-through" : "none",
                      }}>{c.title}</span>
                      {/* Tags */}
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        {c.m365 && (
                          <span style={{ fontSize:9, color:"#10B981", background:"#10B98112", padding:"1px 6px", borderRadius:10, border:"1px solid #10B98130" }}>
                            M365
                          </span>
                        )}
                        {c.iso42 && (
                          <span style={{ fontSize:9, color:"#8B5CF6", background:"#8B5CF612", padding:"1px 6px", borderRadius:10, border:"1px solid #8B5CF630" }}>
                            42001
                          </span>
                        )}
                        <span style={{ fontSize:9, background:effortM.bg, color:effortM.color, padding:"2px 7px", borderRadius:10 }}>
                          {effortM.label}
                        </span>
                        <span style={{ fontSize:11 }}>{expanded ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* Expanded */}
                    {expanded && (
                      <div style={{ padding:"0 16px 14px", borderTop:`1px solid ${S.cardBorder}` }}>
                        <div style={{ fontSize:11, color:S.muted, marginBottom:14, marginTop:10, lineHeight:1.6 }}>{c.desc}</div>
                        {c.m365 && (
                          <div style={{ fontSize:11, color:"#10B981", marginBottom:10, background:"#10B98110", padding:"6px 10px", borderRadius:6 }}>
                            ☁️ Chứng minh được qua M365: <strong>{c.m365}</strong>
                          </div>
                        )}
                        {c.iso42 && (
                          <div style={{ fontSize:11, color:"#8B5CF6", marginBottom:10, background:"#8B5CF610", padding:"6px 10px", borderRadius:6 }}>
                            🤖 Liên kết ISO 42001: <strong>{c.iso42}</strong>
                          </div>
                        )}
                        {/* c.id 8.9 = RDPS highlight */}
                        {c.id === "8.9" && (
                          <div style={{ fontSize:11, color:"#F59E0B", marginBottom:10, background:"#F59E0B10", padding:"6px 10px", borderRadius:6 }}>
                            🔧 <strong>RDPS scripts</strong> trực tiếp chứng minh control này — Set-*.ps1 pairs từ repo JaxVN/RDPS
                          </div>
                        )}
                        {c.id === "8.23" && (
                          <div style={{ fontSize:11, color:"#F59E0B", marginBottom:10, background:"#F59E0B10", padding:"6px 10px", borderRadius:6 }}>
                            🌐 <strong>Browser Policy Generator</strong> — deploy edge/chrome policies là evidence cho control này
                          </div>
                        )}
                        {/* Status buttons */}
                        <div style={{ display:"flex", gap:6 }}>
                          {STATUS_OPTS.map(opt => (
                            <button key={opt.id} onClick={() => setStatus(c.id, opt.id)} style={{
                              background: status===opt.id ? opt.bg : "none",
                              border:`1px solid ${status===opt.id ? opt.color : S.cardBorder}`,
                              color: status===opt.id ? opt.color : S.muted,
                              borderRadius:8, padding:"5px 12px", cursor:"pointer",
                              fontFamily:font, fontSize:10, fontWeight: status===opt.id ? 700 : 400,
                            }}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ISO 42001 ─────────────────────────────────────────────────── */}
        {activeTab === "iso42001" && (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, color:"#8B5CF6", letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>AI Management</div>
              <div style={{ fontSize:20, fontWeight:700 }}>ISO 42001:2023 Checklist</div>
              <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>Quản lý AI có trách nhiệm — {aiStats.score}% hoàn thành</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {relevantAI.map(c => {
                const status = controlStatus[c.id] || "notdone";
                const expanded = expandedControl === c.id;
                const statusOpt = STATUS_OPTS.find(s => s.id === status) || STATUS_OPTS[2];
                const effortM = EFFORT_META[c.effort];
                return (
                  <div key={c.id} style={{
                    background:S.card,
                    border:`1px solid ${status==="done" ? "#8B5CF630" : S.cardBorder}`,
                    borderRadius:10, overflow:"hidden",
                  }}>
                    <div onClick={() => setExpandedControl(expanded ? null : c.id)}
                      style={{ padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:10, color:"#8B5CF6", fontWeight:700, minWidth:52 }}>{c.id}</span>
                      <span style={{ flex:1, fontSize:12, fontWeight:600, color: status==="done" ? "#8B5CF6" : S.text }}>{c.title}</span>
                      <span style={{ fontSize:9, background:effortM.bg, color:effortM.color, padding:"2px 7px", borderRadius:10 }}>{effortM.label}</span>
                      <span style={{ fontSize:11 }}>{expanded ? "▲" : "▼"}</span>
                    </div>
                    {expanded && (
                      <div style={{ padding:"0 16px 14px", borderTop:`1px solid ${S.cardBorder}` }}>
                        <div style={{ fontSize:11, color:S.muted, marginBottom:14, marginTop:10, lineHeight:1.6 }}>{c.desc}</div>
                        <div style={{ display:"flex", gap:6 }}>
                          {STATUS_OPTS.map(opt => (
                            <button key={opt.id} onClick={() => setStatus(c.id, opt.id)} style={{
                              background: status===opt.id ? opt.bg : "none",
                              border:`1px solid ${status===opt.id ? opt.color : S.cardBorder}`,
                              color: status===opt.id ? opt.color : S.muted,
                              borderRadius:8, padding:"5px 12px", cursor:"pointer",
                              fontFamily:font, fontSize:10, fontWeight: status===opt.id ? 700 : 400,
                            }}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── M365 SCORE ────────────────────────────────────────────────── */}
        {activeTab === "m365" && (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, color:"#10B981", letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Microsoft 365</div>
              <div style={{ fontSize:20, fontWeight:700 }}>Adoption Score</div>
              <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>Nhập điểm từ M365 Admin Center → admin.microsoft.com → Reports → Adoption Score</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
              {M365_DIMENSIONS.map(dim => (
                <div key={dim.id} style={{ background:S.card, border:`1px solid ${S.cardBorder}`, borderRadius:12, padding:"16px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <span style={{ fontSize:20 }}>{dim.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{dim.label}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{dim.tools.join(" · ")}</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:18, fontWeight:700, color:"#10B981" }}>{m365Scores[dim.id]}%</div>
                  </div>
                  <input type="range" min={0} max={100}
                    value={m365Scores[dim.id]}
                    onChange={e => setM365Scores(s => ({...s, [dim.id]: +e.target.value}))}
                    style={{ width:"100%", accentColor:"#10B981" }}
                  />
                  {/* ISO 27001 controls covered */}
                  <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:4 }}>
                    {dim.controls.map(cid => {
                      const ctrl = ISO27001_CONTROLS.find(c => c.id === cid);
                      return ctrl ? (
                        <span key={cid} style={{
                          fontSize:9, color:"#0EA5E9", background:"#0EA5E912",
                          padding:"2px 7px", borderRadius:10, border:"1px solid #0EA5E920",
                        }}>{cid}: {ctrl.title.substring(0,20)}…</span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, background:`#10B98108`, border:`1px solid #10B98130`, borderRadius:12, padding:"14px 18px", fontSize:12, color:S.muted, lineHeight:1.7 }}>
              💡 <strong style={{ color:S.text }}>Cách đọc M365 Adoption Score:</strong> Điểm cao = nhân viên đang dùng tốt công cụ M365.
              Nhiều M365 features được sử dụng = tự động chứng minh được nhiều ISO 27001 controls hơn.
              Ví dụ: Entra MFA enabled → chứng minh 5.17, 8.5; OneDrive backup → chứng minh 8.13.
            </div>
          </div>
        )}

        {/* ── ROADMAP ───────────────────────────────────────────────────── */}
        {activeTab === "roadmap" && (
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, color:"#F59E0B", letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Lộ trình</div>
              <div style={{ fontSize:20, fontWeight:700 }}>Kế hoạch thực hiện</div>
              <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>Tự động tạo dựa trên quy mô và tiến độ hiện tại của bạn</div>
            </div>

            {/* Phases */}
            {[
              { phase:"Giai đoạn 1", label:"Nền tảng", weeks:"Tuần 1–3", color:"#10B981",
                desc:"Các control dễ, impact cao — làm ngay không cần chi phí",
                controls: relevantControls.filter(c => c.effort==="low" && !controlStatus[c.id])
              },
              { phase:"Giai đoạn 2", label:"Cốt lõi kỹ thuật", weeks:"Tuần 4–8", color:"#0EA5E9",
                desc:"Controls kỹ thuật trung bình — cần thời gian và công cụ",
                controls: relevantControls.filter(c => c.effort==="med" && !controlStatus[c.id])
              },
              { phase:"Giai đoạn 3", label:"Nâng cao", weeks:"Tuần 9+", color:"#7C3AED",
                desc:"Controls phức tạp — cần chuyên gia hoặc công cụ chuyên biệt",
                controls: relevantControls.filter(c => c.effort==="high" && !controlStatus[c.id])
              },
            ].map(phase => (
              <div key={phase.phase} style={{
                background:S.card, border:`1px solid ${phase.color}30`,
                borderRadius:14, padding:"18px 22px", marginBottom:14,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{
                    width:8, height:8, borderRadius:"50%", background:phase.color, flexShrink:0,
                  }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>
                      {phase.phase}: {phase.label}
                      <span style={{ fontSize:10, color:S.muted, marginLeft:8 }}>{phase.weeks}</span>
                    </div>
                    <div style={{ fontSize:11, color:S.muted }}>{phase.desc}</div>
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:11, color:phase.color, fontWeight:700 }}>
                    {phase.controls.length} controls còn lại
                  </div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {phase.controls.slice(0,10).map(c => (
                    <span key={c.id} onClick={() => { setActiveTab("iso27001"); setExpandedControl(c.id); }}
                      style={{
                        fontSize:10, color:phase.color, background:`${phase.color}14`,
                        padding:"3px 9px", borderRadius:20, border:`1px solid ${phase.color}30`,
                        cursor:"pointer",
                      }}>{c.id}: {c.title.substring(0,22)}</span>
                  ))}
                  {phase.controls.length > 10 && (
                    <span style={{ fontSize:10, color:S.muted, padding:"3px 9px" }}>+{phase.controls.length-10} khác</span>
                  )}
                </div>
              </div>
            ))}

            {/* Connection to RDPS */}
            <div style={{ background:`#F59E0B08`, border:`1px solid #F59E0B30`, borderRadius:14, padding:"16px 20px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#F59E0B", marginBottom:10 }}>🔧 RDPS Integration</div>
              <div style={{ fontSize:11, color:S.muted, lineHeight:1.8 }}>
                Các controls <strong style={{ color:S.text }}>8.1</strong> (Endpoint), <strong style={{ color:S.text }}>8.9</strong> (Configuration Management),
                <strong style={{ color:S.text }}>8.23</strong> (Web Filtering), <strong style={{ color:S.text }}>8.7</strong> (Antimalware) —
                tất cả đều có thể chứng minh tự động bằng RDPS scripts từ repo JaxVN/RDPS.
                Deploy policy qua Action1 → screenshot evidence → đánh dấu Done trong dashboard này.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT — nhận props từ ComplianceApp wrapper (tenant, config, onComplete, storage)
// Khi dùng standalone (artifact viewer): không cần props, tự quản lý state
// ═══════════════════════════════════════════════════════════════════════════
export default function ComplianceTracker({ tenant, config: externalConfig, onComplete, onReset, storage }) {
  const standalone = !onComplete; // chạy standalone trong artifact viewer

  // State nội bộ cho standalone mode
  const [localConfig, setLocalConfig] = useState(null);
  const config = standalone ? localConfig : externalConfig;

  // Persist control status vào localStorage với tenant key
  const [controlStatus, setControlStatus] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      if (storage && tenant) {
        return JSON.parse(localStorage.getItem(storage.key(tenant, 'controls')) || '{}');
      }
      return JSON.parse(localStorage.getItem('pcs_controls_standalone') || '{}');
    } catch { return {}; }
  });

  // Sync control status về localStorage mỗi khi thay đổi
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = (storage && tenant)
        ? storage.key(tenant, 'controls')
        : 'pcs_controls_standalone';
      localStorage.setItem(key, JSON.stringify(controlStatus));
    } catch {}
  }, [controlStatus, tenant, storage]);

  const handleComplete = (data) => {
    if (standalone) setLocalConfig(data);
    else onComplete?.(data);
  };

  return config
    ? <Dashboard config={config} controlStatus={controlStatus} setControlStatus={setControlStatus} onReset={onReset} />
    : <OnboardingWizard onComplete={handleComplete} />;
}
