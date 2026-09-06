import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Department } from '../types';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  User,
  Mail,
  GraduationCap,
  Sparkles,
  Award,
  Users,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type PortalRole = 'STUDENT' | 'STAFF' | 'HEAD' | 'ADMIN';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [portalRole, setPortalRole] = useState<PortalRole>('STUDENT');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Student Fields
  const [studentId, setStudentId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [program, setProgram] = useState('B.Tech Computer Science & Engineering');
  const [batchYear, setBatchYear] = useState('2022-2026');

  // Staff & Head Fields
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get<Department[]>('/departments');
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
          setDepartmentId(res.data[0].id);
        }
      } catch {
        // Fallback default department list if endpoint is loading
        setDepartments([
          { id: 'LIBRARY', code: 'LIBRARY', name: 'Central Library & Learning Resource Center', officialEmail: 'library@campus.edu', officeLocation: 'Admin Block, Ground Floor', active: true },
          { id: 'HOSTELS', code: 'HOSTELS', name: 'Hostel Administration & Student Housing', officialEmail: 'hostels@campus.edu', officeLocation: 'Hostel Complex Office', active: true },
          { id: 'SPORTS', code: 'SPORTS', name: 'Sports & Athletics Department', officialEmail: 'sports@campus.edu', officeLocation: 'Sports Complex', active: true },
          { id: 'ACCOUNTS', code: 'ACCOUNTS', name: 'Accounts & Financial Services Division', officialEmail: 'accounts@campus.edu', officeLocation: 'Finance Wing, 1st Floor', active: true }
        ]);
        setDepartmentId('LIBRARY');
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: any = {
      username: username.trim(),
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      portalRole,
    };

    if (portalRole === 'STUDENT') {
      payload.studentId = studentId.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      payload.rollNo = rollNo.trim() || `2024CS${Math.floor(100 + Math.random() * 900)}`;
      payload.program = program;
      payload.batchYear = batchYear;
      payload.academicDepartment = program.includes('Computer Science') ? 'Computer Science' : 'Engineering';
    } else if (portalRole === 'STAFF' || portalRole === 'HEAD') {
      payload.departmentId = departmentId;
      payload.designation = designation.trim() || (portalRole === 'HEAD' ? 'Department Head' : 'Clearance Verification Officer');
    }

    try {
      const auth = await register(payload);
      if (auth.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (auth.roles.includes('ROLE_DEPARTMENT_HEAD')) {
        navigate('/head');
      } else if (auth.roles.includes('ROLE_DEPARTMENT_STAFF')) {
        navigate('/department');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create institutional account. Please check your details.');
    }
  };

  const portalConfig = [
    {
      id: 'STUDENT' as PortalRole,
      title: 'Student Portal',
      badge: 'Clearance Candidate',
      desc: 'Submit single clearance request and obtain verifiable No-Dues certificate.',
      icon: GraduationCap,
      color: 'border-blue-500 bg-blue-50/50 text-blue-900',
    },
    {
      id: 'STAFF' as PortalRole,
      title: 'Department Staff',
      badge: 'Verification Officer',
      desc: 'Audit student records, verify obligations, and clear department dues.',
      icon: Users,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
    {
      id: 'HEAD' as PortalRole,
      title: 'Department Head',
      badge: 'Executive Oversight',
      desc: 'Manage departmental clearance queues, audit workloads, and SLA compliance.',
      icon: ShieldCheck,
      color: 'border-indigo-500 bg-indigo-50/50 text-indigo-900',
    },
    {
      id: 'ADMIN' as PortalRole,
      title: 'University Admin',
      badge: 'Central Governance',
      desc: 'System administration, bottleneck analytics, and institutional audit trail.',
      icon: SlidersHorizontal,
      color: 'border-rose-500 bg-rose-50/50 text-rose-900',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* LEFT COLUMN: Institutional Onboarding & Portal Architecture */}
      <div className="lg:w-5/12 bg-rgukt-navy text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-rgukt-primary/40 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-amber-300/40 flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-8-3.64V17c0 3.31 3.58 6 8 6s8-2.69 8-6v-5.64L12 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Rajiv Gandhi University of Knowledge Technologies
              </h1>
              <p className="text-xs text-amber-300/90 font-medium">
                CampusClear • Unified Multi-Portal Provisioning
              </p>
            </div>
          </div>
        </div>

        {/* Narrative & Value Proposition */}
        <div className="relative z-10 py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One Account Connects Every Campus Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Provision your official institutional profile across university divisions.
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
            Whether you are a student candidate applying for graduation clearance, a departmental verifier reconciling obligations, or an administrative officer monitoring institutional SLA compliance, CampusClear connects you directly to your portal.
          </p>

          {/* Institutional Highlights */}
          <div className="space-y-2.5 pt-2 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant role-based authorization (Student, Staff, Head, Admin)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automatic coordination across Library, Hostels, Sports &amp; Accounts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cryptographic QR digital certificate issuance upon reconciliation</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-400 pt-4 border-t border-white/10 flex items-center justify-between">
          <span>Digital Campus Governance System</span>
          <Link to="/login" className="text-amber-300 hover:underline font-semibold">
            Already registered? Sign In →
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: Registration Form & Portal Selector */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rgukt-primary px-2.5 py-0.5 rounded-full bg-rgukt-light border border-brand-200 inline-block mb-1.5">
              Account Registration
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Your CampusClear Account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your university role below to provision access to the corresponding portal.
            </p>
          </div>

          {/* 1. Portal Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Your University Portal:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {portalConfig.map((p) => {
                const isSelected = portalRole === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPortalRole(p.id)}
                    className={`p-3 rounded-2xl border text-left transition relative ${
                      isSelected
                        ? 'border-rgukt-primary bg-brand-50/70 shadow-xs ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-rgukt-primary text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-slate-900">{p.title}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-rgukt-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Full Legal Name
                </label>
                <div className="mt-1 relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Institutional Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.s@campus.edu"
                    className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Portal Username
                </label>
                <div className="mt-1 relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rahul.sharma"
                    className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Security Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Portal-Specific Particulars */}
            {portalRole === 'STUDENT' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <span className="text-[11px] font-bold text-rgukt-primary block uppercase tracking-wider">
                  🎓 Student Candidate Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Institutional Student ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STU-2024-042"
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      University Roll Number
                    </label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 2022CS0142"
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Academic Program
                    </label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    >
                      <option>B.Tech Computer Science & Engineering</option>
                      <option>B.Tech Electronics & Communications</option>
                      <option>B.Tech Mechanical Engineering</option>
                      <option>B.Tech Civil Engineering</option>
                      <option>M.Tech Data Science & AI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Batch Year
                    </label>
                    <input
                      type="text"
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value)}
                      placeholder="e.g. 2022-2026"
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {(portalRole === 'STAFF' || portalRole === 'HEAD') && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <span className="text-[11px] font-bold text-rgukt-primary block uppercase tracking-wider">
                  🏢 Department Staffing Particulars
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Assigned Department
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder={portalRole === 'HEAD' ? 'e.g. Chief Librarian / Dean' : 'e.g. Verification Officer'}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {portalRole === 'ADMIN' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-rose-800 block uppercase tracking-wider">
                  ⚙️ System Governance Scope
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Administrator privileges provide central access to university clearance bottlenecks, SLA duration configuration, and immutable system audit logs.
                </p>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-rgukt-primary hover:bg-rgukt-navy transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                  Provisioning Account &amp; Launching Portal...
                </>
              ) : (
                <>
                  Create {portalConfig.find((p) => p.id === portalRole)?.title} Account &amp; Launch Portal
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Switch to Login */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an institutional account?{' '}
            <Link to="/login" className="font-bold text-rgukt-primary hover:underline">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
