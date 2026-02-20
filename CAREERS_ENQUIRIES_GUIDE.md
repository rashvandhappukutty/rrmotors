# Careers Feature - Updated to Use Enquiries System

## Overview
The Careers feature has been updated to integrate with the existing Enquiries system. When a user applies for a job, their application is saved as an enquiry with type "Career" instead of in a separate careers_applications table.

---

## How It Works

### User Side - Job Application

When a user visits the **Careers page** (`/careers`) and clicks "Apply Now" on a job posting:

1. **Form Fields**:
   - Full Name * (required)
   - Email Address * (required, validated)
   - Mobile Number * (required, 10+ digits)
   - Experience (Years) * (required)
   - Expected Salary * (required)
   - Additional Information (optional - for cover letter/why interested)

2. **Validation**:
   - All marked fields (*) must be filled
   - Email must be in valid format (example@domain.com)
   - Phone must have at least 10 digits
   - Experience must be a number

3. **On Submission**:
   - Application is saved as an **Enquiry** with:
     - `enquiry_type: "Career"`
     - Job position in message field
     - Experience and salary in dedicated fields
     - Customer details (name, email, phone)
   - User sees success confirmation
   - Form resets automatically
   - Email is sent to admin (if configured)

### Admin Side - Viewing Applications

Career applications appear in the **Enquiries section** of the Admin Panel:

1. **Location**: Go to `/admin` → Find "Enquiries" or "Career Applications"
2. **Filter**: Look for enquiries with `Type = "Career"`
3. **View Details**:
   - Applicant name, email, phone
   - Job position applied for
   - Years of experience
   - Expected salary
   - Additional notes/cover letter
   - Application date

4. **Actions**:
   - Update status (New → In Progress → Contacted → Converted → Closed)
   - Add follow-up notes
   - Assign to team member
   - Contact applicant via email/phone/WhatsApp
   - Schedule follow-up date

---

## API Integration

### Creating a Career Application

**Endpoint**: `POST /api/bikes/enquire`

**Payload**:
```json
{
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "enquiry_type": "Career",
  "message": "Job Position: Service Manager\nExperience: 5 years\nExpected Salary: 50,000 - 75,000\nAdditional Info: Interested in growth...",
  "budget_range": "50,000 - 75,000",
  "status": "New",
  "preferred_contact": "Phone"
}
```

**Response** (201 Created):
```json
{
  "id": 123,
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "enquiry_type": "Career",
  "status": "New",
  "created_at": "2026-02-04T10:30:00Z"
}
```

---

## Database Schema

Career applications use the existing `enquiries` table:

```sql
enquiries {
  id: BIGSERIAL PRIMARY KEY,
  customer_name: VARCHAR(100),        -- Applicant name
  email: VARCHAR(255),                 -- Applicant email
  phone: VARCHAR(20),                  -- Applicant phone
  enquiry_type: VARCHAR(50),          -- "Career" for job applications
  message: TEXT,                       -- Job details, experience, salary expectations
  budget_range: VARCHAR(50),          -- Expected salary range
  status: VARCHAR(20),                -- Application status (New, In Progress, etc.)
  preferred_contact: VARCHAR(20),     -- Preferred contact method
  follow_up_date: DATE,               -- Scheduled follow-up
  assigned_to: VARCHAR(100),          -- Assigned team member
  notes: TEXT,                        -- Admin notes
  created_at: TIMESTAMP,              -- Application date
  updated_at: TIMESTAMP               -- Last update
}
```

**No separate careers tables needed!**

---

## Benefits of This Approach

1. **Unified System**: All enquiries (bike purchase, service, careers) in one place
2. **Easier Management**: Admins manage all leads from one dashboard
3. **Scalable**: No need to maintain separate applications table
4. **Flexible**: Can easily add more enquiry types or fields
5. **Integrated Workflows**: Same status tracking, follow-up system for all enquiries

---

## Admin Dashboard Features

When viewing career enquiries:

