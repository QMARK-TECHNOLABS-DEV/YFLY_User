import React from "react";
import { Link } from "react-router-dom";

const NotifyCard = ({
  item,
  selected,
  checkCard,
  setModal,
  changeReadStatus,
}) => {
  console.log(item);

  // Get icon based on notification type
  const getNotificationIcon = () => {
    switch (item?.notificationType) {
      case "test-exam":
        return "📝";
      case "application":
        return "📋";
      case "task":
        return "✅";
      case "comment":
        return "💬";
      default:
        return "📢";
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = () => {
    switch (item?.notificationType) {
      case "test-exam":
        return "bg-blue-50 border-l-4 border-blue-400";
      case "application":
        return "bg-purple-50 border-l-4 border-purple-400";
      case "task":
        return "bg-green-50 border-l-4 border-green-400";
      case "comment":
        return "bg-gray-50 border-l-4 border-gray-400";
      default:
        return "bg-gray-50 border-l-4 border-gray-400";
    }
  };

  const notificationHandler = () => {
    changeReadStatus("read");
  };

  return (
    <div
      className={`relative w-full p-3 rounded-lg shadow cursor-pointer flex gap-3 items-start transition-all hover:shadow-md ${getBackgroundColor()}`}
    >
      <input
        type="checkbox"
        checked={selected?.includes(item?._id)}
        onChange={() => checkCard(item?._id)}
        className="mt-1 cursor-pointer"
      />

      <div className="flex-1 min-w-0">
        <Link
          onClick={notificationHandler}
          to={`${item?.route}`}
          className="block"
        >
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">{getNotificationIcon()}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-800 truncate">
                {item?.title}
              </h3>
              <p className="text-sm text-gray-600 text-wrap break-words">
                {item?.body}
              </p>
              {item?.metadata && (
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {item?.metadata?.date && (
                    <p>📅 Date: {item?.metadata?.date}</p>
                  )}
                  {item?.metadata?.time && (
                    <p>🕐 Time: {item?.metadata?.time}</p>
                  )}
                  {item?.metadata?.duration && (
                    <p>⏱️ Duration: {item?.metadata?.duration} mins</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>

      {!item?.isRead && (
        <div className="w-2 h-2 bg-primary_colors rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

export default NotifyCard;
