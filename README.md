# NeverLeft - Leave Management System

A comprehensive leave management system with Google Sheets integration, policy-based validation, and automated approval workflows.

## Features

### Core Functionality
- ✅ **Leave Request Submission** with real-time validation
- ✅ **Multi-country Support** (Nigeria, Ghana, South Africa, Uganda)
- ✅ **Public Holiday Exclusion** from leave day calculations
- ✅ **Policy-Based Validation** (configurable by HR)
- ✅ **Automated Approval Routing** (Employee → Manager → HR)
- ✅ **Multiple Leave Types** (Annual, Sick, Paternal, Maternal, Bereavement, etc.)
- ✅ **Balance Tracking** (Annual and Sick leave)
- ✅ **Handover Document Requirements**

### Validation Rules
The system enforces comprehensive validation rules:

1. **Employee Verification**: Matches request email against employee database
2. **Date Calculation**: Counts only weekdays, excluding weekends and public holidays
3. **Balance Checking**: Ensures sufficient leave balance before approval
4. **Timing Rules**:
   - Annual leave: Must be submitted ≥7 days in advance
   - Sick leave: Cannot be >3 days in the future (for current/recent illness)
   - Other types: Configurable advance notice (e.g., 30+ days for Paternal/Maternal)
5. **Employment Duration**:
   - Annual leave requires ≥6 months employment
   - Sick leave: No minimum employment requirement
   - Configurable for other leave types
6. **Handover Requirements**: Required for most leave types (except Sick)

### Approval Workflow
- **Annual/Paternal/Maternal Leave**: Employee → Manager → HR
- **Sick Leave**: Auto-approved (instant)
- **Custom Leave Types**: Configurable workflow via Policy sheet

---

## Project Structure

```
neverleft/
├── sample-data/              # CSV templates for Google Sheets
│   ├── employees-template.csv
│   ├── requests-template.csv
│   ├── policy-template.csv
│   └── public-holidays-template.csv
├── src/
│   ├── services/
│   │   ├── googleSheets.ts  # Google Sheets API integration
│   │   └── leaveValidation.ts # Validation & submission logic
│   ├── pages/
│   │   ├── LeaveRequest.tsx  # Leave request form
│   │   ├── TeamApprovals.tsx # Manager approval dashboard
│   │   └── HRRequests.tsx    # HR approval dashboard
│   └── ...
├── .env.example              # Environment variable template
├── GOOGLE_SHEETS_SETUP.md   # Detailed setup guide
└── README.md                # This file
```

---

## Quick Start

### Option 1: Demo Mode (No Setup Required)

The app runs in demo mode by default with sample data.

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and explore the app with demo users:
- **Employee**: kabir@curacel.ai
- **Manager**: henry@curacel.ai
- **HR**: ore@curacel.ai

### Option 2: Connect to Google Sheets

Follow the detailed guide in [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md) to:
1. Create your Google Sheets with the provided CSV templates
2. Set up Google Cloud Project & Service Account
3. Configure environment variables
4. Start using with real data!

---

## Google Sheets Structure

### 1. Employees Sheet
| Column | Description |
|--------|-------------|
| email | Employee email (unique identifier) |
| full_name | Employee full name |
| manager_email | Direct manager's email |
| manager_name | Direct manager's name |
| employment_date | Date employee started (YYYY-MM-DD) |
| annual_entitlement | Total annual leave days (default: 14) |
| annual_taken | Annual leave days used this year |
| sick_entitlement | Total sick leave days (default: 7) |
| sick_taken | Sick leave days used this year |
| year | Current year (e.g., 2025) |
| team | Team/Department name |
| role | Job title |
| country | Employee's country (for public holidays) |

### 2. Requests Sheet
All leave requests are logged here with:
- Request details (dates, type, days)
- Approval status (Manager & HR)
- Balance snapshots (at time of request)
- Timestamps and audit trail

### 3. Policy Sheet (HR Configurable)
Define leave types and their rules:
- Days entitled
- Minimum employment period
- Advance notice requirements
- Approval workflow requirements
- Handover requirements

**HR can add new leave types or modify existing ones!**

### 4. PublicHolidays Sheet
Pre-loaded with 2025 holidays for:
- 🇳🇬 Nigeria
- 🇬🇭 Ghana
- 🇿🇦 South Africa
- 🇺🇬 Uganda

**HR can add/edit holidays as needed.**

---

## How It Works

### For Employees

1. **Submit Leave Request**:
   - Select leave type and dates
   - Provide handover document link (if required)
   - System validates in real-time
   - Submit when validation passes

2. **Real-time Validation**:
   - Checks eligibility (employment duration, balance, etc.)
   - Calculates working days (excludes weekends & holidays)
   - Verifies advance notice requirements
   - Shows clear error messages if validation fails

3. **Automatic Routing**:
   - Annual/Paternal/Maternal → Manager → HR
   - Sick leave → Auto-approved instantly

### For Managers

1. View pending leave requests from team members
2. Review handover documents
3. Approve or reject with comments
4. Approved requests move to HR (if required)

### For HR

1. View all leave requests company-wide
2. Review manager-approved requests
3. Final approval/rejection
4. **Manage Policies**: Add/edit leave types, adjust entitlements, modify rules
5. **Manage Holidays**: Add country-specific public holidays

---

## Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Demo mode (no Google Sheets required)
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=demo

# OR production mode (with your Google Sheets ID)
# VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_actual_spreadsheet_id
```

### Policy Customization

HR can modify leave policies directly in the Google Sheets `Policy` tab:

**Example: Increase Annual Leave Entitlement**
1. Open Google Sheets → Policy tab
2. Find "Annual Leave Entitlement" row
3. Change `days_entitled` from 14 to 20
4. Update `last_updated` and `updated_by`
5. Save - changes take effect immediately!

**Example: Add New Leave Type**
1. Add a new row in Policy sheet:
   ```
   Study Leave Entitlement, Study, 10, 12, 30, TRUE, TRUE, TRUE, TRUE, 2025-11-17, ore@curacel.ai
   ```
2. Employees can now select "Study Leave" with 10 days entitlement
3. Requires 12 months employment, 30 days advance notice
4. Requires Manager + HR approval + Handover

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **Backend/Data**: Google Sheets API
- **Validation**: Custom policy engine
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Zod

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Security Notes

1. **Never commit** `credentials.json` or `.env` files
2. Google Sheets credentials use **Service Account** authentication
3. For production: Consider using Secret Manager instead of `.env` files
4. **Rotate service account keys** every 90 days
5. Only grant **Editor** access to the specific spreadsheet

---

## Roadmap

- [ ] Manager approval dashboard
- [ ] HR approval dashboard
- [ ] HR policy management UI (in-app)
- [ ] Public holidays management UI (in-app)
- [ ] Email notifications (via SendGrid/Mailgun)
- [ ] Slack integration (status updates)
- [ ] Calendar view (team leave calendar)
- [ ] Export reports (CSV/Excel)
- [ ] Multi-year support
- [ ] Leave carry-over rules

---

## License

MIT License - feel free to use this for your organization!

---

## Credits

Built with ❤️ for teams across Nigeria, Ghana, South Africa, and Uganda.
