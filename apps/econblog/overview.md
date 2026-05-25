Project Overview
Build a gamified economics education platform that combines blog content with interactive quizzes.
Key features:

Blog feed with free & premium posts

Gamified quizzes that auto-register into the DB

XP system with progress tracking

Subscription tiers (Free, Limited, Premium) via Stripe

User profile with XP bar + billing management

Core Architecture

Frontend: Next.js 14+ (App Router)

UI: Tailwind CSS + Shadcn/UI

Database: Supabase (Postgres) with Prisma ORM

Auth: Clerk

Payments: Stripe (Checkout + Portal)

Deployment: AWS Amplify Hosting (CSR-first)

State Management: Zustand or React Query (SWR)

Rendering Strategy

Current: Client-side rendering (CSR)

Future: Can expand to SSR/ISR for SEO

Subscription & Access Model
Tiers:

Free – access to free posts only

Limited – can preview 10% of premium posts

Premium – full access

Stripe Integration:

Checkout sessions (monthly/yearly)

Customer portal for billing management

Webhooks update subscriptions table

User Profile Page

XP Bar — currentXp / totalXp progress bar

Subscription Info — current plan, renewal date

Actions: Upgrade, cancel, manage billing

Database Schema (Prisma)

model User {
id String @id @default(uuid())
email String @unique
username String @unique
totalXp Int @default(0)
subscriptions Subscription[]
posts BlogPost[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model BlogPost {
id String @id @default(uuid())
title String
slug String @unique
excerpt String?
content String
accessType AccessType @default(free)
authorId String
author User @relation(fields: [authorId], references: [id])
questions Question[]
published Boolean @default(false)
scheduledAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

enum AccessType {
free
limited
premium
}

model Question {
id String @id @default(uuid())
blogPostId String
blogPost BlogPost @relation(fields: [blogPostId], references: [id], onDelete: Cascade)
questionKey String
questionText String
options Json
correctAnswer Int
correctExplanation String
xpReward Int @default(10)
createdAt DateTime @default(now())
@@unique([blogPostId, questionKey])
}

model Subscription {
id String @id @default(uuid())
userId String
user User @relation(fields: [userId], references: [id])
stripeCustomerId String
stripeSubscriptionId String
status String // active | canceled | past_due
plan String // free | limited | premium
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

Access Control

export async function canAccessPost(userId: string | null, post: BlogPost) {
if (post.accessType === "free") return true;
if (post.accessType === "limited") return false; // preview only
if (post.accessType === "premium") {
const sub = await getUserSubscription(userId);
return sub?.plan === "premium" && sub?.status === "active";
}
return false;
}

export function getLimitedPreview(content: string, percent = 10, minChars = 500) {
const total = content.length;
const sliceLen = Math.max(Math.floor((percent / 100) * total), minChars);
return content.slice(0, sliceLen) + "...";
}

Quiz Component Example

<Question
postSlug="supply-and-demand"
questionKey="eq-basics-q1"
questionText="If coffee demand increases while supply stays constant, what happens to price?"
options={[
"Price decreases",
"Price increases",
"Price remains unchanged",
"Price unpredictable"
]}
correctAnswer={1}
correctExplanation="Higher demand with constant supply creates competition among buyers, driving prices up."
xpReward={15}
/>

Auto-Register Flow

On mount: component calls /api/questions/register

If (postSlug, questionKey) doesn’t exist → insert new row

If exists → update text/props

Submission → /api/questions/[id]/submit updates userProgress + XP

Article Authoring Example

export default function SupplyAndDemandArticle() {
return (
<article className="prose max-w-3xl mx-auto">
<h1>Supply & Demand</h1>
<p>When demand rises while supply remains constant, prices increase...</p>

  <Question
    postSlug="supply-and-demand"
    questionKey="eq-q1"
    questionText="If demand rises while supply stays constant, what happens to price?"
    options={["Price decreases", "Price increases", "No change", "Unpredictable"]}
    correctAnswer={1}
    correctExplanation="Higher demand pushes prices upward when supply is fixed."
    xpReward={15}
  />

  <h2>Market Equilibrium</h2>
  <p>Equilibrium occurs when supply equals demand...</p>
</article>


);
}

User Experience Flow
Free User:

Full access to free posts

Limited preview of premium posts (10%)

Premium User:

Unlimited access

XP & quizzes unlocked

Profile:

XP progress bar

Subscription info + Stripe billing portal

Development Phases
Phase 1: Core Learning

Blog CRUD

Question component (auto-register + submit)

XP system + progress tracking

User profile (XP bar)

Phase 2: Monetization

Stripe subscription integration

Content restriction (free/limited/premium)

Subscription management UI

Phase 3: Gamification

Retry cooldown logic

Achievements & badges

Analytics dashboard

Phase 4: Optimization

SEO & SSR for blogs

Performance & caching

A/B testing

Success Metrics

Learning: Quiz completion %, retry success rates, XP progression

Growth: Monthly active users, subscription conversions, churn

Content: Time on page, preview → upgrade funnel

Deployment Strategy

AWS Amplify Hosting for Next.js CSR

Supabase (Postgres) for DB

Stripe Webhooks for billing events

Route 53 or GoDaddy DNS → Amplify for domain + SSL

Content Strategy

Microeconomics basics

Macroeconomic indicators

International trade

Policy analysis

Real-world case studies