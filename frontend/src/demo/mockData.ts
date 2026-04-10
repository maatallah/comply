type DemoUser = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  companyName?: string;
};

type DemoCompany = {
  id: string;
  legalName: string;
  taxId: string;
  cnssId?: string;
  activitySector: string;
  companySize: string;
  regime: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
};

const toIso = (d: Date) => d.toISOString();
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIso(d);
};

export const demoUser: DemoUser = {
  id: 'user-demo-001',
  userId: 'user-demo-001',
  email: 'amira.bensalah@atelier-tex.tn',
  firstName: 'Amira',
  lastName: 'Ben Salah',
  role: 'COMPANY_ADMIN',
  companyId: 'comp-demo-001',
  companyName: 'Atelier Maghreb Confection',
};

export const demoUsers = [
  demoUser,
  {
    id: 'user-demo-002',
    userId: 'user-demo-002',
    email: 'houssem.chaabane@atelier-tex.tn',
    firstName: 'Houssem',
    lastName: 'Chaabane',
    role: 'COMPLIANCE_OFFICER',
    companyId: 'comp-demo-001',
    companyName: 'Atelier Maghreb Confection',
  },
];

export const demoCompany: DemoCompany = {
  id: 'comp-demo-001',
  legalName: 'Atelier Maghreb Confection',
  taxId: '1234567/A/M/000',
  cnssId: '7564301',
  activitySector: 'TEXTILE',
  companySize: '50-200',
  regime: 'OFFSHORE',
  address: 'Zone Industrielle El Mghira',
  city: 'Ben Arous',
  phone: '+216 71 000 000',
  email: 'contact@atelier-tex.tn',
};

export const demoRegulations = [
  {
    id: 'reg-demo-001',
    code: 'HSE-001',
    titleFr: 'Sécurité incendie en atelier',
    titleAr: 'السلامة من الحرائق في الورشة',
    category: 'HSE',
    authority: 'Protection Civile',
    descriptionFr: 'Exigences de sécurité incendie pour ateliers de confection.',
  },
  {
    id: 'reg-demo-002',
    code: 'SOC-002',
    titleFr: 'Contrats de travail et temps de travail',
    titleAr: 'عقود العمل ووقت العمل',
    category: 'SOCIAL',
    authority: 'Ministère des Affaires Sociales',
    descriptionFr: 'Règles sur les contrats, horaires et pauses.',
  },
  {
    id: 'reg-demo-003',
    code: 'FIS-003',
    titleFr: 'Déclarations CNSS et charges sociales',
    titleAr: 'تصاريح الضمان الاجتماعي',
    category: 'FISCAL',
    authority: 'CNSS',
    descriptionFr: 'Déclarations mensuelles et obligations de paiement.',
  },
];

export const demoObligations = [
  {
    id: 'obl-demo-001',
    titleFr: 'Formation SST annuelle pour chefs d’atelier',
    titleAr: 'تدريب السلامة السنوي لرؤساء الورش',
    frequency: 'ANNUAL',
    riskLevel: 'HIGH',
    category: 'HSE',
    regulationId: 'reg-demo-001',
    regulation: { code: 'HSE-001', titleFr: 'Sécurité incendie en atelier' },
  },
  {
    id: 'obl-demo-002',
    titleFr: 'Inspection trimestrielle des extincteurs',
    titleAr: 'فحص ربع سنوي لمطفآت الحريق',
    frequency: 'QUARTERLY',
    riskLevel: 'MEDIUM',
    category: 'HSE',
    regulationId: 'reg-demo-001',
    regulation: { code: 'HSE-001', titleFr: 'Sécurité incendie en atelier' },
  },
  {
    id: 'obl-demo-003',
    titleFr: 'Déclaration CNSS mensuelle',
    titleAr: 'التصريح الشهري للضمان الاجتماعي',
    frequency: 'MONTHLY',
    riskLevel: 'HIGH',
    category: 'FISCAL',
    regulationId: 'reg-demo-003',
    regulation: { code: 'FIS-003', titleFr: 'Déclarations CNSS et charges sociales' },
  },
  {
    id: 'obl-demo-004',
    titleFr: 'Audit BSCI pré-saison',
    titleAr: 'تدقيق BSCI قبل الموسم',
    frequency: 'ANNUAL',
    riskLevel: 'CRITICAL',
    category: 'BRAND_AUDIT',
    regulationId: 'reg-demo-002',
    regulation: { code: 'SOC-002', titleFr: 'Contrats de travail et temps de travail' },
  },
];

