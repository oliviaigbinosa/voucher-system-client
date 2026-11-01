import { computed, ref } from 'vue'

const API_BASE = process.client ? import.meta.env.VITE_API_BASE_URL || '' : ''

const userEmail = ref('')
const userRole = ref('')
const userDepartment = ref('')
const userCreatedBy = ref('')
const isLoggedIn = ref(false)
const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'super admin')
const onboardDepts = ref<string[]>(['Finance', 'Operations' ])
const allVouchers = ref<any[]>([])
const loadingVouchers = ref(true)

// Get JWT token from sessionStorage
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('pcv_token') || ''
  }
  return ''
}

// Create headers with JWT token
function getAuthHeaders() {
  const token = getAuthToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

type OnboardingUser = {
  id: string
  email: string
  addedAt: string
  role: string
  department: string
}

const onboardingUsers = ref<OnboardingUser[]>([])

export type { OnboardingUser }

if (typeof window !== 'undefined') {
  userEmail.value = sessionStorage.getItem('pcv_user') || ''
  userRole.value = sessionStorage.getItem('pcv_role') || ''
  userDepartment.value = localStorage.getItem('pcv_department') || ''
  userCreatedBy.value = localStorage.getItem('pcv_createdBy') || ''
  isLoggedIn.value = Boolean(userEmail.value)

  // Clear voucher and user data in memory on page load to prevent showing stale data
  // SessionStorage data will persist and be loaded on fetch
  allVouchers.value = []
  onboardingUsers.value = []
  loadingVouchers.value = true
}

function loginUser(email: string, role = 'user', department = '', createdBy = '') {
  userEmail.value = email
  userRole.value = role
  userDepartment.value = department
  userCreatedBy.value = createdBy
  isLoggedIn.value = true

  // Clear previous session data and reset loading states
  allVouchers.value = []
  onboardingUsers.value = []
  loadingVouchers.value = true

  // Clear session storage for vouchers and emails when a different user logs in
  // This ensures user isolation within the same browser tab
  const previousUser = typeof window !== 'undefined' ? sessionStorage.getItem('pcv_user') : ''
  if (previousUser && previousUser !== email && typeof window !== 'undefined') {
    sessionStorage.removeItem('pcv_vouchers')
    sessionStorage.removeItem('pcv_emails')
  }

  sessionStorage.setItem('pcv_user', email)
  sessionStorage.setItem('pcv_role', role)
  localStorage.setItem('pcv_department', department)
  localStorage.setItem('pcv_createdBy', createdBy)
}

function logoutUser() {
  userEmail.value = ''
  userRole.value = ''
  userDepartment.value = ''
  userCreatedBy.value = ''
  isLoggedIn.value = false

  // Clear voucher and user data to prevent showing previous user's data
  allVouchers.value = []
  onboardingUsers.value = []

  // Note: We do NOT clear pcv_vouchers and pcv_emails from sessionStorage on logout
  // These should persist until the browser tab is closed (sessionStorage behavior)
  // This allows users to see their created vouchers/emails even after logout

  sessionStorage.removeItem('pcv_user')
  sessionStorage.removeItem('pcv_role')
  sessionStorage.removeItem('pcv_token')
  localStorage.removeItem('pcv_department')
  localStorage.removeItem('pcv_createdBy')
}

async function fetchVouchers() {
  loadingVouchers.value = true
  try {
    // First condition: Try to get vouchers from sessionStorage
    if (typeof window !== 'undefined') {
      const sessionVouchers = sessionStorage.getItem('pcv_vouchers')
      if (sessionVouchers) {
        try {
          allVouchers.value = JSON.parse(sessionVouchers)
          loadingVouchers.value = false
          return
        } catch (parseError) {
          // If parsing fails, continue to fallback
          console.warn('Failed to parse session vouchers, falling back to database:', parseError)
        }
      }
    }

    // Second condition: Fallback to database if sessionStorage fails or is empty
    const res = await fetch(`${API_BASE}/api/vouchers`, { headers: getAuthHeaders() })
    if (!res.ok) {
      throw new Error('Failed to fetch vouchers')
    }
    allVouchers.value = await res.json()
  } finally {
    loadingVouchers.value = false
  }
}

async function addVoucher(entry: Record<string, unknown>) {
  // First condition: Try to store in sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const newVoucher = { ...entry, createdAt: new Date().toISOString() }
      allVouchers.value = [newVoucher, ...allVouchers.value]
      sessionStorage.setItem('pcv_vouchers', JSON.stringify(allVouchers.value))
      return newVoucher
    } catch (sessionError) {
      console.warn('Failed to store voucher in sessionStorage, falling back to database:', sessionError)
      // Continue to fallback
    }
  }

  // Second condition: Fallback to database if sessionStorage fails
  const res = await fetch(`${API_BASE}/api/vouchers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save voucher')
  }
  allVouchers.value = [data, ...allVouchers.value]
  return data
}

async function updateVoucherStatus(id: string, status: string) {
  const voucher = allVouchers.value.find((v) => v.id === id)
  if (!voucher) return

  // First condition: Try to update in sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const index = allVouchers.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        const update: any = { status }
        // Set the appropriate "by" field based on status
        if (status === 'Approved') {
          update.approvedBy = userEmail.value
        } else if (status === 'Declined') {
          update.declinedBy = userEmail.value
        } else if (status === 'Rejected') {
          update.rejectedBy = userEmail.value
        } else if (status === 'Processed') {
          update.processedBy = userEmail.value
        }
        allVouchers.value[index] = { ...allVouchers.value[index], ...update }
        sessionStorage.setItem('pcv_vouchers', JSON.stringify(allVouchers.value))

        // Store status email in session storage
        const displayName = (voucher.from || voucher.submittedBy || userEmail.value).split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        const headingMap: Record<string, string> = {
          'Approved': 'PETTY CASH VOUCHER APPROVED',
          'Declined': 'PETTY CASH VOUCHER DECLINED',
          'Processed': 'PETTY CASH VOUCHER PROCESSED',
          'Rejected': 'PETTY CASH VOUCHER REJECTED',
        }
        const footerMap: Record<string, string> = {
          'Approved': 'This voucher has been approved.',
          'Declined': 'This voucher has been declined.',
          'Processed': 'This voucher has been processed.',
          'Rejected': 'This voucher has been rejected.',
        }
        const subjectPrefixMap: Record<string, string> = {
          'Approved': 'Approved:',
          'Declined': 'Declined:',
          'Processed': 'Processed:',
          'Rejected': 'Rejected:',
        }

        const heading = headingMap[status] || 'PETTY CASH VOUCHER STATUS UPDATE'
        const footer = footerMap[status] || 'This voucher has a status update.'
        const subjectPrefix = subjectPrefixMap[status] || 'Update:'

        const formattedAmount = Number(voucher.amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

        const statusLines: string[] = []
        if (status === 'Approved') statusLines.push(`Approved by ${displayName}`)
        if (status === 'Declined') statusLines.push(`Declined by ${displayName}`)
        if (status === 'Rejected') statusLines.push(`Rejected by ${displayName}`)
        if (status === 'Processed') statusLines.push(`Processed by ${displayName}`)

        // Determine recipients for the status email
        const recipients = new Set<string>()
        const submittedBy = String(voucher.submittedBy || voucher.from || '').toLowerCase()
        const cc = String(voucher.cc || '').toLowerCase()
        const from = String(voucher.from || '').toLowerCase()

        // Always send to submitter
        recipients.add(voucher.from || voucher.submittedBy)

        // For approved status, send to CC recipients and finance manager if submitter is department member
        if (status === 'Approved') {
          if (cc) recipients.add(cc)
          if (submittedBy === 'department.member@example.com') {
            recipients.add('finance.manager@example.com')
          }
        }

        // Create email entries for each recipient
        const emailEntries = Array.from(recipients).map(recipientEmail => ({
          _id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          recipientEmail,
          senderEmail: voucher.from || voucher.submittedBy,
          senderName: displayName,
          subject: `${subjectPrefix} ${voucher.subject || `Petty Cash Voucher ${id}`}`,
          text: `${heading}\n${'═'.repeat(52)}\nVoucher No.:      ${id}\nCompany:          PettyFlo Ltd.\nSubmitted By:     ${voucher.submittedBy || voucher.from}\n\nEMAIL DETAILS\n${'─'.repeat(52)}\nFrom:             ${voucher.from}\nTo:               ${voucher.to}\nSubject:          ${voucher.subject}\n\nPAYEE INFORMATION\n${'─'.repeat(52)}\nPayee:            ${voucher.payee}\nDepartment:       ${voucher.department}\n\nAMOUNT & PURPOSE\n${'─'.repeat(52)}\nAmount (Figures): ₦${formattedAmount}\nAmount (Words):   ${voucher.amountWords || ''}\n\nPurpose / Description:\n${voucher.purpose || ''}\n\nSUPPORTING DOCUMENTS\n${'─'.repeat(52)}\nSubmission Date:  ${voucher.submissionDate}\nAttached Files:\n${voucher.supportingDocs?.length ? voucher.supportingDocs.map((f: any) => `  • ${f.name}`).join('\n') : '  None'}\n\n${'═'.repeat(52)}\n${footer}${statusLines.length ? '\n\n' + statusLines.join('\n') : ''}`,
          html: null,
          type: 'voucher-status',
          relatedId: id,
          metadata: {
            voucherNo: id,
            voucherStatus: status
          },
          createdAt: new Date().toISOString(),
          isRead: false
        }))

        // Get existing emails from session storage
        const existingEmails = JSON.parse(sessionStorage.getItem('pcv_emails') || '[]')
        // Add new emails at the beginning
        const updatedEmails = [...emailEntries, ...existingEmails]
        sessionStorage.setItem('pcv_emails', JSON.stringify(updatedEmails))

        return allVouchers.value[index]
      }
    } catch (sessionError) {
      console.warn('Failed to update voucher in sessionStorage:', sessionError)
    }
  }
}

async function fetchOnboardingUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error('Failed to load users')
  }

  const users = await res.json()
  const demoManager = 'department.manager@example.com'
  const demoMember = 'department.member@example.com'
  let list: any[] = Array.isArray(users) ? users.slice() : []
  // If current user is department manager, only ensure the member is present
  if (String(userEmail.value || '').toLowerCase() === demoManager) {
    const hasMember = list.some((u) => String(u.email || '').toLowerCase() === demoMember)
    if (!hasMember) {
      list.push({ id: `demo-${Date.now()}-mem`, email: demoMember, addedAt: new Date().toISOString(), role: 'user', department: 'Demo Department', createdBy: demoManager })
    }
  } else {
    // For other users, ensure both manager and member exist for demo purposes
    const hasManager = list.some((u) => String(u.email || '').toLowerCase() === demoManager)
    const hasMember = list.some((u) => String(u.email || '').toLowerCase() === demoMember)
    if (!hasManager) {
      list.push({ id: `demo-${Date.now()}-mgr`, email: demoManager, addedAt: new Date().toISOString(), role: 'admin', department: 'Demo Department' })
    }
    if (!hasMember) {
      list.push({ id: `demo-${Date.now()}-mem`, email: demoMember, addedAt: new Date().toISOString(), role: 'user', department: 'Demo Department', createdBy: demoManager })
    }
  }
  onboardingUsers.value = list
}

async function addOnboardingUser(email: string, password: string, createdBy?: string, department?: string, role?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password, createdBy, department, role }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add user')
  }
  return data
}

async function removeOnboardingUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to remove user')
  }
  onboardingUsers.value = onboardingUsers.value.filter((user: any) => user.id !== id)
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update password')
  }
}

async function sendInviteEmail(email: string, password: string, from?: string): Promise<void> {
  // Store invite email in session storage instead of sending to backend
  if (typeof window !== 'undefined') {
    try {
      const displayName = from?.split('@')?.[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Admin'
      const emailEntry = {
        _id: `email-${Date.now()}`,
        recipientEmail: email,
        senderEmail: from || userEmail.value,
        senderName: displayName,
        subject: 'Welcome to PettyFlo system',
        text: `You have been invited to join the PettyFlo system.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nClick the link below to sign in:\nhttps://pettycashvoucher.netlify.app/login\n\nPlease log in and change your password after your first login.\n\nIf you have any questions, please contact your administrator.`,
        html: null,
        type: 'invite',
        relatedId: null,
        metadata: null,
        createdAt: new Date().toISOString(),
        isRead: false
      }

      // Get existing emails from session storage
      const existingEmails = JSON.parse(sessionStorage.getItem('pcv_emails') || '[]')
      // Add new email at the beginning
      const updatedEmails = [emailEntry, ...existingEmails]
      sessionStorage.setItem('pcv_emails', JSON.stringify(updatedEmails))
    } catch (error) {
      console.warn('Failed to store invite email in session storage:', error)
    }
  }
}

