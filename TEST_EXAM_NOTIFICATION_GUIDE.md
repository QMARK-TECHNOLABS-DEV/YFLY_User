# Test/Exam Notification Feature

## Overview
This feature allows administrators to send test and exam update notifications to selected users (employees/staff). The notifications include important details like test name, date, time, duration, and custom descriptions.

## Features

### 1. **Test/Exam Notification Modal**
- **File:** `src/components/notification/TestExamNotificationModal.jsx`
- **Purpose:** Modal dialog for creating and sending test/exam notifications
- **Accessible from:** Admin Dashboard (`📝 Test/Exam Notification` button)

### Features of the Modal:
- ✅ Enter test/exam name (required)
- ✅ Select test or exam type
- ✅ Add optional description
- ✅ Set date, time, and duration
- ✅ Select multiple users to notify (with Select All/Deselect All)
- ✅ Real-time validation
- ✅ Loading state during submission
- ✅ Success/error feedback with toast notifications

### 2. **Notification Hook (useNotification)**
- **File:** `src/hooks/useNotification.js`
- **Purpose:** Centralized notification sending functionality

**Available Methods:**
```javascript
const {
  sendNotification,           // Generic notification sender
  sendTestExamNotification,   // Specific for test/exam updates
  sendApplicationNotification, // For application updates
  sendTaskNotification        // For task assignments
} = useNotification();
```

**Usage Example:**
```javascript
const result = await sendTestExamNotification(
  [userId1, userId2], // recipient IDs
  {
    testName: "Final Math Exam",
    type: "exam", // 'test' or 'exam'
    description: "Chapters 1-5, focus on practice problems",
    date: "2025-12-15",
    time: "10:00",
    duration: "120", // in minutes
    route: "/applications"
  }
);

if (result.success) {
  console.log(result.message); // "Notification sent successfully"
}
```

### 3. **Enhanced Notification Display**
- **File:** `src/components/notification/NotifyCard.jsx`
- **Improvements:**
  - Type-specific icons and colors
  - Better visual hierarchy
  - Display metadata (date, time, duration for test/exam)
  - Unread indicator dot
  - Improved hover states

**Notification Types:**
- 📝 **test-exam** - Blue background with blue left border
- 📋 **application** - Purple background with purple left border
- ✅ **task** - Green background with green left border
- 💬 **comment** - Gray background with gray left border

## How to Use

### For Admins - Sending Test/Exam Notifications:

1. **Navigate to Admin Dashboard**
2. **Click "📝 Test/Exam Notification" button**
3. **Fill in the form:**
   - Test/Exam Name (required)
   - Type (Test or Exam)
   - Description (optional)
   - Date (required)
   - Time (optional)
   - Duration (optional)
4. **Select recipients** from the employee list
5. **Click "Send Notification"**

### For Users - Viewing Notifications:

1. **Click notification bell icon** in header
2. **View all notifications** or filter by "Unread"
3. **Click any notification** to navigate to details
4. **Notification types color-coded** for quick identification

## Notification Data Structure

The notification payload sent to the backend includes:

```javascript
{
  userIdList: [userId1, userId2, ...],
  title: "📝 Final Math Exam",
  body: "Final Math Exam - 2025-12-15",
  notificationType: "test-exam",
  route: "/applications",
  metadata: {
    testId: "test123",
    type: "exam",
    date: "2025-12-15",
    time: "10:00",
    duration: "120"
  }
}
```

## API Integration

**Endpoint:** `POST /api/notification/send`

**Required Backend Changes:**
The notification system expects the backend to:
1. Store notifications with type-specific metadata
2. Support `notificationType` field (test-exam, application, task, comment)
3. Store and return `metadata` object with test/exam details

## Styling Features

### Modal Styling:
- Clean, modern design with proper spacing
- Input validation feedback
- Disabled submit button until form is complete
- Responsive layout (mobile-friendly)
- Loading state visual feedback

### Notification Card Styling:
- Type-specific color coding
- Emoji icons for visual identification
- Metadata display with timestamps
- Unread indicator (blue dot)
- Hover effects for better UX

## Files Modified/Created

### New Files:
- ✅ `src/hooks/useNotification.js` - Notification hook
- ✅ `src/components/notification/TestExamNotificationModal.jsx` - Modal component

### Modified Files:
- ✅ `src/pages/admin/Dashboard.jsx` - Added test/exam notification button
- ✅ `src/components/notification/NotifyCard.jsx` - Enhanced display with types and metadata

## Future Enhancements

1. **Scheduling:** Allow scheduling notifications for future delivery
2. **Reminders:** Auto-send reminders before test/exam date
3. **Analytics:** Track notification delivery and read rates
4. **Templates:** Pre-built notification templates
5. **Recurring:** Set recurring test/exam notifications
6. **Export:** Export notification history to CSV/PDF

## Testing Checklist

- [ ] Open Admin Dashboard
- [ ] Click "📝 Test/Exam Notification" button
- [ ] Modal opens successfully
- [ ] Form validation works (required fields)
- [ ] Can select/deselect users
- [ ] "Select All" button works
- [ ] Form submission works without errors
- [ ] Success toast appears
- [ ] Modal closes after submission
- [ ] Notification appears in notification center
- [ ] Notification displays with correct icon and color
- [ ] Metadata (date, time, duration) displays correctly
- [ ] Clicking notification navigates to correct route

## Troubleshooting

**Modal doesn't open:**
- Ensure `TestExamNotificationModal` is imported in Dashboard
- Check that `testExamModal` state is properly initialized

**Notifications not sending:**
- Verify `/api/notification/send` endpoint exists and is working
- Check that employee IDs are valid
- Ensure authenticated user has permission to send notifications

**Metadata not displaying:**
- Backend must return notification with `metadata` object
- Ensure `notificationType` is set to "test-exam"

## Contact & Support

For issues or questions, please refer to the project documentation or contact the development team.
