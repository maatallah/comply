import {
  demoAlerts,
  demoAudits,
  demoAuditTypes,
  demoChecks,
  demoCompany,
  demoControls,
  demoDeadlines,
  demoJortFeed,
  demoObligations,
  demoRegulations,
  demoUser,
  demoUsers,
} from './mockData';

const DEMO_FLAG = 'demo';
const API_DEFAULT = 'http://localhost:3000';

let installed = false;

const clone = <T,>(val: T): T => JSON.parse(JSON.stringify(val));

const db = {
  user: clone(demoUser),
  users: clone(demoUsers),
  company: clone(demoCompany),
  regulations: clone(demoRegulations),
  obligations: clone(demoObligations),
  controls: clone(demoControls),
  checks: clone(demoChecks),
  deadlines: clone(demoDeadlines),
  alerts: clone(demoAlerts),
  jort: clone(demoJortFeed),
  audits: clone(demoAudits),
  auditTypes: clone(demoAuditTypes),
};

const nowDate = () => new Date();
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

const jsonResponse = (payload: any, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const okData = (data: any) => jsonResponse({ success: true, data });
const ok = (extra: Record<string, any> = {}) => jsonResponse({ success: true, ...extra });
const fail = (message: string, status = 400) => jsonResponse({ success: false, error: { message } }, status);

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has(DEMO_FLAG) || import.meta.env.VITE_DEMO === 'true';
}

const computeObligationSummary = () => {
  const byCategoryMap: Record<string, { category: string; total: number; highRisk: number }> = {};
  db.obligations.forEach((ob: any) => {
    if (!byCategoryMap[ob.category]) {
      byCategoryMap[ob.category] = { category: ob.category, total: 0, highRisk: 0 };
    }
    byCategoryMap[ob.category].total += 1;
    if (ob.riskLevel === 'HIGH' || ob.riskLevel === 'CRITICAL') {
      byCategoryMap[ob.category].highRisk += 1;
    }
  });

  return {
    totalObligations: db.obligations.length,
    byCategory: Object.values(byCategoryMap),
  };
};

const computeDeadlineSummary = () => {
  const today = nowDate();
  const dueSoonLimit = new Date(today);
  dueSoonLimit.setDate(today.getDate() + 7);

  let dueSoon = 0;
  let overdue = 0;

  db.deadlines.forEach((dl: any) => {
    if (dl.status === 'COMPLETED') return;
    const due = new Date(dl.dueDate);
    if (due < today) overdue += 1;
    else if (due <= dueSoonLimit) dueSoon += 1;
  });

  return { dueSoon, overdue };
};

const computeScoring = () => {
  const categories: Record<string, any> = {};

  db.controls.forEach((ctrl: any) => {
    const category = ctrl.obligation?.category || 'HSE';
    if (!categories[category]) {
      categories[category] = {
        category,
        totalControls: 0,
        passedControls: 0,
        failedControls: 0,
        partialControls: 0,
        notCheckedControls: 0,
        compliancePercent: 0,
      };
    }

    const latest = ctrl.checks && ctrl.checks.length > 0 ? ctrl.checks[0] : null;
    categories[category].totalControls += 1;
    if (!latest || latest.status === 'PENDING') categories[category].notCheckedControls += 1;
    else if (latest.status === 'PASS') categories[category].passedControls += 1;
    else if (latest.status === 'FAIL') categories[category].failedControls += 1;
    else if (latest.status === 'PARTIAL') categories[category].partialControls += 1;
  });

  const categoryList = Object.values(categories).map((c: any) => {
    const checked = c.totalControls - c.notCheckedControls;
    const score = checked > 0 ? Math.round((c.passedControls / checked) * 100) : 100;
    return { ...c, compliancePercent: score };
  });

  const totalControls = categoryList.reduce((acc: number, c: any) => acc + c.totalControls, 0);
  const passedControls = categoryList.reduce((acc: number, c: any) => acc + c.passedControls, 0);
  const overallScore = totalControls > 0 ? Math.round((passedControls / totalControls) * 100) : 100;

  const deadlineSummary = computeDeadlineSummary();

  return {
    overallScore,
    totalControls,
    passedControls,
    categories: categoryList,
    overdueDeadlines: deadlineSummary.overdue,
    upcomingDeadlines: deadlineSummary.dueSoon,
  };
};

