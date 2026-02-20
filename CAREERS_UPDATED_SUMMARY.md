# Career Applications - Updated to Enquiries System

## What Changed

Previously, career applications were stored in a separate `career_applications` table. Now they're integrated into the main `enquiries` system for better unified management.

---

## New User Application Form

When a user applies for a job, they now provide:

### Required Fields:
1. **Full Name** - Applicant's name
2. **Email Address** - Contact email (validated)
3. **Mobile Number** - Contact phone (10+ digits required)
4. **Experience (Years)** - Years of relevant experience
5. **Expected Salary** - Salary expectations/range

### Optional Fields:
- **Additional Information** - Why interested in the position, cover letter, etc.

---

## How Applications Flow

```
USER SIDE: Career Application
├─ User views job posting
├─ Clicks "Apply Now"
├─ Fills form with 5 required fields
├─ Submits application
└─ Gets success notification

     ↓↓↓ DATA SAVED ↓↓↓

ADMIN SIDE: Enquiries Dashboard
├─ Goes to Admin Panel → Enquiries
├─ Sees new Career enquiry
├─ Views applicant details
│  ├─ Name, Email, Phone
│  ├─ Job Position Applied
│  ├─ Experience Level
│  ├─ Expected Salary
│  └─ Additional Notes
├─ Updates Status
├─ Adds Follow-up Notes
└─ Contacts Applicant
```

---

## Key Changes

### Form Fields (BEFORE vs AFTER)

**Before**:
- Name
- Mobile Number
- Experience (Years)
- Cover Letter

**After**:
- Full Name ✨
- **Email Address** ✨ (NEW - required)
- Mobile Number
- Experience (Years)
- **Expected Salary** ✨ (NEW - required)
- Additional Information (optional, replaces cover letter)

### Data Storage

**Before**: Stored in `career_applications` table

**After**: Stored in `enquiries` table with:
- `enquiry_type = "Career"`
- All job application data in structured format
- Same status tracking as other enquiries
- Admin can manage all leads from one place

### Admin View Location

**Before**: Separate "Career Applications" section in Careers tab

**After**: Applications appear in **Enquiries section** under type "Career"

---

## API Changes

### Old Endpoint:
```
POST /api/careers/applications
```

### New Endpoint:
```
POST /api/bikes/enquire
```

Both work, but new endpoint is recommended for career applications.

---

## Benefits

✅ **Single Dashboard**: All enquiries (bikes + careers) in one place  
✅ **More Information**: Email and salary expectations captured  
✅ **Integrated Workflow**: Same status tracking for all leads  
✅ **Better Organization**: No separate tables to maintain  
✅ **Scalable**: Easy to add more enquiry types  
✅ **Professional**: Email validation ensures valid contact info  

---

## Admin Quick Start

### Viewing Career Applications

1. **Go to**: Admin Panel → Enquiries (or Career Applications section)
2. **Filter by**: Type = "Career"
3. **See Details**:
   - Applicant name & contact info
   - Job position applied for
   - Years of experience
   - Expected salary
   - Application date
4. **Actions**:
   - Update status (New → In Progress → Contacted → Converted)
   - Add follow-up notes
   - Assign to team member
   - Schedule follow-up

### Managing Applications

| Status | Meaning |
|--------|---------|
| New | Just received, not reviewed |
| In Progress | Under review/consideration |
| Contacted | Reached out to applicant |
| Converted | Hired/Offer accepted |
| Closed | Rejected/Not suitable |

---

## Testing the Feature

### As a User:
1. Go to `/careers`
2. Click "Apply Now" on any job
3. Fill form with:
   - Name: Your name
   - Email: Valid email
   - Phone: 10+ digit number
   - Experience: Number of years
   - Salary: Expected salary range
4. Click "Submit Application"
5. See success message

### As Admin:
1. Go to `/admin`
2. Navigate to Enquiries section
3. Look for newly created enquiry with:
   - Type: "Career"
   - Status: "New"
   - Customer details & job info
4. Click to expand and view full details
5. Update status and add notes

---

## Database

All data stored in **enquiries** table:

```
enquiries {
  customer_name: "John Doe",
  email: "john@example.com",
  phone: "+919876543210",
  enquiry_type: "Career",
  message: "Job Position: Service Manager
           Experience: 5 years
           Expected Salary: 50,000 - 75,000
           Additional Info: Interested because...",
  budget_range: "50,000 - 75,000",
  status: "New",
  created_at: "2026-02-04T10:30:00Z"
}
```

---

## No Migration Needed!

The enquiries table already exists and accepts the "Career" enquiry type. No database changes required - it just works!

---

## Support

For issues:

1. **Application won't submit**: Check all required fields are filled
2. **Email validation error**: Use valid email format (example@domain.com)
3. **Phone validation error**: Enter 10+ digit number
4. **Application not visible in admin**: Check filter is showing "Career" type enquiries
5. **JSON parsing error**: Refresh page and try again

---

**Version**: Updated February 4, 2026  
**Status**: ✅ LIVE & WORKING
