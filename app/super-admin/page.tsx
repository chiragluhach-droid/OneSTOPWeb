'use client';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Panel, DataTable, StatTile, StatusBar, TrendLines, RankedBars, Meter,
  StatusPill, STATUS, fmt,
} from './_components/charts';

const MAROON = '#8B1A1A';
const RANGES = [7, 30, 90, 365] as const;

const hrs = (h: number) => (h >= 48 ? `${(h / 24).toFixed(1)}d` : `${h.toFixed(1)}h`);
const ago = (d?: string | null) => {
  if (!d) return '—';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
};

type Tab = 'overview' | 'requests' | 'students' | 'staff' | 'sla';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Requests' },
  { id: 'students', label: 'Students' },
  { id: 'staff', label: 'Staff' },
  { id: 'sla', label: 'Response times' },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const { admin, token, _hydrated, clearAuth } = useAuthStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [days, setDays] = useState<number>(30);

  const [reqPage, setReqPage] = useState(1);
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatus, setReqStatus] = useState('all');
  const [stuPage, setStuPage] = useState(1);
  const [stuSearch, setStuSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Only a super-admin token may hit these endpoints. Wait for the persisted
  // store to rehydrate first, or a hard refresh bounces a valid session out.
  const authed = _hydrated && !!token && admin?.role === 'superadmin';
  useEffect(() => {
    if (_hydrated && !authed) router.replace('/super-admin/login');
  }, [_hydrated, authed, router]);

  const { data: m, isLoading } = useQuery({
    queryKey: ['sa-metrics'],
    queryFn: () => api.get('/admin/super-admin/metrics').then((r) => r.data.data),
    enabled: authed,
    refetchInterval: 60_000,
  });

  const { data: trends } = useQuery({
    queryKey: ['sa-trends', days],
    queryFn: () => api.get(`/admin/super-admin/trends?days=${days}`).then((r) => r.data.data),
    enabled: authed,
  });

  const { data: sla } = useQuery({
    queryKey: ['sa-sla'],
    queryFn: () => api.get('/admin/super-admin/sla').then((r) => r.data.data),
    enabled: authed,
  });

  const { data: reqs } = useQuery({
    queryKey: ['sa-requests', reqPage, reqSearch, reqStatus],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(reqPage), limit: '20' });
      if (reqSearch.trim()) p.set('search', reqSearch.trim());
      if (reqStatus !== 'all') p.set('status', reqStatus);
      return api.get(`/admin/super-admin/requests?${p}`).then((r) => r.data.data);
    },
    enabled: authed && tab === 'requests',
  });

  const { data: students } = useQuery({
    queryKey: ['sa-students', stuPage, stuSearch],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(stuPage), limit: '25' });
      if (stuSearch.trim()) p.set('search', stuSearch.trim());
      return api.get(`/admin/super-admin/students?${p}`).then((r) => r.data.data);
    },
    enabled: authed && tab === 'students',
  });

  const { data: staff } = useQuery({
    queryKey: ['sa-staff'],
    queryFn: () => api.get('/admin/super-admin/staff').then((r) => r.data.data.staff),
    enabled: authed && tab === 'staff',
  });

  const s = m?.summary;
  const backlogSpark = useMemo(() => (trends?.series || []).map((p: any) => p.backlog), [trends]);
  const raisedSpark = useMemo(() => (trends?.series || []).map((p: any) => p.raised), [trends]);

  const download = (dataset: string) => {
    const token = useAuthStore.getState().token;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/super-admin/export?dataset=${dataset}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mr-one-${dataset}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  };

  const signOut = async () => {
    try { await api.post('/admin/auth/logout'); } catch {}
    clearAuth();
    router.push('/super-admin/login');
  };

  const staffRoleLabels: Record<string, string> = {
    dsw: 'Student Welfare', dean: 'Deans', hod: 'HODs', staff: 'Directors & others',
  };

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    const q = staffSearch.trim().toLowerCase();
    return q ? staff.filter((x: any) => `${x.name} ${x.email} ${x.designation || ''}`.toLowerCase().includes(q)) : staff;
  }, [staff, staffSearch]);

  if (isLoading || !s) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#8B1A1A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-gray-500 font-semibold tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F7' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(250,248,247,.88)', borderColor: '#ECE7E6' }}>
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Image src="/mr-mark.png" alt="" width={34} height={34} className="object-contain shrink-0" />
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-gray-900 leading-tight">MR One</p>
                <p className="text-[11px] text-gray-500 leading-tight">Super Admin · Manav Rachna University</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:block text-[12px] text-gray-500 max-w-[200px] truncate">{admin?.email}</span>
              <button
                onClick={signOut}
                className="text-[12.5px] font-semibold px-3.5 py-2 rounded-full text-white transition-all hover:-translate-y-px hover:shadow-md cursor-pointer"
                style={{ background: MAROON }}
              >
                Sign out
              </button>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto -mb-px" aria-label="Sections">
            {TABS.map((t) => {
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={on ? 'page' : undefined}
                  className="relative text-[13.5px] font-semibold px-3.5 py-2.5 whitespace-nowrap transition-colors cursor-pointer"
                  style={{ color: on ? MAROON : '#6B7280' }}
                >
                  {t.label}
                  {on && <span className="absolute left-2 right-2 -bottom-px h-[2.5px] rounded-full" style={{ background: MAROON }} />}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-5 sm:px-8 py-7 flex flex-col gap-6">
        {/* ── KPI row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatTile label="Students" value={fmt(s.totalStudents)} hint={`${fmt(s.activeStudents)} active`} />
          <StatTile label="Staff" value={fmt(s.totalStaff)} hint={`${m.staffByRole?.length || 0} roles`} />
          <StatTile label="Requests" value={fmt(s.totalRequests)} hint={`${fmt(s.activeRequests)} still open`} spark={raisedSpark} />
          <StatTile
            label="Resolution rate" value={`${s.resolutionRate}%`}
            hint={`${fmt(s.resolvedRequests)} of ${fmt(s.totalRequests)} closed`}
          />
          <StatTile label="Avg turnaround" value={hrs(s.avgResolutionTimeHours)} hint="Raised to resolved" />
          <StatTile
            label="Open backlog" value={fmt(s.activeRequests)}
            hint={trends ? `${trends.netChange >= 0 ? '+' : ''}${trends.netChange} over ${days}d` : ''}
            spark={backlogSpark} accent="#EA580C"
          />
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <>
            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
              <Panel
                title="Raised vs resolved"
                subtitle="Daily volume, and whether the queue is clearing"
                action={
                  <div className="flex gap-1 bg-[#F4F0EF] rounded-lg p-0.5" role="group" aria-label="Time range">
                    {RANGES.map((d) => (
                      <button
                        key={d} onClick={() => setDays(d)} aria-pressed={days === d}
                        className="text-[11.5px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        style={days === d ? { background: '#fff', color: MAROON } : { color: '#6B7280' }}
                      >{d}d</button>
                    ))}
                  </div>
                }
                table={
                  <DataTable
                    head={['Date', 'Raised', 'Resolved', 'Open after']}
                    rows={(trends?.series || []).slice(-30).map((p: any) => [p.date, p.raised, p.resolved, p.backlog])}
                  />
                }
              >
                {trends ? <TrendLines series={trends.series} /> : <ChartSkeleton />}
              </Panel>

              <Panel
                title="Where everything stands"
                subtitle={`${fmt(s.totalRequests)} requests by status`}
                table={
                  <DataTable
                    head={['Status', 'Requests', 'Share']}
                    rows={Object.entries(m.statusDistribution || {})
                      .filter(([, n]) => (n as number) > 0)
                      .map(([k, n]) => [
                        (STATUS as any)[k]?.label || k, fmt(n as number),
                        `${Math.round(((n as number) / (s.totalRequests || 1)) * 100)}%`,
                      ])}
                  />
                }
              >
                <StatusBar counts={m.statusDistribution || {}} />
                <div className="mt-6 pt-5 border-t border-[#F2EEED] flex flex-col gap-4">
                  <Meter
                    pct={s.resolutionRate} label="Resolved"
                    caption={`${fmt(s.activeRequests)} still moving through the workflow`}
                  />
                  {sla && (
                    <Meter
                      pct={sla.overall.complianceRate} label="Response windows met"
                      caption={`${fmt(sla.overall.breached)} of ${fmt(sla.overall.total)} stages ran past their window`}
                    />
                  )}
                </div>
              </Panel>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Panel
                title="Busiest categories" subtitle="Requests raised, all time"
                table={<DataTable head={['Category', 'Total', 'Resolved']} rows={(m.byCategory || []).map((c: any) => [c.name, c.total, c.resolved])} />}
              >
                <RankedBars
                  rows={(m.byCategory || []).slice(0, 7).map((c: any) => ({
                    label: c.name, value: c.total,
                    sub: `${c.resolved} resolved · ${c.pending} open`,
                  }))}
                />
              </Panel>

              <Panel
                title="By school" subtitle="Where requests come from"
                table={<DataTable head={['School', 'Total', 'Resolved']} rows={(m.bySchool || []).map((x: any) => [x.name, x.total, x.resolved])} />}
              >
                <RankedBars
                  rows={(m.bySchool || []).slice(0, 7).map((x: any) => ({
                    label: x.name, value: x.total,
                    sub: `${x.resolved} resolved · ${x.pending} open`,
                  }))}
                />
              </Panel>

              <Panel title="Staff coverage" subtitle="Who is on the system">
                <RankedBars
                  rows={(m.staffByRole || []).map((r: any) => ({
                    label: staffRoleLabels[r._id] || r._id, value: r.count,
                  }))}
                  unit=""
                />
                <div className="mt-5 pt-4 border-t border-[#F2EEED]">
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Escalation goes to{' '}
                    <span className="font-semibold text-gray-800">
                      {m.escalationConfig?.recipientLabel || 'the configured authority'}
                    </span>
                    {m.escalationConfig?.intakeHours && (
                      <> after <span className="font-semibold text-gray-800">{m.escalationConfig.intakeHours}h</span> at
                      the desk or <span className="font-semibold text-gray-800">{m.escalationConfig.forwardedHours}h</span> with a department.</>
                    )}
                  </p>
                </div>
              </Panel>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Panel title="Longest waiting" subtitle="Open requests, oldest first — chase these">
                <RequestRows rows={(m.bottlenecks || []).slice(0, 8)} />
              </Panel>
              <Panel title="Just in" subtitle="Most recently raised">
                <RequestRows rows={(m.recentRequests || []).slice(0, 8)} />
              </Panel>
            </div>
          </>
        )}

        {/* ══ REQUESTS ══ */}
        {tab === 'requests' && (
          <Panel
            title="Every request"
            subtitle={reqs ? `${fmt(reqs.pagination.total)} in total` : 'Loading…'}
            action={<ExportButton onClick={() => download('requests')} />}
          >
            <div className="flex flex-wrap gap-2 mb-5">
              <input
                value={reqSearch}
                onChange={(e) => { setReqSearch(e.target.value); setReqPage(1); }}
                placeholder="Search ticket, subject or student…"
                className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-xl border border-[#ECE7E6] text-[13px] text-gray-900 outline-none focus:ring-2 focus:ring-[#8B1A1A]/25"
              />
              <select
                value={reqStatus}
                onChange={(e) => { setReqStatus(e.target.value); setReqPage(1); }}
                className="px-3.5 py-2.5 rounded-xl border border-[#ECE7E6] text-[13px] text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All statuses</option>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-[#ECE7E6]">
                    {['Ticket', 'Subject', 'Student', 'School', 'Status', 'Raised'].map((h) => (
                      <th key={h} className="font-semibold pb-2.5 pr-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reqs?.requests || []).map((r: any) => (
                    <tr key={r._id} className="border-b border-[#F4F0EF] hover:bg-[#FBF8F7] transition-colors">
                      <td className="py-3 pr-3 font-bold whitespace-nowrap" style={{ color: MAROON }}>#{r.ticketId}</td>
                      <td className="py-3 pr-3 text-gray-900 max-w-[280px] truncate">{r.subject}</td>
                      <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">
                        {r.student?.name}
                        <span className="block text-[11.5px] text-gray-400">{r.student?.rollNumber}</span>
                      </td>
                      <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{r.school?.code || '—'}</td>
                      <td className="py-3 pr-3"><StatusPill status={r.status} /></td>
                      <td className="py-3 pr-3 text-gray-500 whitespace-nowrap">{ago(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reqs && reqs.requests.length === 0 && <Empty msg="No requests match that." />}
            </div>
            {reqs && <Pager page={reqPage} pages={reqs.pagination.pages} onChange={setReqPage} />}
          </Panel>
        )}

        {/* ══ STUDENTS ══ */}
        {tab === 'students' && (
          <Panel
            title="Student directory"
            subtitle={students ? `${fmt(students.pagination.total)} enrolled` : 'Loading…'}
            action={<ExportButton onClick={() => download('students')} />}
          >
            <input
              value={stuSearch}
              onChange={(e) => { setStuSearch(e.target.value); setStuPage(1); }}
              placeholder="Search name, roll number or email…"
              className="w-full mb-5 px-3.5 py-2.5 rounded-xl border border-[#ECE7E6] text-[13px] text-gray-900 outline-none focus:ring-2 focus:ring-[#8B1A1A]/25"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-[#ECE7E6]">
                    {['Name', 'Roll number', 'School', 'Department', 'Requests', 'Resolved'].map((h, i) => (
                      <th key={h} className={`font-semibold pb-2.5 pr-3 whitespace-nowrap ${i >= 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(students?.students || []).map((st: any) => (
                    <tr key={st._id} className="border-b border-[#F4F0EF] hover:bg-[#FBF8F7] transition-colors">
                      <td className="py-3 pr-3 font-medium text-gray-900">
                        {st.name}
                        <span className="block text-[11.5px] text-gray-400 font-normal">{st.email}</span>
                      </td>
                      <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{st.rollNumber}</td>
                      <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{st.school?.code || '—'}</td>
                      <td className="py-3 pr-3 text-gray-600 max-w-[220px] truncate">{st.department || '—'}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-gray-900 font-semibold">{st.requestsTotal ?? 0}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-gray-600">{st.requestsResolved ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students && students.students.length === 0 && <Empty msg="No students match that." />}
            </div>
            {students && <Pager page={stuPage} pages={students.pagination.pages} onChange={setStuPage} />}
          </Panel>
        )}

        {/* ══ STAFF ══ */}
        {tab === 'staff' && (
          <Panel
            title="Staff directory"
            subtitle={staff ? `${staff.length} accounts` : 'Loading…'}
            action={<ExportButton onClick={() => download('staff')} />}
          >
            <input
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              placeholder="Search name, email or designation…"
              className="w-full mb-5 px-3.5 py-2.5 rounded-xl border border-[#ECE7E6] text-[13px] text-gray-900 outline-none focus:ring-2 focus:ring-[#8B1A1A]/25"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-[#ECE7E6]">
                    {['Name', 'Email', 'Role', 'In their queue', 'Status'].map((h, i) => (
                      <th key={h} className={`font-semibold pb-2.5 pr-3 whitespace-nowrap ${i === 3 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((x: any) => (
                    <tr key={x._id} className="border-b border-[#F4F0EF] hover:bg-[#FBF8F7] transition-colors">
                      <td className="py-3 pr-3 font-medium text-gray-900">
                        {x.name}
                        {x.designation && <span className="block text-[11.5px] text-gray-400 font-normal">{x.designation}</span>}
                      </td>
                      <td className="py-3 pr-3 text-gray-600">{x.email}</td>
                      <td className="py-3 pr-3 text-gray-600 uppercase text-[11.5px] font-semibold tracking-wide">{x.role}</td>
                      <td className="py-3 pr-3 text-right tabular-nums font-semibold" style={{ color: x.pendingStagesCount > 0 ? '#9A3412' : '#6B7280' }}>
                        {x.pendingStagesCount ?? 0}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: x.isActive ? '#0CA30C' : '#9CA3AF' }} />
                          {x.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {staff && filteredStaff.length === 0 && <Empty msg="No staff match that." />}
            </div>
          </Panel>
        )}

        {/* ══ SLA ══ */}
        {tab === 'sla' && sla && (
          <div className="flex flex-col gap-6">
            <div className="grid md:grid-cols-3 gap-3">
              <StatTile label="Overall compliance" value={`${sla.overall.complianceRate}%`} hint={`${fmt(sla.overall.total)} stages measured`} />
              <StatTile label="Desk window" value={`${sla.windows.intakeHours}h`} hint={`${sla.intake.complianceRate}% met · avg ${hrs(sla.intake.avgHours)}`} />
              <StatTile label="Department window" value={`${sla.windows.forwardedHours}h`} hint={`${sla.forwarded.complianceRate}% met · avg ${hrs(sla.forwarded.avgHours)}`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Panel title="Are the windows being met?" subtitle="Each stage against its own deadline">
                <div className="flex flex-col gap-5">
                  <Meter pct={sla.intake.complianceRate} label={`${sla.intake.label} — ${sla.windows.intakeHours}h`}
                         caption={`${fmt(sla.intake.breached)} of ${fmt(sla.intake.total)} ran over · ${fmt(sla.intake.open)} still open`} />
                  <Meter pct={sla.forwarded.complianceRate} label={`${sla.forwarded.label} — ${sla.windows.forwardedHours}h`}
                         caption={`${fmt(sla.forwarded.breached)} of ${fmt(sla.forwarded.total)} ran over · ${fmt(sla.forwarded.open)} still open`} />
                </div>
              </Panel>

              <Panel
                title="By desk" subtitle="Most overruns first"
                table={<DataTable head={['Desk', 'Stages', 'Over', 'Avg']} rows={sla.byOwner.map((o: any) => [o.owner, o.total, o.breached, hrs(o.avgHours)])} />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.5px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-[#ECE7E6]">
                        {['Desk', 'Stages', 'Over', 'Avg', 'Met'].map((h, i) => (
                          <th key={h} className={`font-semibold pb-2 pr-2 ${i ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sla.byOwner.map((o: any) => (
                        <tr key={o.owner} className="border-b border-[#F4F0EF]">
                          <td className="py-2.5 pr-2 text-gray-900 font-medium max-w-[200px] truncate">{o.owner}</td>
                          <td className="py-2.5 pr-2 text-right tabular-nums text-gray-600">{o.total}</td>
                          <td className="py-2.5 pr-2 text-right tabular-nums font-semibold" style={{ color: o.breached ? '#B3261E' : '#6B7280' }}>{o.breached}</td>
                          <td className="py-2.5 pr-2 text-right tabular-nums text-gray-600">{hrs(o.avgHours)}</td>
                          <td className="py-2.5 pr-2 text-right tabular-nums font-semibold text-gray-900">{o.complianceRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── small pieces ─────────────────────────────────────────────────────────── */

function RequestRows({ rows }: { rows: any[] }) {
  if (!rows.length) return <Empty msg="Nothing here yet." />;
  return (
    <ul className="flex flex-col divide-y divide-[#F4F0EF] -my-2">
      {rows.map((r) => (
        <li key={r._id} className="py-2.5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold" style={{ color: MAROON }}>#{r.ticketId}</span>
              <span className="text-[11px] text-gray-400">{r.school?.code || ''}</span>
            </div>
            <p className="text-[13px] text-gray-900 truncate mt-0.5">{r.subject}</p>
            <p className="text-[11.5px] text-gray-500">{r.student?.name} · {ago(r.createdAt)}</p>
          </div>
          <StatusPill status={r.status} />
        </li>
      ))}
    </ul>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-[#ECE7E6] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      CSV
    </button>
  );
}

function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 mt-1 border-t border-[#F2EEED]">
      <p className="text-[12.5px] text-gray-500">Page {page} of {pages}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}
          className="text-[12.5px] font-semibold px-3 py-1.5 rounded-lg border border-[#ECE7E6] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
        >Previous</button>
        <button
          onClick={() => onChange(Math.min(pages, page + 1))} disabled={page >= pages}
          className="text-[12.5px] font-semibold px-3 py-1.5 rounded-lg border border-[#ECE7E6] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
        >Next</button>
      </div>
    </div>
  );
}

const Empty = ({ msg }: { msg: string }) => (
  <p className="text-[13px] text-gray-400 py-8 text-center">{msg}</p>
);

const ChartSkeleton = () => (
  <div className="h-[230px] rounded-xl bg-[#F6F3F2] animate-pulse" />
);
