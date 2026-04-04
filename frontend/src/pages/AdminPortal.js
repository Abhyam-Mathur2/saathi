import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MessageSquare } from 'lucide-react';
import ChatbotWidget from '../components/ChatbotWidget';

const AdminPortal = () => {
  const cards = [
    { title: 'Dashboard', desc: 'Open analytics and report summaries.', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Volunteer Management', desc: 'View, search, and contact volunteers.', href: '/volunteers', icon: Users },
    { title: 'Reports', desc: 'Create and monitor community reports.', href: '/report', icon: FileText },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Admin workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Manage platform operations</h1>
        <p className="mt-2 text-slate-600">Admins can monitor all reports, volunteers, and system data here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              </div>
              <p className="mt-3 text-sm text-slate-600">{card.desc}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <MessageSquare className="h-5 w-5 text-primary-600" />
          Admin quick help
        </div>
        <p className="mt-2 text-sm text-slate-600">Use the chatbot bubble for help with operations, feature locations, or feature usage.</p>
      </div>

      <ChatbotWidget defaultRole="admin" />
    </div>
  );
};

export default AdminPortal;
