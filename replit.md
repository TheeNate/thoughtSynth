# Knowledge Synthesis Hub

## Overview

This is a comprehensive study and knowledge synthesis platform built with React, TypeScript, Express, and PostgreSQL. The application processes external content (articles, podcasts, videos) and enables collaborative learning with AI integration. It uses modern full-stack architecture with a focus on AI-powered content analysis, real-time chat, and semantic search capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme support
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Real-time**: WebSocket implementation for chat
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
- **Users**: Profile data and authentication
- **Content Items**: URLs, metadata, and AI analysis
- **Takeaways**: User-generated insights per content
- **Chat System**: Threads and messages with AI integration
- **Tags**: Content categorization and search

## Key Components

### Content Processing Pipeline
1. **Content Detection**: Automatically identifies content type (article, podcast, video)
2. **Content Extraction**: Web scraping and metadata extraction
3. **AI Analysis**: Claude 3.5 Sonnet analysis for insights, concepts, and takeaways
4. **Embeddings**: OpenAI text-embedding-3-small for vector generation
5. **Vector Storage**: Pinecone database for semantic search capabilities
6. **Storage**: Structured data storage with PostgreSQL and vector metadata

### AI Integration
- **Primary AI**: Claude 3.5 Sonnet for content analysis and chat responses
- **Analysis Features**: Core concepts, key insights, notable quotes, related topics, actionable takeaways
- **Chat AI**: Claude-powered conversational AI for discussing content
- **Embeddings**: OpenAI text-embedding-3-small for semantic search only
- **Vector Database**: Pinecone for storing and searching content embeddings

### Real-time Features
- **WebSocket Chat**: Real-time messaging for content discussions
- **Collaborative Learning**: Multi-user chat with AI participation
- **Live Updates**: Real-time content library updates

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Theme**: Default dark theme with light mode support
- **Component Library**: Consistent UI using Shadcn/UI components
- **Accessibility**: ARIA-compliant components and keyboard navigation

## Data Flow

### Content Processing Flow
1. User submits URL through ContentInput component
2. System detects content type and extracts metadata
3. Content is processed through AI analysis pipeline
4. Results are stored in database with embeddings
5. Content appears in user's library with chat capability

### Chat Flow
1. User opens content detail page
2. Chat thread is created or retrieved
3. WebSocket connection established for real-time updates
4. Messages are processed through AI for intelligent responses
5. Chat history is persisted and synchronized

### Authentication Flow
1. Replit Auth handles OAuth flow
2. User session is managed with PostgreSQL store
3. Protected routes require authentication
4. User data is synchronized across sessions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **openai**: AI integration for content analysis
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS variants
- **lucide-react**: Icon library

### Development Dependencies
- **typescript**: Type checking and compilation
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied on deployment
4. **Assets**: Static assets served from build directory

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude API for content analysis and chat
- `OPENAI_API_KEY`: OpenAI API for embeddings only
- `PINECONE_API_KEY`: Pinecone vector database authentication
- `PINECONE_ENVIRONMENT`: Pinecone environment configuration
- `PINECONE_INDEX_NAME`: Pinecone index name for vectors
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Authentication domains
- `ISSUER_URL`: OAuth issuer URL

### Production Considerations
- Server-side rendering disabled (SPA mode)
- Static file serving with Express
- Database connection pooling
- Session persistence with PostgreSQL
- WebSocket support for real-time features

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
- July 08, 2025. Fixed AI architecture - replaced OpenAI analysis with Claude, added Pinecone vector database, OpenAI now only for embeddings
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```