const filterByQuery = (items: any[], params: URLSearchParams) => {
  const status = params.get('status');
  if (status) return items.filter((i: any) => (i.status || '').toUpperCase() === status.toUpperCase());
  return items;
};

export function installDemoFetch() {
  if (installed || typeof window === 'undefined') return;
  if (!isDemoMode()) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return originalFetch(input as any, init);
    }

    const base = window.location.href || 'http://localhost';
    const urlObj = new URL(url, base);
    const pathname = urlObj.pathname;
    const method = (init?.method || (input as Request).method || 'GET').toUpperCase();

    const apiOrigin = new URL(API_DEFAULT, base).origin;
    const isApiRequest = urlObj.origin === apiOrigin;
    if (!isApiRequest) {
      return originalFetch(input as any, init);
    }

    // Parse JSON body (if any)
    let body: any = null;
    if (init?.body && typeof init.body === 'string') {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = null;
      }
    }

    // AUTH
    if (pathname === '/auth/login' && method === 'POST') {
      return ok({
        data: {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          user: db.user,
        },
      });
    }
    if (pathname === '/auth/refresh' && method === 'POST') {
      return ok({ data: { accessToken: 'demo-access-token' } });
    }

    // USERS
    if (pathname === '/users' && method === 'GET') {
      return okData(db.users);
    }

    // COMPANY
    if (pathname.startsWith('/companies/') && method === 'GET') {
      const id = pathname.split('/')[2];
      if (id === db.company.id) return okData(db.company);
      return fail('Company not found', 404);
    }
    if (pathname.startsWith('/companies/') && (method === 'PUT' || method === 'PATCH')) {
      const id = pathname.split('/')[2];
      if (id !== db.company.id) return fail('Company not found', 404);
      db.company = { ...db.company, ...(body || {}) };
      return okData(db.company);
    }

    // REGULATIONS
    if (pathname === '/regulations' && method === 'GET') {
      return okData(db.regulations);
    }
    if (pathname === '/regulations' && method === 'POST') {
      const reg = { id: uid('reg'), ...body };
      db.regulations.unshift(reg);
      return okData(reg);
    }
    if (pathname.startsWith('/regulations/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.regulations = db.regulations.map((r: any) => (r.id === id ? { ...r, ...body } : r));
      const updated = db.regulations.find((r: any) => r.id === id);
      return okData(updated);
    }
    if (pathname.startsWith('/regulations/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.regulations = db.regulations.filter((r: any) => r.id !== id);
      return ok();
    }

    // ARTICLES
    if (pathname.includes('/articles') && method === 'GET') {
      return okData([]);
    }
    if (pathname === '/articles' && method === 'POST') {
      return okData({ id: uid('article'), ...body });
    }
    if (pathname.startsWith('/articles/') && (method === 'PUT' || method === 'DELETE')) {
      return ok();
    }

    // OBLIGATIONS
    if (pathname === '/obligations' && method === 'GET') {
      const category = urlObj.searchParams.get('category');
      const data = category ? db.obligations.filter((o: any) => o.category === category) : db.obligations;
      return okData(data);
    }
    if (pathname === '/obligations/summary' && method === 'GET') {
      return okData(computeObligationSummary());
    }
    if (pathname === '/obligations' && method === 'POST') {
      const ob = { id: uid('obl'), ...body };
      db.obligations.unshift(ob);
      return okData(ob);
    }
    if (pathname.startsWith('/obligations/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.obligations = db.obligations.map((o: any) => (o.id === id ? { ...o, ...body } : o));
      const updated = db.obligations.find((o: any) => o.id === id);
      return okData(updated);
    }
    if (pathname.startsWith('/obligations/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.obligations = db.obligations.filter((o: any) => o.id !== id);
      return ok();
    }
    if (pathname.endsWith('/email') && pathname.startsWith('/obligations/') && method === 'POST') {
      return ok();
    }
    if (pathname === '/obligations/subscribe-tier1' && method === 'POST') {
      return ok();
    }

    // CONTROLS
    if (pathname === '/controls' && method === 'GET') {
      return okData(db.controls);
    }
    if (pathname === '/controls' && method === 'POST') {
      const ctrl = { id: uid('ctrl'), ...body, checks: [] };
      db.controls.unshift(ctrl);
      return okData(ctrl);
    }
    if (pathname.startsWith('/controls/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.controls = db.controls.map((c: any) => (c.id === id ? { ...c, ...body } : c));
      const updated = db.controls.find((c: any) => c.id === id);
      return okData(updated);
    }
    if (pathname.startsWith('/controls/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.controls = db.controls.filter((c: any) => c.id !== id);
      return ok();
    }

    // CHECKS
    if (pathname === '/checks' && method === 'GET') {
      const params = urlObj.searchParams;
      const status = params.get('status');
      const hasActionPlan = params.get('hasActionPlan');
      let data = db.checks;
      if (status && status !== 'all') data = data.filter((c: any) => c.status === status);
      if (hasActionPlan === 'true') data = data.filter((c: any) => c.actions && c.actions.length > 0);
      return okData(data);
    }
    if (pathname === '/checks' && method === 'POST') {
      const chk = { id: uid('chk'), ...body };
      db.checks.unshift(chk);
      const ctrl = db.controls.find((c: any) => c.id === chk.controlId);
      if (ctrl) {
        ctrl.checks = [{ status: chk.status || 'PENDING', checkDate: chk.checkDate || new Date().toISOString() }, ...(ctrl.checks || [])];
      }
      return okData(chk);
    }
    if (pathname.startsWith('/checks/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.checks = db.checks.map((c: any) => (c.id === id ? { ...c, ...body } : c));
      return ok();
    }
    if (pathname.endsWith('/email') && pathname.startsWith('/checks/') && method === 'POST') {
      return ok();
    }
    if (pathname.endsWith('/actions') && pathname.startsWith('/checks/') && method === 'GET') {
      const id = pathname.split('/')[2];
      const chk = db.checks.find((c: any) => c.id === id);
      return okData(chk?.actions || []);
    }
    if (pathname.endsWith('/actions') && pathname.startsWith('/checks/') && method === 'POST') {
      const id = pathname.split('/')[2];
      const chk = db.checks.find((c: any) => c.id === id);
      if (!chk) return fail('Check not found', 404);
      const action = { id: uid('act'), ...(body || {}) };
      chk.actions = chk.actions || [];
      chk.actions.push(action);
      return okData(action);
    }
    if (pathname.startsWith('/actions/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.checks.forEach((c: any) => {
        if (c.actions) {
          c.actions = c.actions.map((a: any) => (a.id === id ? { ...a, ...(body || {}) } : a));
        }
      });
      return ok();
    }
    if (pathname.startsWith('/actions/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.checks.forEach((c: any) => {
        if (c.actions) c.actions = c.actions.filter((a: any) => a.id !== id);
      });
      return ok();
    }

    // EVIDENCE
    if (pathname === '/evidence' && method === 'GET') {
      return okData([]);
    }
    if (pathname === '/evidence/upload' && method === 'POST') {
      return okData({ id: uid('ev'), fileName: 'preuve-demo.pdf', fileType: 'application/pdf' });
    }
    if (pathname.startsWith('/evidence/file/') && method === 'GET') {
      const blob = new Blob(['Demo evidence file'], { type: 'application/pdf' });
      return new Response(blob, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
    }
    if (pathname.startsWith('/evidence/') && method === 'DELETE') {
      return ok();
    }

    // DEADLINES
    if (pathname === '/deadlines' && method === 'GET') {
      return okData(db.deadlines);
    }
    if (pathname === '/deadlines/summary' && method === 'GET') {
      return okData(computeDeadlineSummary());
    }
    if (pathname === '/deadlines' && method === 'POST') {
      const dl = { id: uid('dl'), ...body };
      db.deadlines.unshift(dl);
      return okData(dl);
    }
    if (pathname.startsWith('/deadlines/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.deadlines = db.deadlines.map((d: any) => (d.id === id ? { ...d, ...body } : d));
      const updated = db.deadlines.find((d: any) => d.id === id);
      return okData(updated);
    }
    if (pathname.startsWith('/deadlines/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.deadlines = db.deadlines.filter((d: any) => d.id !== id);
      return ok();
    }
    if (pathname.endsWith('/complete') && pathname.startsWith('/deadlines/') && method === 'POST') {
      const id = pathname.split('/')[2];
      db.deadlines = db.deadlines.map((d: any) => (d.id === id ? { ...d, status: 'COMPLETED' } : d));
      return ok();
    }
    if (pathname.endsWith('/revert') && pathname.startsWith('/deadlines/') && method === 'POST') {
      const id = pathname.split('/')[2];
      db.deadlines = db.deadlines.map((d: any) => (d.id === id ? { ...d, status: 'PENDING' } : d));
      return ok();
    }
    if (pathname.endsWith('/email') && pathname.startsWith('/deadlines/') && method === 'POST') {
      return ok();
    }

    // ALERTS
    if (pathname === '/alerts' && method === 'GET') {
      const unreadOnly = urlObj.searchParams.get('unreadOnly') === 'true';
      const data = unreadOnly ? db.alerts.filter((a: any) => !a.isRead) : db.alerts;
      return okData(data);
    }
    if (pathname === '/alerts/unread-count' && method === 'GET') {
      const count = db.alerts.filter((a: any) => !a.isRead).length;
      return okData({ count });
    }
    if (pathname === '/alerts/read-all' && method === 'PUT') {
      db.alerts = db.alerts.map((a: any) => ({ ...a, isRead: true }));
      return ok();
    }
    if (pathname === '/alerts/scan' && method === 'POST') {
      return ok();
    }
    if (pathname.startsWith('/alerts/') && pathname.endsWith('/read') && method === 'PUT') {
      const id = pathname.split('/')[2];
      db.alerts = db.alerts.map((a: any) => (a.id === id ? { ...a, isRead: true } : a));
      return ok();
    }
    if (pathname.startsWith('/alerts/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.alerts = db.alerts.filter((a: any) => a.id !== id);
      return ok();
    }
    if (pathname === '/alerts/bulk' && method === 'POST') {
      const ids = body?.ids || [];
      const action = body?.action;
      if (action === 'read') {
        db.alerts = db.alerts.map((a: any) => (ids.includes(a.id) ? { ...a, isRead: true } : a));
      } else if (action === 'delete') {
        db.alerts = db.alerts.filter((a: any) => !ids.includes(a.id));
      }
      return ok();
    }

    // SCORING
    if (pathname === '/scoring/breakdown' && method === 'GET') {
      return okData(computeScoring());
    }

    // JORT FEED
    if (pathname === '/jort-feed' && method === 'GET') {
      let entries = filterByQuery(db.jort, urlObj.searchParams);
      const search = urlObj.searchParams.get('search');
      if (search) {
        const s = search.toLowerCase();
        entries = entries.filter((e: any) => (e.titleFr || '').toLowerCase().includes(s) || (e.titleAr || '').toLowerCase().includes(s));
      }
      const year = urlObj.searchParams.get('year');
      const month = urlObj.searchParams.get('month');
      if (year) entries = entries.filter((e: any) => new Date(e.date).getFullYear().toString() === year);
      if (month) entries = entries.filter((e: any) => (new Date(e.date).getMonth() + 1).toString() === month);
      const limit = Number(urlObj.searchParams.get('limit') || 0);
      const data = limit > 0 ? entries.slice(0, limit) : entries;
      return ok({ entries: data, total: entries.length });
    }
    if (pathname === '/jort-feed/years' && method === 'GET') {
      const years = Array.from(new Set(db.jort.map((e: any) => new Date(e.date).getFullYear()))).sort((a, b) => b - a);
      return ok({ years });
    }
    if (pathname.startsWith('/jort-feed/stats/') && method === 'GET') {
      const year = Number(pathname.split('/')[3]);
      const stats: { month: number; count: number }[] = [];
      for (let m = 1; m <= 12; m++) {
        const count = db.jort.filter((e: any) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() + 1 === m;
        }).length;
        if (count > 0) stats.push({ month: m, count });
      }
      return ok({ stats });
    }
    if (pathname === '/jort-feed/scrape' && method === 'POST') {
      return ok({ stats: { new: 0, duplicates: 0 } });
    }
    if (pathname.startsWith('/jort-feed/') && pathname.endsWith('/process') && method === 'POST') {
      const id = pathname.split('/')[2];
      const status = body?.status;
      db.jort = db.jort.map((e: any) => (e.id === id ? { ...e, status } : e));
      return ok();
    }

    // REPORTS
    if (pathname === '/reports/obligations-pdf' && method === 'GET') {
      const content = '%PDF-1.4\n% Demo PDF\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF';
      const blob = new Blob([content], { type: 'application/pdf' });
      return new Response(blob, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
    }

    // AUDITS
    if (pathname === '/audits' && method === 'GET') {
      return ok({ audits: db.audits });
    }
    if (pathname === '/audits/types' && method === 'GET') {
      return ok({ types: db.auditTypes });
    }
    if (pathname === '/audits' && method === 'POST') {
      const audit = { id: uid('audit'), status: 'SCHEDULED', score: null, ...body };
      audit.auditType = db.auditTypes.find((t: any) => t.id === body?.auditTypeId) || db.auditTypes[0];
      db.audits.unshift(audit);
      return ok({ audit });
    }
    if (pathname.startsWith('/audits/') && method === 'GET') {
      const id = pathname.split('/')[2];
      const audit = db.audits.find((a: any) => a.id === id);
      if (!audit) return fail('Audit not found', 404);
      return ok({ audit });
    }
    if (pathname.startsWith('/audits/') && pathname.endsWith('/start') && method === 'POST') {
      const id = pathname.split('/')[2];
      db.audits = db.audits.map((a: any) => (a.id === id ? { ...a, status: 'IN_PROGRESS' } : a));
      return ok();
    }
    if (pathname.startsWith('/audits/') && pathname.endsWith('/complete') && method === 'POST') {
      const id = pathname.split('/')[2];
      db.audits = db.audits.map((a: any) => (a.id === id ? { ...a, status: 'COMPLETED', score: a.score ?? 78 } : a));
      return ok();
    }
    if (pathname.startsWith('/audits/') && pathname.endsWith('/actions') && method === 'POST') {
      const id = pathname.split('/')[2];
      const audit = db.audits.find((a: any) => a.id === id);
      if (!audit) return fail('Audit not found', 404);
      audit.correctiveActions = audit.correctiveActions || [];
      const action = { id: uid('audit-act'), status: 'OPEN', ...body };
      audit.correctiveActions.push(action);
      return ok({ action });
    }
    if (pathname.startsWith('/audits/') && (method === 'PATCH' || method === 'PUT')) {
      const id = pathname.split('/')[2];
      db.audits = db.audits.map((a: any) => (a.id === id ? { ...a, ...body } : a));
      return ok();
    }
    if (pathname.startsWith('/audits/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      db.audits = db.audits.filter((a: any) => a.id !== id);
      return ok();
    }

    return originalFetch(input as any, init);
  };
}
