import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/Card';
import { User, Clock } from 'lucide-react';

interface AuditTimelineProps {
  logs: any[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs }) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted/15">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary" /> {t('platformSecurity.auditLogs.liveTrail')}
        </h4>
      </div>

      <div className="p-5 space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="relative flex space-x-3 text-xs font-semibold hover:bg-secondary/10 p-2.5 rounded-xl transition border border-transparent hover:border-border">
            <div className="flex flex-col items-center">
              <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span className="font-bold text-foreground">{log.user}</span>
                <span>{log.timestamp}</span>
              </div>
              <p className="text-foreground/90 font-medium">
                {t(`status.${log.action}`)} {t('platformSecurity.auditLogs.onObject')} <strong className="font-extrabold text-foreground">{log.object}</strong>
              </p>
              <div className="flex items-center space-x-3 text-[10px] text-muted-foreground">
                <span className="bg-secondary px-1.5 py-0.5 rounded uppercase">{log.module}</span>
                <span>IP: {log.ip}</span>
                <span className={`font-bold ${log.status === 'Success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t(`status.${log.status}`)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default AuditTimeline;