export const demoControls = [
  {
    id: 'ctrl-demo-001',
    titleFr: 'Registre de formation SST',
    titleAr: 'سجل تدريب السلامة',
    controlType: 'DOCUMENT',
    frequency: 'ANNUAL',
    obligationId: 'obl-demo-001',
    obligation: { titleFr: 'Formation SST annuelle pour chefs d’atelier' },
    checks: [{ status: 'PASS', checkDate: addDays(-30) }],
  },
  {
    id: 'ctrl-demo-002',
    titleFr: 'Inspection extincteurs zone coupe',
    titleAr: 'فحص مطفآت منطقة القص',
    controlType: 'INSPECTION',
    frequency: 'QUARTERLY',
    obligationId: 'obl-demo-002',
    obligation: { titleFr: 'Inspection trimestrielle des extincteurs' },
    checks: [{ status: 'FAIL', checkDate: addDays(-10) }],
  },
  {
    id: 'ctrl-demo-003',
    titleFr: 'Déclaration CNSS mois courant',
    titleAr: 'تصريح CNSS للشهر الجاري',
    controlType: 'DOCUMENT',
    frequency: 'MONTHLY',
    obligationId: 'obl-demo-003',
    obligation: { titleFr: 'Déclaration CNSS mensuelle' },
    checks: [{ status: 'PARTIAL', checkDate: addDays(-5) }],
  },
];

export const demoChecks = [
  {
    id: 'chk-demo-001',
    controlId: 'ctrl-demo-001',
    checkDate: addDays(-30),
    status: 'PASS',
    findings: 'Registre complet et signé.',
    performedBy: 'Amira Ben Salah',
    control: { titleFr: 'Registre de formation SST', titleAr: 'سجل تدريب السلامة' },
    user: { firstName: 'Amira', lastName: 'Ben Salah' },
  },
  {
    id: 'chk-demo-002',
    controlId: 'ctrl-demo-002',
    checkDate: addDays(-10),
    status: 'FAIL',
    findings: 'Deux extincteurs sans certificat valide.',
    correctiveActions: 'Planifier une maintenance immédiate.',
    performedBy: 'Houssem Chaabane',
    control: { titleFr: 'Inspection extincteurs zone coupe', titleAr: 'فحص مطفآت منطقة القص' },
    user: { firstName: 'Houssem', lastName: 'Chaabane' },
    actions: [
      { id: 'act-demo-001', description: 'Renouveler les certificats extincteurs', status: 'IN_PROGRESS', priority: 'HIGH' },
      { id: 'act-demo-002', description: 'Former l’équipe HSE sur la procédure', status: 'PENDING', priority: 'MEDIUM' },
    ],
    evidence: [],
  },
  {
    id: 'chk-demo-003',
    controlId: 'ctrl-demo-003',
    checkDate: addDays(-5),
    status: 'PARTIAL',
    findings: 'Déclaration prête, en attente de validation.',
    performedBy: 'Amira Ben Salah',
    control: { titleFr: 'Déclaration CNSS mois courant', titleAr: 'تصريح CNSS للشهر الجاري' },
    user: { firstName: 'Amira', lastName: 'Ben Salah' },
  },
];

export const demoDeadlines = [
  {
    id: 'dl-demo-001',
    dueDate: addDays(5),
    status: 'PENDING',
    isRecurring: true,
    obligationId: 'obl-demo-003',
    obligation: { titleFr: 'Déclaration CNSS mensuelle' },
  },
  {
    id: 'dl-demo-002',
    dueDate: addDays(-2),
    status: 'PENDING',
    isRecurring: false,
    obligationId: 'obl-demo-002',
    obligation: { titleFr: 'Inspection trimestrielle des extincteurs' },
  },
  {
    id: 'dl-demo-003',
    dueDate: addDays(-20),
    status: 'COMPLETED',
    isRecurring: true,
    obligationId: 'obl-demo-001',
    obligation: { titleFr: 'Formation SST annuelle pour chefs d’atelier' },
  },
];

