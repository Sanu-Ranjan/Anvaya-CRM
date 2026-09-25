# Anvaya CRM Feature Checklist

> For an easier interactive checklist open: https://vn7mr9.csb.app/

## Dashboard Page (open the app)

- [x] Recent leads show as cards with name, status, assigned agent and priority
- [x] Lead counts are grouped by status
- [x] Clicking a status card navigates to that status view
- [x] Quick filter buttons navigate to the correct status view
- [x] Add New Lead button opens the form
- [x] Sidebar: Leads link opens the lead list
- [x] Sidebar: Sales Agents link opens the agents list
- [x] Sidebar: Reports link opens the reports page
- [x] Sidebar: Settings link opens the settings page

## Leads Page (click Leads from sidebar)

- [x] Leads appear in a table with name, status, agent, priority and time to close
- [x] Filter by Status: list updates to show only that status
- [x] Filter by Agent: list updates to show only that agent's leads
- [x] Both filters applied together: only matching leads show
- [x] Selecting a sort field automatically sets a default order in the URL
- [x] Sort by Priority Asc: Low appears first
- [x] Sort by Priority Desc: High appears first
- [x] Sort by Time to Close Asc: smallest number appears first
- [x] Sort by Time to Close Desc: largest number appears first
- [x] Every filter and sort change is reflected in the browser URL
- [x] Refreshing the page preserves all active filters
- [x] Clicking a lead row opens its detail page

## Lead Detail Page (click any lead row)

- [x] All lead fields are displayed: name, agent, source, status, priority, time to close, tags
- [x] Edit button opens the form with current values already filled in
- [x] Saving a change shows a success notification
- [x] Status can be changed to Closed
- [x] Status can be changed back from Closed to another status
- [x] Cancel exits edit mode without making any changes
- [x] Comments are listed with author name and timestamp
- [ ] Submitting a comment shows the logged-in user as the author

## Add New Lead Page (click Add New Lead)

- [x] All dropdowns are populated: agents, sources, statuses, priorities
- [x] Tags multi-select shows all available tags
- [x] Submitting with missing required fields shows a validation error (only tags are optional)
- [x] Submitting a valid form shows a success notification and redirects to the lead list
- [x] The new lead appears in the list

## Leads by Status Page (click any status card from dashboard)

- [x] Only leads of the selected status are shown
- [x] Filter by agent narrows the list to that agent's leads within the status
- [x] Filter by priority narrows the list within the status
- [x] Clicking a lead row opens its detail page

## Sales Agents Page (click Sales Agents from sidebar)

- [x] All agents are listed with name, email and join date
- [x] Clicking an agent name opens their leads view
- [x] Add New Agent button opens the form

## Sales Agent View Page (click an agent name)

- [x] Agent name and email are shown
- [x] Only that agent's leads are listed (click on any lead to verify)
- [x] Filter by status narrows the list within the agent's leads
- [x] Filter by priority narrows the list within the agent's leads
- [x] Clicking a lead row opens its detail page

## Add New Agent Page (click Add New Agent)

- [x] Submitting name and email creates the agent and redirects to sales agents list
- [x] Submitting a duplicate email shows an error notification
- [x] Submitting with missing fields shows a validation error

## Reports Page (click Reports from sidebar nav at dashboard page)

- [x] Closed Leads by Agent bar chart renders
- [x] Pipeline by Status bar chart renders
- [x] Closed Last 7 Days chart renders or shows a no-data message
- [x] Closed vs In Pipeline pie chart renders
- [x] Status Distribution pie chart renders
- [x] No empty or broken chart areas visible

## Settings Page (click Settings from sidebar)

- [x] Defaults to Sales Agents view
- [x] Toggling to Leads shows all leads with name, status and agent
- [x] Typing in the search box filters the table instantly
- [x] Deleting an agent removes the row and shows a success notification
- [x] Deleting a lead removes the row and shows a success notification

## Authentication & Roles

- [ ] Logged out, Dashboard, Leads, Agents and Reports open normally with a "Log In" button in the sidebar
- [ ] Logged out, Add New Lead, Add New Agent, Settings, Edit lead and posting a comment send you to Login, and back after logging in
- [ ] "Continue without logging in" on the Login page goes to the Dashboard
- [ ] Admin adding an agent sets a temporary password; the agent can log in with it
- [ ] On first login the agent is sent to Change Password and can't open other pages until it's changed
- [ ] Change Password rejects a wrong current password and mismatched confirmation
- [ ] Admin "Set Password" in Settings gives an agent a new temporary password
- [ ] Demo accounts can't change their password
- [ ] Logging in on the Admin tab with an agent account is rejected (and vice versa)
- [ ] "Log in as demo" logs straight in with the right account on each tab
- [ ] Login with wrong password shows an error
- [ ] After login, user lands back on the page they tried to open
- [ ] Sidebar shows the logged-in user's name, email and role
- [ ] Logout clears the session and returns to Login
- [ ] For agents, Settings and Add New Agent are dimmed and disabled with an "Admin only" tooltip
- [ ] Agent opening /settings or /agents/new directly is sent to the Dashboard
- [ ] Agent can edit their own leads but Edit is disabled on other agents' leads
- [ ] New lead created by an agent is assigned to them automatically
- [ ] Admin sees Settings and can delete agents and leads