| Feature | Details |
|---------|---------|
| **Search** | Filter by name, email, phone, status |
| **Status Tracking** | New → In Progress → Contacted → Converted → Closed |
| **Follow-up** | Set follow-up dates and reminders |
| **Assignment** | Assign to specific HR/Manager |
| **Bulk Actions** | Update status for multiple applications |
| **Export** | Download applications as CSV |
| **Notes** | Add private notes for team coordination |

---

## Career Application Workflow

```
Job Posted (by Admin)
     ↓
User Views Careers Page
     ↓
User Fills Application Form
(Name, Email, Phone, Experience, Salary, Cover Letter)
     ↓
Submit Application
     ↓
Application Saved as Enquiry (Type: "Career")
     ↓
Admin Notified
     ↓
Admin Reviews in Enquiries Section
     ↓
Admin Updates Status & Contacts Applicant
     ↓
Follow-up & Decision
```

---

## Field Mapping

When a user applies for a job, data is mapped to enquiry fields:

| Form Field | Maps To | Database Field |
|-----------|---------|-----------------|
| Full Name | Applicant Name | `customer_name` |
| Email | Contact Email | `email` |
| Mobile Number | Contact Phone | `phone` |
| Experience | Job Experience | Included in `message` |
| Expected Salary | Salary Range | `budget_range` |
| Job Position | Job Details | Start of `message` |
| Additional Info | Cover Letter | Part of `message` |
| — | Application Type | `enquiry_type` = "Career" |
| — | Default Status | `status` = "New" |
| — | Default Contact | `preferred_contact` = "Phone" |

---

## Example: Admin Viewing a Career Application

**Enquiry Details Screen Shows**:
```
ID: #1234
Type: Career
Status: New
Date: Feb 4, 2026

Customer Information:
- Name: John Doe
- Email: john@example.com
- Phone: +91 98765 43210

Application Details:
Job Position: Service Manager
Experience: 5 years
Expected Salary: ₹50,000 - ₹75,000 per month

Cover Letter:
"I'm interested in this position because..."

Admin Actions:
[Status Dropdown] [Follow-up Date] [Assign To]
[Notes Field] [Save]
```

---

## Making It Work

### Step 1: Verify Enquiries Table Exists

Check in Supabase SQL Editor:
```sql
SELECT * FROM enquiries LIMIT 1;
```

If table doesn't exist, run:
```sql
-- Create enquiries table (see create_enquiries_table.sql)
```

### Step 2: Test Application Submission

1. Go to `/careers`
2. Fill out and submit an application
3. Should see success notification
4. Check admin panel → Enquiries section for new Career enquiry

### Step 3: Admin Management

1. Go to `/admin`
2. Find enquiries section
3. Filter or search for "Career" type applications
4. Click on application to view details
5. Update status and add notes

---

## Troubleshooting

### Issue: Application submission fails

**Check**:
1. Is enquiries table created? (View in Supabase)
2. Are email/phone validations correct?
3. Check browser console for error details
4. Check backend logs for API errors

### Issue: Application not showing in admin panel

**Check**:
1. Application was saved (check database directly)
2. Filter is not hiding it (check enquiry_type = "Career")
3. Status is "New" (default status after submission)
4. Admin is logged in (some views require authentication)

### Issue: Expected Salary field appears blank

**Note**: Salary is stored in `budget_range` field in database, not as separate field

---

## Future Enhancements

Potential improvements:

1. **Salary Range Selector**: Dropdown with predefined ranges
2. **Skills Multi-select**: Allow applicants to select job skills
3. **Document Upload**: Resume/CV attachment
4. **Interview Scheduling**: Calendar integration for interview slots
5. **Offer Generation**: Auto-generate offer letters
6. **Email Templates**: Custom responses/rejections

---

## Summary

✅ **Career applications now integrated with enquiries system**
✅ **Single dashboard for all leads (bikes + careers)**
✅ **More fields collected (email, salary expectations)**
✅ **Better admin workflow for managing applications**
✅ **Scalable and maintainable architecture**

---

**Version**: Updated February 4, 2026
**Status**: ✅ PRODUCTION READY
