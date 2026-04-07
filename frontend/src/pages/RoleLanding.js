import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserRound, HeartHandshake, Bot, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatbotWidget from '../components/ChatbotWidget';

const RoleLanding = () => {
  const { t } = useTranslation();

  const roleCards = [
    {
      titleKey: 'landing.admin',
      descKey: 'landing.adminDesc',
      href: '/login',
      icon: Shield,
      accent: 'bg-slate-900 text-white',
    },
    {
      titleKey: 'landing.volunteer',
      descKey: 'landing.volunteerDesc',
      href: '/login',
      icon: HeartHandshake,
      accent: 'bg-primary-600 text-white',
    },
    {
      titleKey: 'landing.citizen',
      descKey: 'landing.citizenDesc',
      href: '/citizen/login',
      icon: UserRound,
      accent: 'bg-emerald-600 text-white',
    },
  ];

  const features = [
    {
      titleKey: 'landing.adminFeatures',
      points: ['landing.dashboardAnalytics', 'landing.volunteerManagement', 'landing.reportMonitoring'],
    },
    {
      titleKey: 'landing.volunteerFeatures',
      points: ['landing.urgentTaskMatching', 'landing.whatsappCommunication', 'landing.assignmentCoordination'],
    },
    {
      titleKey: 'landing.citizenFeatures',
      points: ['landing.submitReports', 'landing.browserLocationCapture', 'landing.aiChatbotSupport'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          <Bot className="h-4 w-4" />
          {t('landing.badge')}
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t('landing.title')} for admins, volunteers, and citizens
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          {t('landing.chooseRole')}
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {roleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.titleKey} to={card.href} className={`rounded-2xl p-6 shadow-sm transition-transform hover:-translate-y-1 ${card.accent}`}>
              <Icon className="h-8 w-8" />
              <h2 className="mt-4 text-2xl font-bold">{t(card.titleKey)}</h2>
              <p className="mt-2 text-sm opacity-90">{t(card.descKey)}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                {t('landing.continue')} <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {features.map((section) => (
          <div key={section.titleKey} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">{t(section.titleKey)}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {section.points.map((pointKey) => (
                <li key={pointKey} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  {t(pointKey)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ChatbotWidget defaultRole="citizen" />
    </div>
  );
};

export default RoleLanding;
