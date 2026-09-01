import { computed, ref } from 'vue'

const API_BASE = process.client ? import.meta.env.VITE_API_BASE_URL || '' : ''

const userEmail = ref('')
const userRole = ref('')
const userDepartment = ref('')
const userCreatedBy = ref('')
const isLoggedIn = ref(false)
const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'super admin')
const onboardDepts = ref<string[]>(['Finance', 'Product', 'Engineering', 'Operations', 'Commercials and partnerships', 'Compliance', 'People and culture', 'BI/Data & Retention'])
const allVouchers = ref<any[]>([])
const loadingVouchers = ref(true)
const allLeaveRequests = ref<any[]>([])
const loadingLeaveRequests = ref(true)

// Get JWT token from sessionStorage
function getAuthToken() {
  if (process.client) {
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

if (process.client) {
  userEmail.value = sessionStorage.getItem('pcv_user') || ''
  userRole.value = sessionStorage.getItem('pcv_role') || ''
  userDepartment.value = localStorage.getItem('pcv_department') || ''
  userCreatedBy.value = localStorage.getItem('pcv_createdBy') || ''
  isLoggedIn.value = Boolean(userEmail.value)

  // Clear voucher and user data on page load to prevent showing previous session data
  allVouchers.value = []
  allLeaveRequests.value = []
  onboardingUsers.value = []
  loadingVouchers.value = true
  loadingLeaveRequests.value = true
}

function loginUser(email: string, role = 'user', department = '', createdBy = '') {
  userEmail.value = email
  userRole.value = role
  userDepartment.value = department
  userCreatedBy.value = createdBy
  isLoggedIn.value = true

  // Clear previous session data and reset loading states
  allVouchers.value = []
  allLeaveRequests.value = []
  onboardingUsers.value = []
  loadingVouchers.value = true
  loadingLeaveRequests.value = true

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
  allLeaveRequests.value = []
  onboardingUsers.value = []

  sessionStorage.removeItem('pcv_user')
  sessionStorage.removeItem('pcv_role')
  sessionStorage.removeItem('pcv_token')
  localStorage.removeItem('pcv_department')
  localStorage.removeItem('pcv_createdBy')
}

async function fetchVouchers() {
  loadingVouchers.value = true
  try {
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

async function fetchLeaveRequests() {
  loadingLeaveRequests.value = true
  try {
    const res = await fetch(`${API_BASE}/api/leave-requests`, { headers: getAuthHeaders() })
    if (!res.ok) {
      throw new Error('Failed to fetch leave requests')
    }
    allLeaveRequests.value = await res.json()
  } finally {
    loadingLeaveRequests.value = false
  }
}

async function addLeaveRequest(entry: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/leave-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save leave request')
  }
  allLeaveRequests.value = [data, ...allLeaveRequests.value]
}

async function updateLeaveRequestStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/api/leave-requests/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update leave request status')
  }
  const index = allLeaveRequests.value.findIndex((l) => l.id === id)
  if (index !== -1) {
    allLeaveRequests.value[index] = data
  }
}

async function updateVoucherStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/api/vouchers/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update voucher status')
  }
  const index = allVouchers.value.findIndex((v) => v.id === id)
  if (index !== -1) {
    allVouchers.value[index] = data
  }
}

async function fetchOnboardingUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error('Failed to load users')
  }
  onboardingUsers.value = await res.json()
}

async function addOnboardingUser(email: string, password: string, createdBy?: string, department?: string, role?: string) {
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

async function removeOnboardingUser(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to remove user')
  }
  onboardingUsers.value = onboardingUsers.value.filter((user) => user.id !== id)
}

async function changePassword(currentPassword: string, newPassword: string) {
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

async function sendInviteEmail(email: string, password: string, from?: string) {
  const res = await fetch(`${API_BASE}/api/email/send-invite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ to: email, password, from }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send invite email')
  }
}

async function fetchCurrentUser() {
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
  const res = await fetch(`${API_BASE}/api/vouchers/next-serial`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch next serial')
  }
  const data = await res.json()
  return data.serial
}

export {
  addLeaveRequest,
  addOnboardingUser,
  addVoucher,
  allLeaveRequests,
  allVouchers,
  API_BASE,
  changePassword,
  fetchLeaveRequests,
  fetchOnboardingUsers,
  fetchVouchers,
  fetchNextSerial,
  getAuthToken,
  getAuthHeaders,
  isAdmin,
  isLoggedIn,
  loadingLeaveRequests,
  loadingVouchers,
  loginUser,
  logoutUser,
  onboardDepts,
  onboardingUsers,
  removeOnboardingUser,
  sendInviteEmail,
  updateVoucherStatus,
  updateLeaveRequestStatus,
  fetchCurrentUser,
  userCreatedBy,
  userDepartment,
  userEmail,
  userRole,
}
