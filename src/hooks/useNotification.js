import { useCallback } from "react";
import { axiosPrivate } from "../api/axios";
import { notifyRoute } from "../utils/Endpoint";
import { toast } from "react-toastify";

/**
 * Custom hook for sending notifications
 * Supports multiple notification types including test/exam updates
 */
export const useNotification = () => {
  const sendNotification = useCallback(
    async (notificationData) => {
      try {
        const response = await axiosPrivate.post(
          `${notifyRoute}/send`,
          notificationData
        );

        if (response?.status === 200 || response?.status === 201) {
          return {
            success: true,
            message: response?.data?.message || "Notification sent successfully",
          };
        }
      } catch (error) {
        console.log("Notification Error:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "Failed to send notification",
        };
      }
    },
    []
  );

  /**
   * Send test/exam update notification
   */
  const sendTestExamNotification = useCallback(
    async (recipientIds, testExamData) => {
      const notificationPayload = {
        userIdList: recipientIds,
        title: `📝 ${testExamData.testName}`,
        body: `${testExamData.description || "New test/exam update"}${
          testExamData.date ? ` - ${testExamData.date}` : ""
        }`,
        notificationType: "test-exam",
        route: testExamData.route || "/applications",
        metadata: {
          testId: testExamData.testId,
          type: testExamData.type, // 'test' or 'exam'
          date: testExamData.date,
          duration: testExamData.duration,
        },
      };

      return sendNotification(notificationPayload);
    },
    [sendNotification]
  );

  /**
   * Send application update notification
   */
  const sendApplicationNotification = useCallback(
    async (recipientIds, updateData) => {
      const notificationPayload = {
        userIdList: recipientIds,
        title: `📋 Application Update`,
        body: updateData.message || "Your application has been updated",
        notificationType: "application",
        route: updateData.route || "/applications",
      };

      return sendNotification(notificationPayload);
    },
    [sendNotification]
  );

  /**
   * Send task assignment notification
   */
  const sendTaskNotification = useCallback(
    async (recipientIds, taskData) => {
      const notificationPayload = {
        userIdList: recipientIds,
        title: `✅ New Task Assigned`,
        body: taskData.taskName || "You have been assigned a new task",
        notificationType: "task",
        route: taskData.route || "/applications",
      };

      return sendNotification(notificationPayload);
    },
    [sendNotification]
  );

  return {
    sendNotification,
    sendTestExamNotification,
    sendApplicationNotification,
    sendTaskNotification,
  };
};

export default useNotification;