async function fetchCurrentUser(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch current user')
  }
  const data = await res.json()
  userDepartment.value = data.department || ''
  userCreatedBy.value = data.createdBy || ''
  localStorage.setItem('pcv_department', userDepartment.value)
  localStorage.setItem('pcv_createdBy', userCreatedBy.value)
}

async function fetchNextSerial(): Promise<string> {
  let maxSerial = 0

  // Only check sessionStorage for the highest serial number
  if (typeof window !== 'undefined') {
    const sessionVouchers = sessionStorage.getItem('pcv_vouchers')
    if (sessionVouchers) {
      try {
        const vouchers = JSON.parse(sessionVouchers)
        for (const voucher of vouchers) {
          const idParts = String(voucher.id).split('/')
          if (idParts.length === 5) {
            const serial = parseInt(idParts[4] || '0', 10)
            if (!isNaN(serial) && serial > maxSerial) {
              maxSerial = serial
            }
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse session vouchers for serial check:', parseError)
      }
    }
  }

  // Return the next serial number (highest + 1), starting from 001 if no vouchers exist
  return String(maxSerial + 1).padStart(3, '0')
}

export {
  addOnboardingUser,
  addVoucher,
  allVouchers,
  API_BASE,
  changePassword,
  fetchOnboardingUsers,
  fetchVouchers,
  fetchNextSerial,
  getAuthToken,
  getAuthHeaders,
  isAdmin,
  isLoggedIn,
  loadingVouchers,
  loginUser,
  logoutUser,
  onboardDepts,
  onboardingUsers,
  removeOnboardingUser,
  sendInviteEmail,
  updateVoucherStatus,
  fetchCurrentUser,
  userCreatedBy,
  userDepartment,
  userEmail,
  userRole,
}
