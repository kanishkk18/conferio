// lib/integrations/crm/salesforce.ts

export interface SalesforceContact {
  id: string
  name: string
  email?: string
  phone?: string
  title?: string
  account?: string
  department?: string
  createdDate: string
  lastModifiedDate: string
  url: string
}

export interface SalesforceAccount {
  id: string
  name: string
  industry?: string
  website?: string
  phone?: string
  billingCity?: string
  employeeCount?: number
  type?: string
  url: string
}

export interface SalesforceOpportunity {
  id: string
  name: string
  stage: string
  amount?: number
  closeDate?: string
  probability?: number
  accountName?: string
  ownerName?: string
  url: string
}

export interface SalesforceLead {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  status: string
  source?: string
  url: string
}

function sfHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function sfQuery(instanceUrl: string, token: string, soql: string) {
  const url = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`
  return fetch(url, { headers: sfHeaders(token) }).then((r) => r.json())
}

export async function searchSalesforceContacts(
  token: string,
  instanceUrl: string,
  query: string,
  limit = 20
): Promise<SalesforceContact[]> {
  const soql = `SELECT Id, Name, Email, Phone, Title, Account.Name, Department, CreatedDate, LastModifiedDate
    FROM Contact
    WHERE Name LIKE '%${query.replace(/'/g, "\\'")}%' OR Email LIKE '%${query}%'
    ORDER BY LastModifiedDate DESC
    LIMIT ${limit}`
  const data = await sfQuery(instanceUrl, token, soql)
  return (data.records ?? []).map((r: any) => ({
    id: r.Id,
    name: r.Name,
    email: r.Email,
    phone: r.Phone,
    title: r.Title,
    account: r.Account?.Name,
    department: r.Department,
    createdDate: r.CreatedDate,
    lastModifiedDate: r.LastModifiedDate,
    url: `${instanceUrl}/${r.Id}`,
  }))
}

export async function searchSalesforceAccounts(
  token: string,
  instanceUrl: string,
  query: string,
  limit = 20
): Promise<SalesforceAccount[]> {
  const soql = `SELECT Id, Name, Industry, Website, Phone, BillingCity, NumberOfEmployees, Type
    FROM Account
    WHERE Name LIKE '%${query.replace(/'/g, "\\'")}%'
    ORDER BY LastModifiedDate DESC
    LIMIT ${limit}`
  const data = await sfQuery(instanceUrl, token, soql)
  return (data.records ?? []).map((r: any) => ({
    id: r.Id,
    name: r.Name,
    industry: r.Industry,
    website: r.Website,
    phone: r.Phone,
    billingCity: r.BillingCity,
    employeeCount: r.NumberOfEmployees,
    type: r.Type,
    url: `${instanceUrl}/${r.Id}`,
  }))
}

export async function getOpenOpportunities(
  token: string,
  instanceUrl: string,
  limit = 20
): Promise<SalesforceOpportunity[]> {
  const soql = `SELECT Id, Name, StageName, Amount, CloseDate, Probability, Account.Name, Owner.Name
    FROM Opportunity
    WHERE IsClosed = false
    ORDER BY CloseDate ASC
    LIMIT ${limit}`
  const data = await sfQuery(instanceUrl, token, soql)
  return (data.records ?? []).map((r: any) => ({
    id: r.Id,
    name: r.Name,
    stage: r.StageName,
    amount: r.Amount,
    closeDate: r.CloseDate,
    probability: r.Probability,
    accountName: r.Account?.Name,
    ownerName: r.Owner?.Name,
    url: `${instanceUrl}/${r.Id}`,
  }))
}

export async function getRecentLeads(
  token: string,
  instanceUrl: string,
  limit = 20
): Promise<SalesforceLead[]> {
  const soql = `SELECT Id, Name, Email, Phone, Company, Status, LeadSource
    FROM Lead
    WHERE IsConverted = false
    ORDER BY CreatedDate DESC
    LIMIT ${limit}`
  const data = await sfQuery(instanceUrl, token, soql)
  return (data.records ?? []).map((r: any) => ({
    id: r.Id,
    name: r.Name,
    email: r.Email,
    phone: r.Phone,
    company: r.Company,
    status: r.Status,
    source: r.LeadSource,
    url: `${instanceUrl}/${r.Id}`,
  }))
}

export async function getSalesforceUserInfo(
  token: string,
  instanceUrl: string
): Promise<{ name: string; email: string; orgName: string }> {
  const res = await fetch(`${instanceUrl}/services/oauth2/userinfo`, {
    headers: sfHeaders(token),
  })
  const data = await res.json()
  return { name: data.name, email: data.email, orgName: data.organization_id }
}