export const demoAlerts = [
  {
    id: 'al-demo-001',
    titleFr: 'Échéance critique dans 5 jours',
    messageFr: 'Déclaration CNSS mensuelle à soumettre cette semaine.',
    severity: 'HIGH',
    type: 'DEADLINE',
    isRead: false,
    createdAt: addDays(-1),
    checkId: 'chk-demo-002',
  },
  {
    id: 'al-demo-002',
    titleFr: 'Contrôle non conforme',
    messageFr: 'Inspection extincteurs zone coupe : action requise.',
    severity: 'CRITICAL',
    type: 'CHECK',
    isRead: false,
    createdAt: addDays(-3),
    checkId: 'chk-demo-002',
  },
  {
    id: 'al-demo-003',
    titleFr: 'Nouvelle entrée JORT',
    messageFr: 'Nouvelle note relative à la sécurité au travail.',
    severity: 'MEDIUM',
    type: 'REGULATORY',
    isRead: true,
    createdAt: addDays(-7),
  },
];

export const demoJortFeed = [
  {
    id: 'jort-demo-001',
    titleFr: 'Note sur la sécurité incendie en milieu industriel',
    titleAr: 'مذكرة حول السلامة من الحرائق في الوسط الصناعي',
    ministry: 'Protection Civile',
    ministryAr: 'الحماية المدنية',
    type: 'NOTE',
    date: addDays(-4),
    status: 'PENDING',
    recordId: 'TEX-2026-001',
  },
  {
    id: 'jort-demo-002',
    titleFr: 'Mise à jour des obligations sociales des employeurs',
    titleAr: 'تحديث التزامات المشغلين الاجتماعية',
    ministry: 'Ministère des Affaires Sociales',
    ministryAr: 'وزارة الشؤون الاجتماعية',
    type: 'CIRCULAIRE',
    date: addDays(-12),
    status: 'RELEVANT',
    recordId: 'SOC-2026-014',
  },
  {
    id: 'jort-demo-003',
    titleFr: 'Rappel: équipements de protection individuelle',
    titleAr: 'تذكير: معدات الحماية الشخصية',
    ministry: 'HSE',
    ministryAr: 'الصحة والسلامة',
    type: 'RAPPEL',
    date: addDays(-20),
    status: 'IGNORED',
    recordId: 'HSE-2026-003',
  },
];

export const demoAuditTypes = [
  {
    id: 'atype-demo-001',
    name: 'Audit BSCI',
    nameAr: 'تدقيق BSCI',
    scope: 'EXTERNAL',
    description: 'Audit social externe basé sur les critères BSCI.',
    descriptionAr: 'تدقيق اجتماعي خارجي حسب معايير BSCI.',
  },
  {
    id: 'atype-demo-002',
    name: 'Audit interne HSE',
    nameAr: 'تدقيق داخلي للصحة والسلامة',
    scope: 'INTERNAL',
    description: 'Audit interne des procédures HSE.',
    descriptionAr: 'تدقيق داخلي لإجراءات الصحة والسلامة.',
  },
];

export const demoAudits = [
  {
    id: 'audit-demo-001',
    auditType: demoAuditTypes[0],
    status: 'SCHEDULED',
    scheduledDate: addDays(7),
    auditorName: 'BSCI Partner',
    score: null,
    leadAuditor: null,
    leadAuditorId: null,
  },
  {
    id: 'audit-demo-002',
    auditType: demoAuditTypes[1],
    status: 'IN_PROGRESS',
    scheduledDate: addDays(-5),
    auditorName: null,
    score: 72,
    leadAuditor: { firstName: 'Houssem', lastName: 'Chaabane' },
    leadAuditorId: 'user-demo-002',
    checks: [
      {
        id: 'audit-check-001',
        status: 'PASS',
        findings: '',
        control: { titleFr: 'Signalisation des sorties de secours', descriptionFr: 'Vérifier la signalétique et l’accès.' },
      },
      {
        id: 'audit-check-002',
        status: 'FAIL',
        findings: 'Extincteurs non conformes dans l’atelier.',
        control: { titleFr: 'Extincteurs disponibles et conformes', descriptionFr: 'Contrôle visuel et certificat.' },
      },
    ],
    correctiveActions: [
      {
        id: 'audit-act-001',
        description: 'Remplacer les extincteurs non conformes.',
        severity: 'MAJOR',
        status: 'IN_PROGRESS',
        assignee: { firstName: 'Amira', lastName: 'Ben Salah' },
        dueDate: addDays(14),
      },
    ],
  },
];

