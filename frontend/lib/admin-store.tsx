"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

// ─── Types ──────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN"
export type UserStatus = "ACTIVE" | "SUSPENDED"
export type BusinessStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  joinedAt: string
  lastActive: string
  verified: boolean
}

export interface AdminBusiness {
  id: string
  companyName: string
  industry: string
  location: string
  offer: string
  need: string
  dealValue: string
  status: BusinessStatus
  verified: boolean
  ownerId: string
  ownerName: string
  createdAt: string
}

// ─── Mock Users ─────────────────────────────────────────────────────────

const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "admin@taplyzer.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    joinedAt: "2024-01-01",
    lastActive: "2026-04-15",
    verified: true,
  },
  {
    id: "2",
    name: "Jason Drake",
    email: "jason@techflow.com",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2025-11-12",
    lastActive: "2026-04-14",
    verified: true,
  },
  {
    id: "3",
    name: "Maria Chen",
    email: "maria@datastream.io",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2025-12-03",
    lastActive: "2026-04-13",
    verified: false,
  },
  {
    id: "4",
    name: "Alex Rowe",
    email: "alex@cloudvault.co",
    role: "USER",
    status: "SUSPENDED",
    joinedAt: "2026-01-18",
    lastActive: "2026-03-20",
    verified: false,
  },
  {
    id: "5",
    name: "Sarah Kim",
    email: "sarah@scaleops.dev",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2026-02-07",
    lastActive: "2026-04-15",
    verified: false,
  },
  {
    id: "6",
    name: "David Nguyen",
    email: "david@nexustech.ai",
    role: "USER",
    status: "ACTIVE",
    joinedAt: "2026-03-01",
    lastActive: "2026-04-10",
    verified: true,
  },
  {
    id: "7",
    name: "Emily Hart",
    email: "emily@growthmetrics.net",
    role: "ADMIN",
    status: "ACTIVE",
    joinedAt: "2025-10-25",
    lastActive: "2026-04-15",
    verified: true,
  },
]

const MOCK_BUSINESSES: AdminBusiness[] = [
  {
    id: "b1",
    companyName: "TechFlow Solutions",
    industry: "SaaS",
    location: "San Francisco, CA",
    offer: "Cloud infrastructure for B2B SaaS platforms",
    need: "Sales partnerships and channel resellers",
    dealValue: "$45,000",
    status: "APPROVED",
    verified: true,
    ownerId: "2",
    ownerName: "Jason Drake",
    createdAt: "2025-11-15",
  },
  {
    id: "b2",
    companyName: "DataStream Analytics",
    industry: "Business Intelligence",
    location: "New York, NY",
    offer: "Real-time data dashboards and reporting",
    need: "Strategic partners for market expansion",
    dealValue: "$120,000",
    status: "APPROVED",
    verified: true,
    ownerId: "3",
    ownerName: "Maria Chen",
    createdAt: "2025-12-10",
  },
  {
    id: "b3",
    companyName: "CloudVault Security",
    industry: "Cybersecurity",
    location: "Austin, TX",
    offer: "Enterprise security rollouts and implementation",
    need: "Implementation partners with enterprise clients",
    dealValue: "$45,000",
    status: "SUSPENDED",
    verified: false,
    ownerId: "4",
    ownerName: "Alex Rowe",
    createdAt: "2026-01-20",
  },
  {
    id: "b4",
    companyName: "ScaleOps Solutions",
    industry: "DevOps",
    location: "Seattle, WA",
    offer: "Managed DevOps and CI/CD pipeline setup",
    need: "Mid-market tech companies needing infra upgrades",
    dealValue: "$67,000",
    status: "PENDING",
    verified: false,
    ownerId: "5",
    ownerName: "Sarah Kim",
    createdAt: "2026-02-10",
  },
  {
    id: "b5",
    companyName: "Nexus Technologies",
    industry: "Enterprise Software",
    location: "San Francisco, CA",
    offer: "ERP and supply chain management systems",
    need: "Client referrals and system integrators",
    dealValue: "$85,000",
    status: "APPROVED",
    verified: true,
    ownerId: "6",
    ownerName: "David Nguyen",
    createdAt: "2026-03-05",
  },
  {
    id: "b6",
    companyName: "GrowthMetrics Inc",
    industry: "Analytics",
    location: "Chicago, IL",
    offer: "Customer behavior analytics and CRO services",
    need: "SaaS companies with >1K monthly users",
    dealValue: "$32,000",
    status: "PENDING",
    verified: false,
    ownerId: "7",
    ownerName: "Emily Hart",
    createdAt: "2026-04-01",
  },
]

// ─── Context ─────────────────────────────────────────────────────────────

