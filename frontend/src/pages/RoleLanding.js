import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserRound, HeartHandshake, Bot, ArrowRight } from 'lucide-react';
import ChatbotWidget from '../components/ChatbotWidget';

const roleCards = [
  {
    title: 'Admin',
    description: 'Monitor stats, manage volunteers, and oversee reports.',
    href: '/login',
    icon: Shield,
    accent: 'bg-slate-900 text-white',
  },
  {
    title: 'Volunteer',
    description: 'View urgent matches, message users, and coordinate help.',
    href: '/login',
    icon: HeartHandshake,
    accent: 'bg-primary-600 text-white',
  },
  {
    title: 'Citizen',
    description: 'Report community needs and ask the chatbot for help.',
    href: '/citizen/login',
    icon: UserRound,
    accent: 'bg-emerald-600 text-white',
  },
];

const features = [
  {
    title: 'Admin Features',
    points: ['Dashboard analytics', 'Volunteer management', 'Report monitoring'],
  },
  {
    title: 'Volunteer Features',
    points: ['Urgent task matching', 'WhatsApp communication', 'Assignment coordination'],
  },
  {
    title: 'Citizen Features',
    points: ['Submit reports', 'Browser location capture', 'AI chatbot support'],
  },
];

const RoleLanding = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          <Bot className="h-4 w-4" />
          Role-based access and chatbot support
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Saathi for admins, volunteers, and citizens
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Pick your role to enter the right feature set. Citizens get reporting and chatbot help, volunteers get assignment tools, and admins get oversight.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {roleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href} className={`rounded-2xl p-6 shadow-sm transition-transform hover:-translate-y-1 ${card.accent}`}>
              <Icon className="h-8 w-8" />
              <h2 className="mt-4 text-2xl font-bold">{card.title}</h2>
              <p className="mt-2 text-sm opacity-90">{card.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                Continue <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {features.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {section.points.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  {point}
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
