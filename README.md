# JudgeAI - AI-Powered Legal Dispute Resolution Platform
🔗 **Project Demo Video:** [https://youtu.be/rqUrJL_RJhk](https://youtu.be/rqUrJL_RJhk)

An innovative web application that leverages artificial intelligence to simulate legal arguments and generate verdicts for dispute resolution. Built with modern web technologies and powered by OpenAI's language models.

## 🏛️ Overview

JudgeAI is a comprehensive legal tech platform that allows users to:
- Create legal cases and invite respondents
- Upload evidence documents (PDFs)
- Engage in structured argument exchanges (5 rounds per side)
- Receive AI-generated legal verdicts based on arguments and evidence
- Track case status and manage multiple disputes

## ✨ Key Features

### 🎯 Core Functionality
- **Case Management**: Create, join, and track legal disputes
- **Document Upload**: Secure PDF evidence upload with text extraction
- **Structured Arguments**: Turn-based debate system (5 arguments per side)
- **AI Verdict Generation**: Automated legal analysis and judgment
- **Real-time Updates**: Live argument counters and status tracking
- **Professional UI**: Court-themed interface with clear visual distinctions

### 🤖 AI Integration
- **Semantic Search**: ChromaDB vector database for evidence retrieval
- **Legal Analysis**: OpenAI GPT models for argument evaluation
- **Verdict Generation**: Comprehensive judgments with reasoning
- **Document Processing**: Automated PDF text extraction and analysis

### 🎨 User Experience
- **Role-based Views**: Claimant vs Respondent perspectives
- **Visual Distinction**: Blue (Claimant) vs Red (Respondent) color coding
- **Progress Tracking**: Real-time argument counters and status badges
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React UI      │    │ • API Routes    │    │ • OpenAI API    │
│ • Tailwind CSS  │    │ • Auth Logic    │    │ • ChromaDB      │
│ • Query Client  │    │ • DB Queries    │    │ • PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │  (Prisma/PG)    │
                    │                 │
                    │ • Users         │
                    │ • Cases         │
                    │ • Documents     │
                    │ • Turns         │
                    │ • Verdicts      │
                    └─────────────────┘
```

### Technology Stack

#### Frontend (`apps/web`)
- **Framework**: Next.js 14 with App Router
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT-based auth system
- **Icons**: Lucide React
- **TypeScript**: Full type safety

#### Backend (`apps/api`)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT middleware
- **File Upload**: Multer for PDF handling
- **AI Integration**: OpenAI API client
- **Vector Search**: ChromaDB client

#### Shared Packages
- **Database Schema** (`packages/db`): Prisma schema and migrations
- **RAG Pipeline** (`packages/rag`): Document processing and embeddings
- **Prompts** (`packages/prompts`): AI prompt templates

### Database Schema

```sql
Users {
  id: String (Primary)
  name: String
  email: String (Unique)
  passwordHash: String
  createdAt: DateTime
}

Cases {
  id: String (Primary)
  title: String
  createdAt: DateTime
  createdByUserId: String (Foreign)
  sides: Side[] (Relation)
  documents: Document[] (Relation)
  turns: Turn[] (Relation)
  verdict: Verdict? (Relation)
}

Sides {
  id: String (Primary)
  caseId: String (Foreign)
  userId: String (Foreign)
  role: Enum (CLAIMANT | RESPONDENT)
}

Documents {
  id: String (Primary)
  caseId: String (Foreign)
  filename: String
  fileUrl: String
  uploadedAt: DateTime
}

Turns {
  id: String (Primary)
  caseId: String (Foreign)
  sideId: String (Foreign)
  message: String
  order: Int
  createdAt: DateTime
}

Verdicts {
  id: String (Primary)
  caseId: String (Foreign, Unique)
  summary: String
  reasoning: String
  finalText: String
  createdAt: DateTime
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **pnpm**: Package manager (recommended)
- **PostgreSQL**: Database server
- **Docker**: For ChromaDB (optional but recommended)
- **OpenAI API Key**: For AI functionality

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JudgeAI
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in the following locations:

   **Backend** (`apps/api/.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/judgeai"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key"
   
   # OpenAI
   OPENAI_API_KEY="sk-your-openai-api-key"
   
   # ChromaDB
   CHROMA_URL="http://localhost:8000"
   ```

   **Frontend** (`apps/web/.env`):
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8080"
   ```

4. **Database Setup**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   docker run --name judgeai-postgres \
     -e POSTGRES_DB=judgeai \
     -e POSTGRES_USER=judgeai \
     -e POSTGRES_PASSWORD=judgeai \
     -p 5432:5432 \
     -d postgres:15
   ```
   
   **Option B: Local PostgreSQL**
   - Create database named `judgeai`
   - Update `DATABASE_URL` accordingly

5. **ChromaDB Setup**
   
   Start ChromaDB using Docker:
   ```bash
   docker-compose up -d chromadb
   ```

6. **Database Migration**
   ```bash
   cd packages/db
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

7. **Build Packages**
   ```bash
   pnpm build
   ```

### Running the Application

1. **Start the backend**
   ```bash
   cd apps/api
   pnpm start
   ```
   Backend will run on `http://localhost:8080`

2. **Start the frontend**
   ```bash
   cd apps/web
   pnpm dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the application**
   - Open `http://localhost:3000` in your browser
   - Sign up for a new account or log in
   - Create your first case!

## 📁 Project Structure

```
JudgeAI/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utilities and hooks
│   │   └── tailwind.config.js
│   └── api/                 # Express.js backend
│       ├── src/
│       │   ├── routes/     # API endpoints
│       │   ├── middleware/ # Auth and validation
│       │   └── types/      # TypeScript types
│       └── prisma/         # Database client
├── packages/
│   ├── db/                  # Prisma schema
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── rag/                 # Document processing
│   │   └── src/
│   │       └── index.ts     # PDF extraction, embeddings
│   └── prompts/             # AI prompt templates
│       └── judgePrompt.ts   # Verdict generation logic
├── docker-compose.yml       # ChromaDB service
└── package.json            # Monorepo configuration
```

## 🔧 Development Workflow

### Making Changes

1. **Frontend Changes**: Edit files in `apps/web/`
2. **Backend Changes**: Edit files in `apps/api/`
3. **Database Changes**: 
   - Modify `packages/db/prisma/schema.prisma`
   - Run `pnpm prisma migrate dev`
   - Run `pnpm prisma generate`

### Building and Testing

```bash
# Build all packages
pnpm build

# Run in development mode
pnpm dev

# Run tests (when available)
pnpm test
```

### Environment Variables Reference

| Variable | Location | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Backend | JWT signing secret | `your-secret-key` |
| `OPENAI_API_KEY` | Backend | OpenAI API key | `sk-...` |
| `CHROMA_URL` | Backend | ChromaDB instance URL | `http://localhost:8000` |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL | `http://localhost:8080` |

## 🎯 Core Features Deep Dive

### Case Creation Flow
1. User creates case with title and respondent email
2. System assigns user as CLAIMANT
3. Email sent to respondent (when implemented)
4. Respondent can join case via email link

### Argument System
- **Turn-based**: CLAIMANT starts, then RESPONDENT, alternating
- **Limit**: Maximum 5 arguments per side (10 total)
- **Validation**: Users can only argue during their turn
- **Real-time**: Argument counters update immediately

### AI Verdict Generation
1. **Evidence Collection**: Retrieve relevant document chunks using semantic search
2. **Argument Analysis**: Process all arguments from both sides
3. **Legal Reasoning**: Generate comprehensive analysis using GPT
4. **Final Judgment**: Produce structured verdict with summary and reasoning

### Document Processing
- **PDF Upload**: Secure file upload with validation
- **Text Extraction**: Extract readable text from PDFs
- **Error Handling**: Graceful handling of corrupted/protected PDFs
- **Vector Storage**: Store embeddings for semantic search

## 🔒 Security Considerations

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: PDF validation and virus scanning (when implemented)
- **Rate Limiting**: API rate limiting (when implemented)
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Deployment

### Production Environment Variables
```env
# Backend
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host:5432/judgeai-prod"
JWT_SECRET="production-jwt-secret"
OPENAI_API_KEY="production-openai-key"
CHROMA_URL="https://production-chromadb.com"

# Frontend
NEXT_PUBLIC_API_URL="https://api.judgeai.com"
```

### Docker Deployment
```bash
# Build and deploy all services
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check `DATABASE_URL` configuration
   - Verify database exists

2. **ChromaDB Connection Error**
   - Start ChromaDB: `docker-compose up -d chromadb`
   - Check `CHROMA_URL` environment variable

3. **OpenAI API Errors**
   - Verify API key is valid and has credits
   - Check `OPENAI_API_KEY` environment variable

4. **Build Errors**
   - Run `pnpm install` to update dependencies
   - Clear node_modules and reinstall if needed

5. **Frontend Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check `tailwind.config.js` content paths

### Getting Help

- Check the browser console for JavaScript errors
- Review backend logs for API errors
- Verify all environment variables are set correctly
- Ensure all services are running (PostgreSQL, ChromaDB, Backend, Frontend)

## 🎉 Future Enhancements

- [ ] Email notifications for case invitations
- [ ] Real-time WebSocket updates
- [ ] Advanced document formats support
- [ ] Case export functionality
- [ ] Multi-jurisdiction support
- [ ] Analytics and reporting dashboard
- [ ] Mobile app development
- [ ] Integration with legal databases

---

**Built with ❤️ for modern legal dispute resolution**