interface AdminStoreContextType {
  users: AdminUser[]
  businesses: AdminBusiness[]
  // User actions
  deleteUser: (id: string) => void
  toggleUserStatus: (id: string) => void
  verifyUser: (id: string) => void
  grantAdminRole: (id: string) => void
  revokeAdminRole: (id: string) => void
  // Business actions
  approveBusiness: (id: string) => void
  rejectBusiness: (id: string) => void
  verifyBusiness: (id: string) => void
  suspendBusiness: (id: string) => void
  activateBusiness: (id: string) => void
  deleteBusiness: (id: string) => void
  // Stats
  getPlatformStats: () => PlatformStats
}

export interface PlatformStats {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalBusinesses: number
  pendingBusinesses: number
  approvedBusinesses: number
  verifiedBusinesses: number
  totalDeals: number
  totalDealValue: string
}

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(undefined)

const USERS_KEY = "taplyzer_admin_users"
const BUSINESSES_KEY = "taplyzer_admin_businesses"

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [businesses, setBusinesses] = useState<AdminBusiness[]>(MOCK_BUSINESSES)

  // Fetch from API and persist to localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, bizRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/businesses")
        ]);

        if (usersRes.ok && bizRes.ok) {
          const usersData = await usersRes.json();
          const bizData = await bizRes.json();
          
          const usersArray = Array.isArray(usersData) ? usersData : (usersData.users || []);
          const bizArray = Array.isArray(bizData) ? bizData : (bizData.businesses || []);
          
          // Map _id to id for frontend compatibility
          const mappedUsers = usersArray.map((u: any) => ({ ...u, id: u._id }));
          const mappedBiz = bizArray.map((b: any) => ({ ...b, id: b._id }));

          setUsers(mappedUsers);
          setBusinesses(mappedBiz);
          
          localStorage.setItem(USERS_KEY, JSON.stringify(mappedUsers));
          localStorage.setItem(BUSINESSES_KEY, JSON.stringify(mappedBiz));
        }
      } catch (error) {
        console.error("Failed to fetch server data, falling back to local storage:", error);
        const savedUsers = localStorage.getItem(USERS_KEY);
        const savedBusinesses = localStorage.getItem(BUSINESSES_KEY);
        if (savedUsers) setUsers(JSON.parse(savedUsers));
        if (savedBusinesses) setBusinesses(JSON.parse(savedBusinesses));
      }
    };

    fetchData();
  }, []);

  const saveUsers = (updated: AdminUser[]) => {
    setUsers(updated)
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
  }

  const saveBusinesses = (updated: AdminBusiness[]) => {
    setBusinesses(updated)
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
  }

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== id)
      localStorage.setItem(USERS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const toggleUserStatus = useCallback((id: string) => {
    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === id ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } as AdminUser : u
      )
      localStorage.setItem(USERS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const verifyUser = useCallback((id: string) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, verified: true } : u)
      localStorage.setItem(USERS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const grantAdminRole = useCallback((id: string) => {
    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === id && u.role === "USER" ? { ...u, role: "ADMIN" } as AdminUser : u
      )
      localStorage.setItem(USERS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const revokeAdminRole = useCallback((id: string) => {
    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === id && u.role === "ADMIN" ? { ...u, role: "USER" } as AdminUser : u
      )
      localStorage.setItem(USERS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const approveBusiness = useCallback((id: string) => {
    setBusinesses(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, status: "APPROVED" } as AdminBusiness : b)
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const rejectBusiness = useCallback((id: string) => {
    setBusinesses(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, status: "REJECTED" } as AdminBusiness : b)
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const verifyBusiness = useCallback((id: string) => {
    setBusinesses(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, verified: true, status: "APPROVED" } as AdminBusiness : b)
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const suspendBusiness = useCallback((id: string) => {
    setBusinesses(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, status: "SUSPENDED" } as AdminBusiness : b)
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const activateBusiness = useCallback((id: string) => {
    setBusinesses(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, status: "APPROVED" } as AdminBusiness : b)
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteBusiness = useCallback((id: string) => {
    setBusinesses(prev => {
      const updated = prev.filter(b => b.id !== id)
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const getPlatformStats = useCallback((): PlatformStats => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === "ACTIVE").length,
      suspendedUsers: users.filter(u => u.status === "SUSPENDED").length,
      totalBusinesses: businesses.length,
      pendingBusinesses: businesses.filter(b => b.status === "PENDING").length,
      approvedBusinesses: businesses.filter(b => b.status === "APPROVED").length,
      verifiedBusinesses: businesses.filter(b => b.verified).length,
      totalDeals: businesses.filter(b => b.status === "APPROVED").length,
      totalDealValue: "$12.4M",
    }
  }, [users, businesses])

  return (
    <AdminStoreContext.Provider
      value={{
        users,
        businesses,
        deleteUser,
        toggleUserStatus,
        verifyUser,
        grantAdminRole,
        revokeAdminRole,
        approveBusiness,
        rejectBusiness,
        verifyBusiness,
        suspendBusiness,
        activateBusiness,
        deleteBusiness,
        getPlatformStats,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  )
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext)
  if (context === undefined) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider")
  }
  return context
}
