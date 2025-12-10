# API Testing Guide for Follow-up Module

## Overview
This guide explains how to test whether the delete APIs are being called correctly and placed in the SingleFollow component.

---

## Method 1: Browser DevTools Network Tab (RECOMMENDED)

### Steps:
1. **Open your application** in Chrome/Firefox
2. **Open DevTools:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to **Network** tab
3. **Filter by fetch/XHR:**
   - Click the "XHR" or "Fetch" button to show only API calls
4. **Perform delete action:**
   - Try deleting a note/attachment/comment in the modal
5. **Check the request:**
   - You should see a `DELETE` request appear
   - Click on it to see details

### What You Should See:
```
Request URL: http://localhost:3001/api/student/followup/63a5b2c1d9e8f/note/abc123
Request Method: DELETE
Status Code: 200 (success) or 4xx/5xx (error)
```

---

## Method 2: Browser Console Logging

### Steps:
1. **Open DevTools Console** (F12 → Console tab)
2. **Perform a delete action**
3. **Look for console messages:**

### Expected Console Output:

#### For Delete Note:
```
🗑️ Delete Note Called: { noteId: 0, isNew: true, followupId: "63a5b2c1d9e8f" }
📝 Removing new note locally...
```

#### For Delete Saved Note:
```
🗑️ Delete Note Called: { noteId: "note-id-123", isNew: false, followupId: "63a5b2c1d9e8f" }
🌐 Calling API: /api/student/followup/63a5b2c1d9e8f/note/note-id-123
✅ API Response: { success: true, message: "Note deleted" }
```

#### For Delete Comment:
```
🗑️ Delete Comment Called: { commentId: "comment-id-456", followupId: "63a5b2c1d9e8f" }
🌐 Calling API: /api/student/followup/63a5b2c1d9e8f/comment/comment-id-456
✅ API Response: { success: true, data: {...} }
```

---

## Method 3: Network Inspection Details

### To See Full Request/Response:

1. **In Network tab**, click on the DELETE request
2. **Check these tabs:**

#### Headers Tab:
```
Request URL: http://localhost:3001/api/student/followup/{followupId}/note/{noteId}
Request Method: DELETE
Authorization: Bearer {token}
Content-Type: application/json
```

#### Response Tab:
```
{
  "success": true,
  "message": "Note deleted successfully",
  "data": {}
}
```

#### Payload Tab (for POST/PUT):
```
Shown if there's a request body
(DELETE requests usually don't have body)
```

---

## Method 4: Manual Testing Checklist

### Test Delete Note (New):
- [ ] Add a new note
- [ ] Click delete button on the note
- [ ] Check console: See "Removing new note locally..." message
- [ ] Note disappears immediately (no API call)

### Test Delete Note (Saved):
- [ ] Open a followup with existing notes
- [ ] Click delete button on saved note
- [ ] Check Network tab: DELETE request appears
- [ ] Check Response: Status 200 and success message
- [ ] Note disappears from list
- [ ] Toast shows "Note deleted successfully"

### Test Delete Attachment (Saved):
- [ ] Open a followup with existing attachments (green badge)
- [ ] Click delete button on attachment
- [ ] Check Network tab: DELETE request to `/attachment/{id}`
- [ ] Check console: Shows delete URL with attachmentId
- [ ] Attachment disappears from list

### Test Delete Comment:
- [ ] Add a comment or open with existing comments
- [ ] Click delete button (trash icon) on comment
- [ ] Check Network tab: DELETE request to `/comment/{id}`
- [ ] Check console: Shows "Delete Comment Called" with commentId
- [ ] Comment disappears immediately

---

## Common Issues & Solutions

### ❌ Delete Button Not Working
**Check:**
- [ ] Is the followupId being passed correctly? Check console logs
- [ ] Does the note/attachment/comment have a valid _id?
- [ ] Check Network tab for failed request (4xx/5xx error)

### ❌ API Returns 404
**Cause:** URL is incorrect
```
Check:
- followupId is present and correct
- noteId/attachmentId/commentId is present and correct
- URL format matches: /api/student/followup/{followupId}/note/{noteId}
```

### ❌ Delete Works but Item Still Shows
**Check:**
- [ ] State update is working (check React DevTools)
- [ ] Component is re-rendering after delete
- [ ] Filter logic is correct in setNotes/setComments

### ❌ 401 Unauthorized Error
**Cause:** Authentication token missing
```
Check:
- User is logged in
- Authorization header is being sent
- Token is valid in localStorage/cookies
```

---

## Quick Test Commands

Open browser console and run:

### Check if delete functions exist:
```javascript
// Check if you can see the function in network calls
console.log("Test delete functions are loaded")
```

### Verify followupId:
```javascript
// In the console, navigate to the modal and check:
console.log(document.querySelector('[class*="modal"]'))
```

---

## Performance Monitoring

### Check Response Time:
1. Network tab → Click DELETE request
2. Look at **Time** column (in milliseconds)
3. Normal range: 200-800ms

### Check Request Size:
1. Network tab → Click DELETE request
2. Look at **Size** column
3. DELETE requests should be very small (< 1KB)

---

## Summary Checklist

Before considering the API integration complete:

- [ ] Console logs show correct followupId
- [ ] Network tab shows DELETE requests with correct URLs
- [ ] Response status is 200 for successful deletes
- [ ] Item disappears from UI after deletion
- [ ] Toast notification appears
- [ ] No console errors (❌ marks)
- [ ] All three delete types work (note, attachment, comment)

---

## Next Steps if API Fails

If you find issues:

1. **Check API endpoint on backend** - Verify it exists
2. **Check error response** - Read the error message in Network tab
3. **Verify followupId** - Print it in console to confirm it's correct
4. **Test with Postman** - Test the API directly
5. **Check authentication** - Ensure token is being sent

