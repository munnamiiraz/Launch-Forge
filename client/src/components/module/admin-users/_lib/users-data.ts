import type { AdminUser } from "@/src/components/module/admin/_types";

export type SortField = "name" | "createdAt" | "lastActiveAt" | "subscribers" | "waitlists";
export type SortDir   = "asc" | "desc";
export type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED";
export type PlanFilter   = "ALL" | "FREE" | "PRO" | "GROWTH";
export type RoleFilter   = "ALL" | "USER" | "ADMIN";

export interface UsersPageStats {
  total:     number;
  active:    number;
  suspended: number;
  deleted:   number;
  free:      number;
  pro:       number;
  growth:    number;
  newToday:  number;
  newWeek:   number;
}

/* ── Extended mock dataset (25 users) ───────────────────────────── */
export function getAllUsers(): AdminUser[] {
  return [
    { id:"u01", name:"Sarah Kim",       email:"sarah@acmecorp.io",    role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"YEARLY",   waitlists:4,  subscribers:12_430, createdAt:"2025-01-10", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u02", name:"Marcus Torres",   email:"marcus@example.com",   role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:2,  subscribers:3_200,  createdAt:"2025-01-22", lastActiveAt:"2025-03-17", isDeleted:false },
    { id:"u03", name:"Priya Mehta",     email:"priya@startup.io",     role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"MONTHLY",  waitlists:6,  subscribers:9_810,  createdAt:"2025-02-01", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u04", name:"James Lee",       email:"james@dev.com",        role:"USER",  status:"SUSPENDED", plan:"FREE",   planMode:null,       waitlists:1,  subscribers:180,    createdAt:"2025-02-14", lastActiveAt:"2025-03-10", isDeleted:false },
    { id:"u05", name:"Sofia Reyes",     email:"sofia@company.mx",     role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"YEARLY",   waitlists:3,  subscribers:5_410,  createdAt:"2025-02-20", lastActiveAt:"2025-03-16", isDeleted:false },
    { id:"u06", name:"Ryo Tanaka",      email:"ryo@example.com",      role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:7_660,  createdAt:"2025-03-01", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u07", name:"Anna Schmidt",    email:"anna@corp.de",         role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:2,  subscribers:5_320,  createdAt:"2025-03-05", lastActiveAt:"2025-03-15", isDeleted:false },
    { id:"u08", name:"Ben Okafor",      email:"ben@mail.ng",          role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:1,  subscribers:890,    createdAt:"2025-03-10", lastActiveAt:"2025-03-12", isDeleted:false },
    { id:"u09", name:"Clara Müller",    email:"clara@corp.de",        role:"ADMIN", status:"ACTIVE",    plan:"GROWTH", planMode:"YEARLY",   waitlists:8,  subscribers:21_300, createdAt:"2025-01-05", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u10", name:"Omar Farooq",     email:"omar@venture.ae",      role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:4_100,  createdAt:"2025-01-18", lastActiveAt:"2025-03-14", isDeleted:false },
    { id:"u11", name:"Lena Andersen",   email:"lena@nord.dk",         role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"YEARLY",   waitlists:3,  subscribers:2_800,  createdAt:"2025-01-28", lastActiveAt:"2025-03-17", isDeleted:false },
    { id:"u12", name:"Diego Ruiz",      email:"diego@latam.co",       role:"USER",  status:"SUSPENDED", plan:"PRO",    planMode:"MONTHLY",  waitlists:2,  subscribers:1_240,  createdAt:"2025-02-08", lastActiveAt:"2025-02-28", isDeleted:false },
    { id:"u13", name:"Yuki Tanaka",     email:"yuki@jp.io",           role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"MONTHLY",  waitlists:5,  subscribers:7_100,  createdAt:"2025-02-11", lastActiveAt:"2025-03-16", isDeleted:false },
    { id:"u14", name:"Mei Ling",        email:"mei@cn-startup.io",    role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:620,    createdAt:"2025-02-19", lastActiveAt:"2025-03-11", isDeleted:false },
    { id:"u15", name:"Ivan Petrov",     email:"ivan@ru-tech.com",     role:"USER",  status:"DELETED",   plan:"FREE",   planMode:null,       waitlists:0,  subscribers:0,      createdAt:"2025-02-22", lastActiveAt:null,          isDeleted:true  },
    { id:"u16", name:"Amara Osei",      email:"amara@ghana-dev.io",   role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:2,  subscribers:3_900,  createdAt:"2025-03-02", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u17", name:"Fatima Al-Amin",  email:"fatima@bd-startup.io", role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:480,    createdAt:"2025-03-06", lastActiveAt:"2025-03-15", isDeleted:false },
    { id:"u18", name:"Lucas Oliveira",  email:"lucas@br.tech",        role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"YEARLY",   waitlists:7,  subscribers:14_200, createdAt:"2025-03-08", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u19", name:"Nadia Hassan",    email:"nadia@eg-ventures.io", role:"USER",  status:"SUSPENDED", plan:"PRO",    planMode:"MONTHLY",  waitlists:1,  subscribers:560,    createdAt:"2025-03-09", lastActiveAt:"2025-03-09", isDeleted:false },
    { id:"u20", name:"Chen Wei",        email:"chen@sg-tech.io",      role:"USER",  status:"ACTIVE",    plan:"GROWTH", planMode:"MONTHLY",  waitlists:4,  subscribers:8_440,  createdAt:"2025-03-11", lastActiveAt:"2025-03-17", isDeleted:false },
    { id:"u21", name:"Isabel Costa",    email:"isabel@pt.io",         role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"MONTHLY",  waitlists:2,  subscribers:1_870,  createdAt:"2025-03-12", lastActiveAt:"2025-03-16", isDeleted:false },
    { id:"u22", name:"Ryan Park",       email:"ryan@kr-startup.io",   role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:320,    createdAt:"2025-03-13", lastActiveAt:"2025-03-15", isDeleted:false },
    { id:"u23", name:"Aisha Diallo",    email:"aisha@sn-tech.io",     role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:190,    createdAt:"2025-03-14", lastActiveAt:"2025-03-14", isDeleted:false },
    { id:"u24", name:"Tom Nguyen",      email:"tom@vn.io",            role:"USER",  status:"ACTIVE",    plan:"PRO",    planMode:"YEARLY",   waitlists:3,  subscribers:4_100,  createdAt:"2025-03-15", lastActiveAt:"2025-03-18", isDeleted:false },
    { id:"u25", name:"Leila Ahmadi",    email:"leila@ir-dev.io",      role:"USER",  status:"ACTIVE",    plan:"FREE",   planMode:null,       waitlists:1,  subscribers:270,    createdAt:"2025-03-16", lastActiveAt:"2025-03-17", isDeleted:false },
  ];
}

export function computeUsersPageStats(users: AdminUser[]): UsersPageStats {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  return {
    total:     users.length,
    active:    users.filter((u) => u.status === "ACTIVE").length,
    suspended: users.filter((u) => u.status === "SUSPENDED").length,
    deleted:   users.filter((u) => u.status === "DELETED").length,
    free:      users.filter((u) => u.plan === "FREE").length,
    pro:       users.filter((u) => u.plan === "PRO").length,
    growth:    users.filter((u) => u.plan === "GROWTH").length,
    newToday:  users.filter((u) => new Date(u.createdAt) >= today).length,
    newWeek:   users.filter((u) => new Date(u.createdAt) >= weekAgo).length,
  };
}