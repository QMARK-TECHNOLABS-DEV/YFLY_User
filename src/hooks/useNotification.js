import { useCallback } from "react";
import { axiosPrivate } from "../api/axios";
import { notifyRoute } from "../utils/Endpoint";
import { toast } from "react-toastify";

/**
 * Custom hook for sending notifications
 * Supports multiple notification types including test/exam updates
 */
export const useNotification = () => {
  const sendNotification = useCallback(async (notificationData) => {
    try {
      // DEBUG: log outgoing request data for diagnostics
      console.info("[Notification] Sending to:", `${notifyRoute}/send`);
      console.debug("[Notification] Payload:", notificationData);

      const response = await axiosPrivate.post(
        `${notifyRoute}/send`,
        notificationData
      );

      console.debug("[Notification] Response:", {
        status: response?.status,
        data: response?.data,
        headers: response?.headers,
      });

      if (response?.status === 200 || response?.status === 201) {
        return {
          success: true,
          message: response?.data?.message || "Notification sent successfully",
        };
      }

      // Unexpected status
      console.warn(
        "[Notification] Unexpected response status:",
        response?.status
      );
      return {
        success: false,
        message:
          response?.data?.message || `Unexpected status: ${response?.status}`,
      };
    } catch (error) {
      // Detailed error logging for easier debugging
      console.error("[Notification] Error sending notification:", {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        responseData: error?.response?.data,
        request: error?.request,
        config: error?.config,
      });

      const serverMsg =
        error?.response?.data?.message || error?.response?.data?.msg;
      return {
        success: false,
        message: serverMsg || "Failed to send notification",
        responseData: error?.response?.data,
        status: error?.response?.status,
      };
    }
  }, []);

  /**
   * Send test/exam update notification
   */
  const sendTestExamNotification = useCallback(
    async (employeeIds = [], studentIds = [], testExamData) => {
      // Combine recipients but include explicit fields for both types to support backend requirements
      const recipientIds = [...(employeeIds || []), ...(studentIds || [])];

      // Build body including date and time when available
      const bodyParts = [testExamData.description || "New test/exam update"];
      if (testExamData.date) bodyParts.push(testExamData.date);
      if (testExamData.time) bodyParts.push(testExamData.time);

      const notificationPayload = {
        // Backwards compatible main list
        userIdList: recipientIds,
        // Explicit lists to allow backend to distinguish employee vs student recipients
        employeeIdList: employeeIds,
        studentIdList: studentIds,
        title: `📝 ${testExamData.testName}`,
        body: bodyParts.join(" - "),
        notificationType: "test-exam",
        route: testExamData.route || "/applications",
        metadata: {
          testId: testExamData.testId,
          type: testExamData.type, // 'test' or 'exam'
          date: testExamData.date,
          time: testExamData.time, // added time
          duration: testExamData.duration,
        },
      };

      return sendNotification(notificationPayload);
    },
    [sendNotification]
  );

  /**
   * Send employee test/exam notification directly via employee notification endpoint
   * Use when only students should be notified by an employee
   */
  const sendEmployeeTestExamNotification = useCallback(
    async (studentIds = [], testExamData) => {
      try {
        const payload = {
          title: `📝 ${testExamData.testName}`,
          body: [
            testExamData.description || "New test/exam update",
            testExamData.date,
            testExamData.time,
          ]
            .filter(Boolean)
            .join(" - "),
          route: testExamData.route || "/applications",
          metadata: {
            type: testExamData.type,
            date: testExamData.date,
            time: testExamData.time,
            duration: testExamData.duration,
          },
          studentIdList: studentIds || [],
        };

        const response = await axiosPrivate.post(
          `/api/employee/notification/create-exam`,
          payload
        );

        if (response?.status === 200 || response?.status === 201) {
          return {
            success: true,
            message:
              response?.data?.message || "Notification sent successfully",
          };
        }

        return {
          success: false,
          message:
            response?.data?.message || `Unexpected status: ${response?.status}`,
          status: response?.status,
          responseData: response?.data,
        };
      } catch (error) {
        console.error(
          "[Notification] Error sending employee test exam notification:",
          {
            message: error?.message,
            status: error?.response?.status,
            responseData: error?.response?.data,
          }
        );
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            "Failed to send employee exam notification",
          responseData: error?.response?.data,
          status: error?.response?.status,
        };
      }
    },
    []
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
    sendEmployeeTestExamNotification,
    sendApplicationNotification,
    sendTaskNotification,
  };
};

export default useNotification;
