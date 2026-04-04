import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, MapPin, ArrowRight } from 'lucide-react';
import ChatbotWidget from '../components/ChatbotWidget';
import { getSession } from '../utils/roleAuth';
import { apiUrl } from '../config/api';

const MAX_DISTANCE_KM = 25;

const getDistanceInKm = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const VolunteerPortal = () => {
  const [reports, setReports] = useState([]);
  const [locationReady, setLocationReady] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const session = getSession();
        const volunteerEmail = session?.email;

        if (!volunteerEmail) {
          setLocationReady(false);
          setReports([]);
          return;
        }

        const [reportsResponse, volunteersResponse] = await Promise.all([
          axios.get(apiUrl('/api/reports')),
          axios.get(apiUrl('/api/volunteers')),
        ]);

        const activeVolunteer = (volunteersResponse.data.data || []).find(
          (volunteer) => String(volunteer.email || '').toLowerCase() === String(volunteerEmail).toLowerCase()
        );

        const volunteerCoordinates = activeVolunteer?.location?.coordinates;
        if (!volunteerCoordinates || volunteerCoordinates.length < 2) {
          setLocationReady(false);
          setReports([]);
          return;
        }

        const urgentNearbyReports = (reportsResponse.data.data || [])
          .filter((report) => Number(report.urgency) >= 8)
          .map((report) => ({
            ...report,
            distanceKm: report?.location?.coordinates?.length >= 2
              ? getDistanceInKm(volunteerCoordinates, report.location.coordinates)
              : Number.MAX_SAFE_INTEGER,
          }))
          .filter((report) => report.distanceKm <= MAX_DISTANCE_KM)
          .sort((a, b) => a.distanceKm - b.distanceKm);

        setLocationReady(true);
        setReports(urgentNearbyReports.slice(0, 5));
      } catch (error) {
        setLocationReady(false);
        setReports([]);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Volunteer workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">See urgent matches and communicate quickly</h1>
        <p className="mt-2 text-slate-600">Volunteers only see urgent reports within {MAX_DISTANCE_KM} km of their registered location.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.length > 0 ? reports.map((report) => (
          <div key={report._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{report.issueType}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900 line-clamp-2">{report.description}</h2>
              </div>
              <div className="rounded-full bg-red-50 p-2 text-red-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              {report.location?.address || 'Unknown location'}
            </p>
            <p className="mt-1 text-xs text-slate-500">{report.distanceKm.toFixed(1)} km from you</p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/match/${report._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Open Match <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500 md:col-span-2 xl:col-span-3">
            {locationReady
              ? `No urgent reports found within ${MAX_DISTANCE_KM} km of your location right now.`
              : 'Location unavailable for this volunteer account. Please register with a valid address and log in again.'}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          Volunteer communication
        </div>
        <p className="mt-2 text-sm text-slate-600">Use the WhatsApp send button inside match cards to message citizens or coordinators directly.</p>
        <p className="mt-1 text-sm text-slate-600">You can also review volunteers from the directory for support coordination.</p>
      </div>

      <ChatbotWidget defaultRole="volunteer" />
    </div>
  );
};

export default VolunteerPortal;
