import React, { useEffect, useState } from 'react';
import { AnalyticsEvent } from '../analytics';
import { supabase } from '../supabaseClient';

const AdminAnalytics: React.FC = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [eventType, setEventType] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    // Admin: fetch all events (not just own)
    const fetchAllEvents = async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) setError(error.message);
      else setEvents(data || []);
      setLoading(false);
    };
    fetchAllEvents();
  }, []);

  const filtered = events.filter(e =>
    (!userId || e.userid === userId) &&
    (!eventType || e.event === eventType)
  );

  return (
    <div style={{ padding: 24, background: '#222', color: '#fff', borderRadius: 12, maxWidth: 800, margin: '0 auto' }}>
      <h2>Analytics Events (Admin)</h2>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Filter by User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{ marginRight: 8, borderRadius: 4, padding: 4, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s' }}
          aria-label="Filter by User ID"
          tabIndex={0}
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
          onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
        />
        <input
          placeholder="Filter by Event Type"
          value={eventType}
          onChange={e => setEventType(e.target.value)}
          style={{ borderRadius: 4, padding: 4, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s' }}
          aria-label="Filter by Event Type"
          tabIndex={0}
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
          onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
        />
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: '#ff4d4f' }}>{error}</div> : (
        <table style={{ width: '100%', background: '#333', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#444' }}>
              <th style={{ color: '#ffe259' }}>Time</th>
              <th style={{ color: '#ffe259' }}>User ID</th>
              <th style={{ color: '#ffe259' }}>Event</th>
              <th style={{ color: '#ffe259' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ev => (
              <tr key={ev.created_at + ev.userid + ev.event}>
                <td>{ev.created_at?.replace('T', ' ').slice(0, 19)}</td>
                <td>{ev.userid}</td>
                <td>{ev.event}</td>
                <td><pre style={{ color: '#00ff99', fontSize: 12, margin: 0 }}>{JSON.stringify(ev.details, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAnalytics;
