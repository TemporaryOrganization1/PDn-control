## UAT-001: Run a Website Compliance Check

**Goal**

Verify that a user can successfully perform a website compliance check.

**Preconditions**

- The website is running.
- User is on the home page.
- User has guest attempts or is registered

**Steps**

1. Enter a valid website URL.
2. Click a button to start a compliance check.
3. Wait for the scan to complete.
4. Open the generated report.

**Expected Result**

The report is generated successfully and displays detected compliance issues together with supporting evidence.

**Actual Result**

(To be completed during the customer meeting.)

**Customer Feedback**

(To be completed during the customer meeting.)

## UAT-002: Register a New Account

**Preconditions**

- The website is running.
- User is not registered

**Goal**

Verify that a new user can create an account.

**Steps**

1. Click register.
2. Enter valid email.
3. Enter password with more than 7 symbols
4. Submit the form.

**Expected Result**

The account is created and the user is logged in.

## UAT-003: Guest Scan Limit

**Preconditions**

- The website is running.
- User is not registered
- User has 3 attempts
- User is on the main page

**Goal**

Verify guest usage restrictions.

**Steps**

1. Perform three compliance scans as a guest.
2. Attempt a fourth scan.

**Expected Result**

The application prohibits the users from initiating the scan.
