'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-request', id],
    queryFn: () => api.get(`/requests/admin/detail/${id}`).then(r => r.data.data),
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading details...</div>;
  if (!data?.request) return <div className="p-8 text-red-500">Request not found.</div>;

  const { request, stages } = data;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="mb-6 text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2">
        ← Back to Requests
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{request.subject}</h2>
            <p className="text-gray-500 text-sm">Ticket ID: <span className="font-semibold text-gray-800">#{request.ticketId}</span></p>
          </div>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold uppercase">{request.status.replace('_', ' ')}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Student Details</h3>
            <p className="font-medium text-gray-900">{request.student?.name}</p>
            <p className="text-sm text-gray-600">{request.student?.rollNumber}</p>
            <p className="text-sm text-gray-600">{request.student?.email}</p>
            <p className="text-sm text-gray-600 mt-1">Dept: {request.student?.department || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category & School</h3>
            <p className="font-medium text-gray-900">{request.category?.name}</p>
            <p className="text-sm text-gray-600">School: {request.school?.name}</p>
            <p className="text-sm text-gray-400 mt-2">Filed on: {new Date(request.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
        </div>

        {request.attachments?.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Attachments</h3>
            <div className="flex flex-wrap gap-3">
              {request.attachments.map((file: any, i: number) => (
                <a key={i} href={file.url} target="_blank" rel="noreferrer"
                   className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-blue-600">{file.originalName}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Workflow Timeline</h3>
      
      <div className="space-y-4">
        {stages.map((stage: any, index: number) => (
          <div key={stage._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Stage {stage.stageIndex + 1}: {stage.stageName}</h4>
                <p className="text-xs text-gray-500 mt-1">Recipient: <span className="font-medium text-gray-800">{stage.recipientEmails.join(', ')}</span></p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 uppercase">
                {stage.status.replace('_', ' ')}
              </span>
            </div>

            {stage.handoverNote && (
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mb-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">Handover Note from {stage.handoverFrom}</p>
                <p className="text-sm text-blue-900 italic">{stage.handoverNote}</p>
              </div>
            )}

            {stage.remarks && (
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400 mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Remarks left by Actor</p>
                <p className="text-sm text-gray-800">{stage.remarks}</p>
              </div>
            )}

            {stage.attachments?.length > 0 && (
              <div className="flex gap-2 mb-3">
                {stage.attachments.map((file: any, i: number) => (
                  <a key={i} href={file.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    📎 {file.originalName}
                  </a>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-400 mt-2 flex gap-4 border-t border-gray-50 pt-2">
              {stage.emailSentAt && <p>Emailed: {new Date(stage.emailSentAt).toLocaleString()}</p>}
              {stage.actionTakenAt && <p>Action Taken: {new Date(stage.actionTakenAt).toLocaleString()}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
