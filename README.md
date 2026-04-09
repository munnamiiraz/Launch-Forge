# LaunchForge 🚀

**LaunchForge** is a premium, full-stack waitlist and referral management platform designed to help builders launch their products with style and viral growth.

---

## ✨ Key Features

### 🏁 For Launchers
- **Smart Waitlists**: Create beautiful, conversion-optimized waitlists in seconds.
- **Viral Referral Engine**: Built-in referral tracking with unique codes for every subscriber.
- **Dynamic Leaderboards**: Reward your top referrers with automated rankings and prizes.
- **Public Feedback & Roadmaps**: Build in public with feature request boards, voting, and status tracking.
- **Analytics Dashboards**: Deep insights into subscriber growth, conversion rates, and revenue.

### 🛡 For Admins
- **Platform KPIs**: Overview of total users, MRR, and global stickiness metrics.
- **Revenue Analytics**: Detailed financial dashboards including MRR waterfalls and churn analysis.
- **Operational Health**: Real-time system status and activity feeds across all workspaces.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: React Query & Server Components

### Backend
- **Core**: [Express.js](https://expressjs.com) (Node.js)
- **ORM**: [Prisma](https://www.prisma.io)
- **Database**: [PostgreSQL](https://www.postgresql.org) with `pgvector` for AI-powered similar waitlist discovery.
- **Authentication**: JWT-based auth with Google OAuth integration.

---

## 📁 Project Structure

```text
launch-forge/
├── client/           # Next.js frontend
├── server/           # Express.js backend
├── package.json      # Root dependencies (scripts)
└── .gitignore        # Comprehensive root-level ignore
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (with `pgvector` extension)

### 2. Installation
Clone the repository and install dependencies in all folders:
```bash
# Root
npm install

# Client
cd client && npm install

# Server
cd ../server && npm install
```

### 3. Environment Variables
Create `.env` files in both `/client` and `/server` folders based on the provided guide.

### 4. Database Setup
Sync the schema to your local or hosted database:
```bash
cd server
npx prisma db push
```

### 5. Running the App
Run both servers simultaneously from the root:
```bash
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License.
