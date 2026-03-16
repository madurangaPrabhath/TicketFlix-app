import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  CircleAlert,
  DollarSign,
  Film,
  Info,
  Megaphone,
  Settings,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const NotificationDropdown = ({ buttonClassName = "", panelClassName = "" }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    userId,
    notifications,
    unreadNotificationCount,
    notificationsLoading,
    fetchNotifications,
    fetchUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useAppContext();

  useEffect(() => {
    const onClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    fetchUnreadNotifications(userId);

    const interval = setInterval(() => {
      fetchUnreadNotifications(userId);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const visibleNotifications = useMemo(
    () => (notifications || []).slice(0, 12),
    [notifications]
  );

  const openPanel = async () => {
    if (!userId) {
      return;
    }

    setIsOpen((prev) => !prev);

    if (!isOpen) {
      await fetchNotifications(userId, { limit: 20, skip: 0 });
    }
  };

  const onNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification._id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const onMarkAllRead = async () => {
    await markAllNotificationsAsRead(userId);
  };

  const onClearAll = async () => {
    await deleteAllNotifications(userId);
  };

  const getTimeAgo = (value) => {
    if (!value) {
      return "now";
    }

    const now = Date.now();
    const createdAt = new Date(value).getTime();
    const seconds = Math.max(1, Math.floor((now - createdAt) / 1000));

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSeverityIcon = (notification) => {
    const severity = notification?.severity;
    const type = notification?.type;

    if (severity === "success") {
      return <Check className="w-4 h-4 text-green-400" />;
    }
    if (severity === "warning") {
      return <CircleAlert className="w-4 h-4 text-amber-400" />;
    }
    if (severity === "error") {
      return <CircleAlert className="w-4 h-4 text-red-400" />;
    }

    if (type === "booking") return <Ticket className="w-4 h-4 text-blue-400" />;
    if (type === "show") return <Film className="w-4 h-4 text-violet-400" />;
    if (type === "revenue")
      return <DollarSign className="w-4 h-4 text-emerald-400" />;
    if (type === "alert") return <Megaphone className="w-4 h-4 text-amber-400" />;
    if (type === "system") return <Settings className="w-4 h-4 text-slate-300" />;

    return <Info className="w-4 h-4 text-slate-300" />;
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={openPanel}
        className={`relative p-2 text-gray-400 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-lg ${buttonClassName}`}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white font-bold text-center">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-[22rem] max-w-[92vw] bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 ${panelClassName}`}
        >
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {unreadNotificationCount} unread
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-2 border-b border-neutral-800 flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-300 px-2.5 py-1.5 rounded-md hover:bg-red-600/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificationsLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
            ) : visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`group p-3 border-b border-neutral-800/80 transition-colors ${
                    notification.read
                      ? "bg-transparent hover:bg-neutral-800/50"
                      : "bg-red-600/5 hover:bg-red-600/10"
                  }`}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getSeverityIcon(notification)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-300">
                              new
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
