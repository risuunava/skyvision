'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  city_name: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info';
  created_at: string;
  read: boolean;
}

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const mockNotifications: Notification[] = [
      { id: '1', city_name: 'Jakarta', title: 'Heavy Rain Warning', message: 'Heavy rain expected in the next 6 hours.', type: 'warning', created_at: new Date().toISOString(), read: false },
      { id: '2', city_name: 'Surabaya', title: 'High Temperature Alert', message: 'Temperature expected to reach 38°C.', type: 'alert', created_at: new Date().toISOString(), read: false },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b"><h3 className="text-lg font-semibold">Notifications</h3></div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No notifications</p></div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b hover:bg-gray-50">
                  <p className="text-sm font-medium">{n.city_name}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}