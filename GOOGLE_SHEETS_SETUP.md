# Google Sheets Setup Guide

This guide will help you set up Google Sheets integration for the NeverLeft Leave Management System.

## Prerequisites

- A Google Account
- Access to Google Cloud Console
- The sample CSV files in the `sample-data/` folder

---

## Step 1: Create Your Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a **new Google Sheet** called "NeverLeft Leave Management"
3. Create **4 separate sheets** (tabs) within this workbook:
   - `Employees`
   - `Requests`
   - `Policy`
   - `PublicHolidays`

### Import the Sample Data

For each sheet, import the corresponding CSV file:

1. Click on the sheet tab (e.g., "Employees")
2. Go to **File → Import**
3. Select **Upload** tab
4. Upload the corresponding CSV file:
   - `employees-template.csv` → Employees sheet
   - `requests-template.csv` → Requests sheet
   - `policy-template.csv` → Policy sheet
   - `public-holidays-template.csv` → PublicHolidays sheet
4. Choose **Replace current sheet** and click **Import data**

### Note Your Spreadsheet ID

Your Google Sheets URL looks like this:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Copy the `SPREADSHEET_ID` - you'll need it later.

---

## Step 2: Set Up Google Cloud Project

### Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **New Project**
4. Name it "NeverLeft Leave System" (or your preferred name)
5. Click **Create**

### Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services → Library**
2. Search for "Google Sheets API"
3. Click on it and click **Enable**

### Create Service Account Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Fill in the details:
   - **Service account name**: `neverleft-service-account`
   - **Service account ID**: (auto-generated)
   - Click **Create and Continue**
4. Grant the service account role:
   - Select **Editor** role
   - Click **Continue**, then **Done**

### Generate Service Account Key

1. In **APIs & Services → Credentials**, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key → Create new key**
5. Choose **JSON** format
6. Click **Create**
7. A JSON file will download - **keep this file safe!**

---

## Step 3: Share Your Google Sheet with Service Account

1. Open your "NeverLeft Leave Management" Google Sheet
2. Click **Share** button (top right)
3. Copy the **service account email** from the downloaded JSON file
   - It looks like: `neverleft-service-account@project-id.iam.gserviceaccount.com`
4. Paste it in the "Add people and groups" field
5. Give it **Editor** access
6. **Uncheck** "Notify people"
7. Click **Share**

---

## Step 4: Configure Your App

### Add Environment Variables

1. Copy the downloaded JSON key file to your project:
   ```bash
   # Rename it to credentials.json
   mv ~/Downloads/project-id-xxxxx.json ./credentials.json
   ```

2. Create a `.env` file in your project root:
   ```env
   VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
   ```

3. **IMPORTANT**: Add `credentials.json` to your `.gitignore`:
   ```
   # .gitignore
   credentials.json
   .env
   .env.local
   ```

---

## Step 5: Install Required Dependencies

Run this command in your project directory:

```bash
npm install googleapis dotenv
```

---

## Step 6: Test the Connection

Once the integration code is set up (next step), you can test the connection by running:

```bash
npm run dev
```

The app should be able to read from and write to your Google Sheets.

---

## Security Best Practices

1. **Never commit** `credentials.json` or `.env` to version control
2. **Rotate keys** periodically (every 90 days recommended)
3. **Use least privilege**: Only grant necessary permissions
4. For production, consider using **Secret Manager** instead of environment variables
5. **Limit service account access** to only the specific spreadsheet

---

## Troubleshooting

### "The caller does not have permission"
- Make sure you shared the Google Sheet with the service account email
- Verify the service account has Editor access

### "Unable to parse credentials"
- Check that your `credentials.json` is valid JSON
- Ensure the file path is correct

### "API has not been used in project"
- Go to Google Cloud Console
- Enable the Google Sheets API for your project

### "Invalid grant: account not found"
- The service account may have been deleted
- Create a new service account and key

---

## Next Steps

Once setup is complete:
1. The app will validate leave requests against the Policy sheet
2. Employee data will be fetched from the Employees sheet
3. Public holidays will be excluded from leave day calculations
4. All requests will be logged in the Requests sheet

You're all set! 🎉
