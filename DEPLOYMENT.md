# My Harvest Hub - Faith-Based Marketplace

A Next.js 15 marketplace connecting church business owners with their community, featuring Paystack payment integration.

## 🚀 Features

- **Multi-vendor marketplace** with vendor applications and approvals
- **Paystack payment integration** for secure transactions
- **Admin dashboard** with analytics and order management
- **User authentication** with NextAuth.js
- **Review system** with moderation capabilities
- **Mobile-responsive design** with modern UI components
- **Image hero sliders** for engaging homepage experience

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payments**: Paystack
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components

## 🚀 Vercel Deployment

### Prerequisites
1. **Database**: Set up PostgreSQL or PlanetScale for production
2. **Paystack**: Get your live API keys from Paystack Dashboard

### Steps:

1. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   ```
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-production-secret"
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_your_live_key"
   PAYSTACK_SECRET_KEY="sk_live_your_live_secret"
   ```

3. **Database Setup**:
   ```bash
   # Run migrations on production database
   npx prisma db push
   npx prisma db seed
   ```

### Common 404 Issues:
- **Database**: SQLite doesn't work on Vercel - use PostgreSQL
- **Environment Variables**: Must be set in Vercel dashboard
- **API Routes**: Check if all routes are properly configured

## 🔧 Local Development

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Copy `.env.example` to `.env`
4. **Run database migrations**: `npx prisma db push`
5. **Seed the database**: `npx prisma db seed`
6. **Start development server**: `npm run dev`

## 📝 Environment Variables

See `.env.production` for production environment variable examples.

## 🤝 Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## 📄 License

This project is private and proprietary.