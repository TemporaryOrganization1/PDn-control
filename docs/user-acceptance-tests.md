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

Passed for the customer-reviewed flow. The team demonstrated the scan/result area and PDF report access during the Sprint Review. At the end of the meeting the customer accepted the PDF report UAT point verbally.

**Customer Feedback**

The customer asked the team to improve product presentation and consider adding visual evidence to scan results and reports so users can understand detected issues faster.

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

**Actual Result**

Partially superseded by UAT-004. During Sprint Review, registration required email verification before the account became usable.

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

**Actual Result**

Not re-executed during the Week 5 customer meeting. This scenario remains active for later regression testing.

## UAT-004: Email Verification

**Preconditions**

- The website is running.
- User is not registered

**Goal**

Safer account creation

**Steps**

1. User tries to register and enters valid information
2. User visits their email and verifies it.

**Expected Result**

The account is created only after email verification

**Actual Result**

Passed during the Week 5 customer meeting. The team demonstrated registration, receipt of the verification email, opening the verification link, and successful account access after verification.

**Customer Feedback**

The customer accepted the email verification flow as part of the demonstrated `MVP v2` increment.

## UAT-005: User profile

**Preconditions**

- The website is running.
- User is registered

**Goal**

Verify the user can access their account

**Steps**

1. User clicks on an account button

**Expected Result**

The user's account with all the information is opened

**Actual Result**

Passed for the demonstrated flow. After verification, the user could access the account/profile area, including profile-related pages and history/report access.

## UAT-006: Screenshot generation

**Preconditions**

- The website is running.
- User is on the main page

**Goal**

Verify the user can see the generated screenshots after

**Steps**

1. User enters valid website url.
2. Clicks "Проверить" button
3. The check is finished successfully

**Expected Result**

The user should see the screenshots from the checked website where it's appropriate.

**Actual Result**

The customer indeed saw the screenshots and approved the test.

## UAT-007: Invalid input

**Preconditions**

- The website is running.
- User is on the main page

**Goal**

Prevent the user from entering invalid url

**Steps**

1. User enters invalid website url
2. User clicks "Проверить" button

**Expected Result**

The message with error appears and the start of the check is prevented

**Actual Result**

The customer approved the test


