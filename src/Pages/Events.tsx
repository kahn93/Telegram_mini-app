import React, { useEffect, useState } from 'react';
import { getActiveEvents, joinEvent, Event } from '../Database/eventsSupabase';
import trophyIcon from '../assets/trophy.png';
import listIcon from '../assets/list.png';

const Events: React.FC<{ userId: string }> = ({ userId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState<Record<number, boolean>>({});



  useEffect(() => {
    getActiveEvents().then(evts => {
      setEvents(evts);
      setLoading(false);
    });
  }, []);

  const handleJoin = async (eventId: number) => {
    await joinEvent(eventId, userId);
    setJoined(j => ({ ...j, [eventId]: true }));
  };



  return (
    <div style={{ maxWidth: 400, margin: '24px auto', background: '#f8fafc', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #24308a11' }}>
      <h3 style={{ color: '#24308a', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Seasonal Events & Challenges</h3>
      {loading ? <div>Loading events...</div> : events.length === 0 ? <div style={{ color: '#888' }}>No active events right now.</div> : (
        events.map(evt => (
          <div key={evt.id} style={{ background: '#fff', borderRadius: 8, marginBottom: 12, padding: 12, boxShadow: '0 1px 4px #24308a08' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={trophyIcon} alt="Trophy" style={{ width: 22, verticalAlign: 'middle' }} />
              <span style={{ fontWeight: 700, color: '#b88a00', fontSize: 15 }}>{evt.name}</span>
            </div>
            <div style={{ fontSize: 12, marginBottom: 6 }}>{evt.description}</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <img src={listIcon} alt="End" style={{ width: 14, verticalAlign: 'middle' }} />
              Ends: {evt.end_time?.slice(0, 16).replace('T', ' ')}
            </div>
            {!joined[evt.id!] ? (
              <button onClick={() => handleJoin(evt.id!)} style={{ background: '#ffe259', borderRadius: 6, padding: '4px 16px', fontWeight: 700 }}>Join</button>
            ) : (
              <span style={{ color: '#24308a', fontWeight: 700 }}>In Progress</span>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Events;
