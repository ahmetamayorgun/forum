import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { formatDate } from '../../lib/supabase';

const AdminReports: React.FC = () => {
  const { pendingReports, updateReport, createModeration } = useAdmin();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'warn' | 'suspend' | 'ban' | 'delete' | 'hide'>('warn');
  const [durationHours, setDurationHours] = useState(24);

  const handleResolveReport = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport) return;

    const success = await updateReport(selectedReport.id, status, adminNotes);
    if (success) {
      setSelectedReport(null);
      setAdminNotes('');
    }
  };

  const handleModerationAction = async () => {
    if (!selectedReport) return;

    let targetType: 'user' | 'topic' | 'comment' = 'user';
    let targetId = '';

    if (selectedReport.reported_user_id) {
      targetType = 'user';
      targetId = selectedReport.reported_user_id;
    } else if (selectedReport.reported_topic_id) {
      targetType = 'topic';
      targetId = selectedReport.reported_topic_id;
    } else if (selectedReport.reported_comment_id) {
      targetType = 'comment';
      targetId = selectedReport.reported_comment_id;
    }

    const success = await createModeration(
      targetType,
      targetId,
      actionType,
      adminNotes,
      durationHours
    );

    if (success) {
      setSelectedReport(null);
      setAdminNotes('');
      setActionType('warn');
      setDurationHours(24);
    }
  };

  const getReportTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'spam': '🚫',
      'inappropriate': '⚠️',
      'harassment': '😡',
      'copyright': '📄',
      'other': '❓'
    };
    return icons[type] || '❓';
  };

  const getReportTypeText = (type: string) => {
    const texts: { [key: string]: string } = {
      'spam': 'Spam',
      'inappropriate': 'Uygunsuz İçerik',
      'harassment': 'Taciz',
      'copyright': 'Telif Hakkı',
      'other': 'Diğer'
    };
    return texts[type] || 'Bilinmeyen';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">🚨 Rapor Yönetimi</h2>
        <p className="text-slate-600 dark:text-slate-400">Bekleyen raporları inceleyin ve çözümleyin</p>
      </div>

      <div>
        {pendingReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Tüm Raporlar Çözüldü!</h3>
            <p className="text-slate-600 dark:text-slate-400">Şu anda bekleyen rapor bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getReportTypeIcon(report.report_type)}
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {getReportTypeText(report.report_type)}
                      </span>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(report.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    İncele
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <strong className="text-slate-700 dark:text-slate-300">Rapor Eden:</strong> {report.reporter_username}
                  </div>
                  
                  {report.reported_username && (
                    <div className="text-sm">
                      <strong className="text-slate-700 dark:text-slate-300">Raporlanan Kullanıcı:</strong> {report.reported_username}
                    </div>
                  )}
                  
                  {report.topic_title && (
                    <div className="text-sm">
                      <strong className="text-slate-700 dark:text-slate-300">Başlık:</strong> {report.topic_title}
                    </div>
                  )}
                  
                  {report.comment_content && (
                    <div className="text-sm">
                      <strong className="text-slate-700 dark:text-slate-300">Yorum:</strong> {report.comment_content.substring(0, 100)}...
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <strong className="text-slate-700 dark:text-slate-300">Sebep:</strong>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{report.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapor İnceleme Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Rapor İnceleme</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">Rapor Türü:</strong>
                  <div>{getReportTypeText(selectedReport.report_type)}</div>
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">Rapor Eden:</strong>
                  <div>{selectedReport.reporter_username}</div>
                </div>
                {selectedReport.reported_username && (
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Raporlanan:</strong>
                    <div>{selectedReport.reported_username}</div>
                  </div>
                )}
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">Tarih:</strong>
                  <div>{formatDate(selectedReport.created_at)}</div>
                </div>
              </div>

              <div>
                <strong className="text-slate-700 dark:text-slate-300">Rapor Sebebi:</strong>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{selectedReport.reason}</p>
              </div>

              {selectedReport.topic_title && (
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">Raporlanan Başlık:</strong>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{selectedReport.topic_title}</p>
                </div>
              )}

              {selectedReport.comment_content && (
                <div>
                  <strong className="text-slate-700 dark:text-slate-300">Raporlanan Yorum:</strong>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{selectedReport.comment_content}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Admin Notları:
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Rapor hakkında notlarınızı yazın..."
                  rows={3}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Moderation Eylemleri</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Eylem Türü:
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value as any)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="warn">⚠️ Uyarı</option>
                      <option value="suspend">⏸️ Askıya Alma</option>
                      <option value="ban">🚫 Yasaklama</option>
                      <option value="delete">🗑️ Silme</option>
                      <option value="hide">👁️ Gizleme</option>
                    </select>
                  </div>

                  {(actionType === 'suspend' || actionType === 'ban') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Süre (Saat):
                      </label>
                      <input
                        type="number"
                        value={durationHours}
                        onChange={(e) => setDurationHours(parseInt(e.target.value))}
                        min="1"
                        max="8760"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleResolveReport('dismissed')}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={() => handleModerationAction()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Moderation Uygula
              </button>
              <button
                onClick={() => handleResolveReport('resolved')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Çözüldü
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports; 