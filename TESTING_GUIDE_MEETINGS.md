# Meeting Creation Feature - Testing Guide

## Overview
This guide helps you test the newly implemented admin meeting creation feature on `/admin/meetings`.

## Prerequisites
1. Admin account access
2. At least one Lead or Customer in the system
3. (Optional) Google Calendar API configured with proper OAuth scopes

## Test Scenarios

### Test 1: Create Meeting with Google Calendar (Production)
**Prerequisites:** Google Calendar API configured with environment variables

1. Navigate to `/admin/meetings`
2. Click "New Meeting" button (top right or empty state)
3. Fill in the form:
   - Attendee Type: Select "Lead"
   - Select Lead: Choose a lead from dropdown
   - Title: Should auto-populate as "Meeting with [Lead Name]"
   - Description: (Optional) "Discussing project requirements"
   - Duration: Select "30 minutes"
   - Date: Select a future date
   - Time: Select "09:00 AM"
4. Click "Create Meeting"
5. **Expected Results:**
   - Success toast notification appears
   - Redirected to meetings list view
   - New meeting appears in the list
   - Meeting has a valid Google Meet link (format: `https://meet.google.com/xxx-yyyy-zzz`)
   - "Join Meeting" button is visible for upcoming meetings
   - Clicking "Join Meeting" opens the Meet link in a new tab
   - Lead status updated to "MEETING_SCHEDULED"
   - Calendar invitation sent to the lead's email

### Test 2: Create Meeting without Google Calendar (Development)
**Prerequisites:** Google Calendar API NOT configured

1. Navigate to `/admin/meetings`
2. Click "New Meeting" button
3. Fill in the form:
   - Attendee Type: Select "Customer"
   - Select Customer: Choose a customer from dropdown
   - Title: Auto-populated as "Meeting with [Customer Name]"
   - Duration: Select "60 minutes"
   - Date: Select tomorrow's date
   - Time: Select "2:00 PM"
4. Click "Create Meeting"
5. **Expected Results:**
   - Success toast notification appears
   - Redirected to meetings list view
   - New meeting appears in the list
   - Meeting has a placeholder Google Meet link (format: `https://meet.google.com/xxx-yyyy-zzz`)
   - "Join Meeting" button is visible
   - No calendar invitation sent (expected when API not configured)

### Test 3: Form Validation
Test each validation rule:

1. Try to create meeting without selecting attendee
   - **Expected:** "Please select an attendee" error toast

2. Try to create meeting without title
   - **Expected:** "Please enter a meeting title" error toast

3. Try to create meeting without selecting date
   - **Expected:** "Please select a date" error toast

4. Try to select a past date
   - **Expected:** Calendar should disable past dates

### Test 4: Google Calendar API Failure Handling
**Prerequisites:** Google Calendar API configured but temporarily unavailable

1. Create a meeting (follow Test 1 steps)
2. **Expected Results:**
   - Even if API fails, meeting is still created
   - Placeholder Meet link is generated as fallback
   - Console shows error message but user sees success
   - Meeting is stored in database correctly

### Test 5: View and Filter Meetings

1. Create multiple meetings (mix of leads and customers)
2. Navigate to `/admin/meetings`
3. Test filters:
   - Search by title or attendee name
   - Filter by Status: "Scheduled"
   - Filter by Attendee Type: "Lead"
   - Filter by Date Range
4. Toggle between "List" and "Cards" view
5. **Expected Results:**
   - Filters work correctly
   - Both view modes display meetings properly
   - Upcoming meetings have visual distinction (ring border)
   - Past meetings are separated from upcoming

### Test 6: Join Meeting Flow

1. Create a meeting scheduled for today
2. Find the meeting in the list
3. Click "Join Meeting" button
4. **Expected Results:**
   - Opens Google Meet link in new tab
   - If Google Calendar was configured, should show valid Meet room
   - If placeholder, link still follows correct format

## Database Verification

After creating meetings, verify in the database:

```sql
SELECT
  id,
  title,
  eventId,
  meetUrl,
  scheduledAt,
  duration,
  status,
  leadId,
  customerId
FROM "Meeting"
ORDER BY createdAt DESC
LIMIT 5;
```

**Expected Fields:**
- `eventId`: Should be either Google Calendar event ID or generated placeholder (format: `evt_[timestamp]_[random]`)
- `meetUrl`: Should match pattern `https://meet.google.com/xxx-yyyy-zzz`
- `status`: Should be "SCHEDULED"
- Either `leadId` OR `customerId` should be populated (not both)

## Google Calendar Verification

If Google Calendar API is configured:

1. Check the configured Google Calendar
2. Verify event was created with:
   - Correct date/time
   - Attendee email added
   - Google Meet link attached
   - Proper timezone
   - Email notifications sent

## Error Scenarios to Test

### Invalid Lead/Customer ID
Manually call API with non-existent ID:
```javascript
trpc.admin.createMeeting.mutate({
  attendeeType: "lead",
  attendeeId: "non-existent-id",
  title: "Test",
  date: "2024-02-01",
  startTime: "09:00",
  duration: 30,
  timezone: "America/New_York"
})
```
**Expected:** "Lead not found" error

### Invalid Time Format
```javascript
trpc.admin.createMeeting.mutate({
  attendeeType: "lead",
  attendeeId: "[valid-id]",
  title: "Test",
  date: "2024-02-01",
  startTime: "9:00", // Missing leading zero
  duration: 30,
  timezone: "America/New_York"
})
```
**Expected:** Validation error about time format

## Success Criteria

All tests should pass with:
- ✅ Meetings created successfully
- ✅ Valid Google Meet links generated
- ✅ Proper error handling and fallbacks
- ✅ Form validation working correctly
- ✅ UI updates correctly after creation
- ✅ Database records are accurate
- ✅ No TypeScript compilation errors
- ✅ Application builds successfully

## Notes

- The feature works with or without Google Calendar API configuration
- Without Google Calendar: Placeholder links are generated (won't work for actual meetings)
- With Google Calendar: Real Meet links are created and invitations are sent
- Lead status automatically updates to "MEETING_SCHEDULED" when meeting is created
- Timezone is automatically detected from the user's browser
- Meeting links are validated to follow the pattern `https://meet.google.com/xxx-yyyy-zzz`
