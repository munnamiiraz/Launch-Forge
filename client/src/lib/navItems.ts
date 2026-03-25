export interface NavItem {
    title: string;
    href: string;
    icon: string;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

import { getDefaultDashboardRoute, UserRole } from "./authUtils";


export const getCommonNavItems = (role : UserRole) : NavSection[] => {
    const defaultDashboard = getDefaultDashboardRoute(role);
    return [
        {
            items : [
                {
                    title : "Home",
                    href : "/",
                    icon : "Home"
                },
                {
                    title : "Dashboard",
                    href : defaultDashboard,
                    icon : "LayoutDashboard"

                },
                {
                    title: "Settings",
                    href: `/dashboard/settings`,
                    icon: "Settings",
                },
            ]
        }
    ]
}


export const ownerNavItems : NavSection[] = [
    {
        title: "Growth",
        items : [
            {
                title : "My Waitlists",
                href : "/dashboard/waitlists",
                icon : "ListChecks"
            },
            {
                title: "Analytics",
                href: "/dashboard/analytics",
                icon: "BarChart3",
            },
            {
                title: "Roadmap",
                href: "/dashboard/roadmap",
                icon: "Map",
            },
        ]
    },
    {
        title: "Billing",
        items : [
            {
                title : "Plan & Billing",
                href : "/dashboard/billing",
                icon : "CreditCard"
            }
        ]
    }
]

export const adminNavItems: NavSection[] = [
    {
        title: "Platform",
        items: [
            {
                title: "Admin Analytics",
                href: "/admin/dashboard",
                icon: "PieChart",
            },
            {
                title: "Users Control",
                href: "/admin/dashboard/users",
                icon: "Users",
            },
            {
                title: "Projects Review",
                href: "/admin/dashboard/projects",
                icon: "Rocket",
            },
        ],
    },
    {
        title: "Content",
        items: [
            {
                title: "Waitlists",
                href: "/admin/dashboard/waitlists",
                icon: "Layers",
            },
            {
                title: "Subscribers",
                href: "/admin/dashboard/subscribers",
                icon: "Mail",
            },
        ],
    },
];

export const getNavItemsByRole = (role : UserRole) : NavSection[] => {
    const commonNavItems = getCommonNavItems(role);

    switch (role) {
        case "ADMIN":
            return [...commonNavItems, ...adminNavItems];

        case "OWNER":
        case "USER":
            return [...commonNavItems, ...ownerNavItems]
        
        default:
            return commonNavItems;
    }
}