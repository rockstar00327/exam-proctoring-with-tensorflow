import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import examRoutes from './routes/examRoutes.js';
import userRoutes from './routes/userRoutes.js';
import speedTestRoutes from './routes/speedTest.js';
import swaggerSpec from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Trust proxy for correct client IP detection when behind a reverse proxy
app.set('trust proxy', 1);

// Configure CORS with proper error handling
// Get additional origins from environment variable
const configuredOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const allowedOrigins = [
  // Production
  'https://ai-proctor-sigma.vercel.app',
  // Development
  '*',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  // Add any other environments or preview URLs here
  /^\.*ai-proctor.*\.vercel\.app$/, // Matches all Vercel preview deployments
  // Add any additional domains as needed
  ...configuredOrigins // Include origins from environment variable
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check for exact match or regex match
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (!isAllowed) {
      console.warn(`Blocked request from origin: ${origin}`);
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'x-auth-token',
    'Cache-Control',
    'Pragma',
    'Expires',
    'clerk-session-token',
    'clerk-frontend-api'
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Total-Count',
    'x-auth-token',
    'Content-Type',
    'Content-Length'
  ],
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Connect to database with error handling
connectDB().catch((error) => {
  console.error('Failed to connect to database:', error.message);
  // Don't exit the process immediately, let the app start but log the error
  console.log('Server will continue running without database connection...');
});
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());
// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// to parse req body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Session configuration for OAuth
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Proctoring API Documentation',
  customfavIcon: '/favicon.ico'
}));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);

// Speed Test Route - Mounted at /api/speedtest
app.use("/api/speedtest", speedTestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// we we are deploying this in production
// make frontend build then
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  // we making front build folder static to serve from this app
  app.use(express.static(path.join(__dirname, "/backend/build")));

  // if we get an routes that are not define by us we show then index html file
  // every enpoint that is not api/users go to this index file
  app.get('/{*splat}', (req, res) =>
    res.sendFile(path.resolve(__dirname, "backend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("<h1>server is running </h1>");
  });
}

// Custom Middlewares
app.use(notFound);
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}, corsOptions: ${process.env.CORS_ALLOW_ORIGIN ? process.env.CORS_ALLOW_ORIGIN.split(',') : allowedOrigins}`);
});

// Todos:
// -**POST /api/users**- Register a users
// -**POST /api/users/auth**- Authenticate a user and get token
// -**POST /api/users/logout**- logou user and clear cookie
// -**GET /api/users/profile**- Get user Profile
// -**PUT /api/users/profile**- Update user Profile
