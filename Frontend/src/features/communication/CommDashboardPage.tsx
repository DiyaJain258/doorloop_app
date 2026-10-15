import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { MessageSquare, Mail, Phone, Bell, Send, Megaphone, ShieldAlert } from 'lucide-react';

export const CommDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Queries
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['comm-dashboard-metrics'],
    queryFn: () => api.communication.getMetrics(),
  });

  if (isLoading || !metrics) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title={t('commDashboard.title')}
        description={t('commDashboard.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/' },
          { label: t('nav.communication') },
        ]}
      />

      {/* QUICK ACTIONS BAR */}
      <div className="flex flex-wrap gap-2.5 p-3.5 bg-card border rounded-2xl">
        <Button size="sm" onClick={() => navigate({ to: '/communication/inbox' })} className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" /> {t('commDashboard.openInbox')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate({ to: '/communication/email' })} className="flex items-center gap-1">
          <Mail className="w-4 h-4" /> {t('commDashboard.sendEmail')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate({ to: '/communication/sms' })} className="flex items-center gap-1">
          <Phone className="w-4 h-4" /> {t('commDashboard.sendSms')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate({ to: '/communication/announcements' })} className="flex items-center gap-1">
          <Megaphone className="w-4 h-4" /> {t('commDashboard.publishAnnouncement')}
        </Button>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border bg-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('commDashboard.unifiedConversations')}</p>
            <p className="text-2xl font-black mt-1 text-primary">{metrics.totalConversations}</p>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold mt-4">{t('commDashboard.unreadMessages', { count: metrics.unreadMessages })}</span>
        </Card>

        <Card className="p-5 border bg-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('commDashboard.sentToday')}</p>
            <p className="text-2xl font-black mt-1 text-emerald-500">{metrics.emailsSentToday} Emails / {metrics.smsSentToday} SMS</p>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold mt-4">{t('commDashboard.deliveryCleared')}</span>
        </Card>

        <Card className="p-5 border bg-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('commDashboard.activeCampaigns')}</p>
            <p className="text-2xl font-black mt-1 text-indigo-500">{metrics.activeCampaigns}</p>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold mt-4">{t('commDashboard.scheduledDispatches', { count: metrics.scheduledMessages })}</span>
        </Card>

        <Card className="p-5 border bg-card flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('commDashboard.noticeBoardViews')}</p>
            <p className="text-2xl font-black mt-1 text-primary">{metrics.announcementViews}</p>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold mt-4">{t('commDashboard.averageReadRate')}</span>
        </Card>
      </div>

      {/* DELIVERY FAILURE BANNER */}
      {metrics.failedDeliveries > 0 && (
        <Card className="p-5 border bg-card border-rose-500/30 bg-rose-500/5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm uppercase text-rose-500">{t('commDashboard.deliveryIssues')}</h4>
              <p className="text-xs text-muted-foreground font-semibold">{t('commDashboard.failedDispatches', { count: metrics.failedDeliveries })}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10" onClick={() => navigate({ to: '/communication/activity' })}>
            {t('commDashboard.viewActivityLog')}
          </Button>
        </Card>
      )}
    </div>
  );
};
export default CommDashboardPage;
