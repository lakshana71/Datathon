// CrimeSphere AI — Navigation Type Definitions
import type { Case } from './index';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type DrawerParamList = {
  ControlRoom: undefined;
  CaseFiles: undefined;
  CaseDetail: { caseId: string };
  EvidenceViewer: { caseId: string; evidenceId: string };
  PersonCrimeTracker: { query?: string } | undefined;
  DutyNotebook: undefined;
  CrimeMap: undefined;
  Alerts: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  Search: { query?: string };
  ReportPreview: { caseId: string };
  // Shared Modules (all roles with permission)
  Documents: undefined;
  ComplaintLetters: undefined;
  // Commissioner Only Modules
  PoliceStations: undefined;
  OfficerManagement: undefined;
  DistrictAnalytics: undefined;
  CrimeAnalytics: undefined;
  Reports: undefined;
  CaseAssignment: undefined;
  PerformanceDashboard: undefined;
  FIRManagement: undefined;
  // FIR Filing
  FileFIR: undefined;
};

export type CaseStackParamList = {
  CaseFiles: undefined;
  CaseDetail: { caseId: string };
  EvidenceViewer: { caseId: string; evidenceId: string };
  ReportPreview: { caseId: string };
};
