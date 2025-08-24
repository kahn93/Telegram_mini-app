
import React, { createContext, useState, ReactNode } from 'react';
import checkIcon from '../assets/check.png';
import failIcon from '../assets/fail.png';
import infoIcon from '../assets/list.png';

export type Notification = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // ms
};

interface NotificationContextType {
  notify: (notification: Notification) => void;
}

export const NotificationContext = createContext<NotificationContextType>({ notify: () => {} });

// useNotification moved to useNotification.ts

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = (notif: Notification) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), notif.duration || 3000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background:
              notification.type === 'success'
                ? '#00b894'
                : notification.type === 'error'
                ? '#d63031'
                : '#222',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            boxShadow: '0 2px 16px #0004',
            fontWeight: 700,
            fontSize: 16,
            minWidth: 180,
            textAlign: 'center',
            animation: 'popNotif 0.5s',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {notification.type === 'success' && <img src={checkIcon} alt="Success" style={{ width: 24, verticalAlign: 'middle' }} />}
          {notification.type === 'error' && <img src={failIcon} alt="Error" style={{ width: 24, verticalAlign: 'middle' }} />}
          {notification.type === 'info' && <img src={infoIcon} alt="Info" style={{ width: 24, verticalAlign: 'middle' }} />}
          <span>{notification.message}</span>
          <style>{`
            @keyframes popNotif {
              0% { transform: scale(0.8); opacity: 0.5; }
              60% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
