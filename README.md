# Asset Audit & Reconciliation Platform

A comprehensive asset management system with web and mobile applications for tracking, auditing, and managing organizational assets.

## 🏗️ Architecture

The platform consists of three main components:

- **Backend API** - Node.js/Express REST API with PostgreSQL/SQLite database
- **Web Application** - React.js web interface with Material-UI
- **Mobile Application** - React Native mobile app with camera and QR scanning

## 📁 Project Structure

```
audit-app/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models (Sequelize)
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   ├── utils/         # Utility functions
│   │   └── tests/         # Backend tests
│   ├── uploads/           # File upload directory
│   ├── package.json
│   └── server.js          # Entry point
├── web/               # React web application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services & auth
│   │   └── __tests__/     # Frontend tests
│   ├── public/
│   └── package.json
├── mobile/            # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   ├── android/           # Android-specific files
│   ├── ios/               # iOS-specific files
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL (optional - SQLite is used by default)
- React Native development environment (for mobile)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend will run on `http://localhost:5000` with SQLite database.

### Web Application Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The web app will run on `http://localhost:3000`.

### Mobile Application Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For Android:
   ```bash
   npm run android
   ```

4. For iOS:
   ```bash
   npm run ios
   ```

## 🔧 Configuration

### Backend Configuration

The backend uses environment variables defined in `.env`:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=audit_app
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your_jwt_secret
```

For development, the app is configured to use SQLite by default.

### Database Setup

The application will automatically:
- Create database tables on first run
- Seed initial roles (Admin, Auditor, User)
- Create a default admin user

Default admin credentials:
- Username: `admin`
- Password: `admin123`

## 📱 Features

### Core Features

- **Asset Management**: Create, update, and track assets across multiple sites
- **Site & Location Management**: Organize assets by sites and hierarchical locations
- **Movement Tracking**: Record asset transfers and location changes with GPS tracking
- **Photo Documentation**: Attach photos to assets and movements with detailed descriptions and GPS coordinates
- **QR Code Scanning**: Mobile QR/barcode scanning for quick asset lookup
- **GPS Integration**: Automatic location capture with mobile photo documentation
- **Discrepancy Reporting**: Track and resolve asset discrepancies
- **User Management**: Role-based access control
- **Audit Logging**: Complete audit trail of all actions

### Web Application Features

- Responsive Material-UI design
- Dashboard with statistics and quick actions
- Asset list with search and filtering
- Site and location management interface
- Movement management and approval workflow
- Photo gallery and upload with description editing
- GPS location tracking and display
- User and role management (Admin only)
- Audit log viewing
- Profile management

### Mobile Application Features

- Native camera integration
- QR/Barcode scanning
- Offline-capable asset viewing
- Photo capture and upload with detailed descriptions
- GPS location capture with photos
- Movement creation with location tracking
- Push notifications (planned)
- Biometric authentication (planned)

## 🧪 Testing

### Backend Tests

Run backend tests:
```bash
cd backend
npm test
```

### Web Application Tests

Run web app tests:
```bash
cd web
npm test
```

### Mobile Application Tests

Run mobile tests:
```bash
cd mobile
npm test
```

## 🔐 Authentication & Authorization

The system uses JWT-based authentication with role-based access control:

### Roles

- **Admin**: Full system access
- **Auditor**: Asset and movement management, reporting
- **User**: Basic asset viewing and movement requests

### API Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Asset Endpoints

- `GET /api/assets` - List assets
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/scan/:tag` - Scan asset by tag

### Movement Endpoints

- `GET /api/movements` - List movements
- `GET /api/movements/:id` - Get movement details
- `POST /api/movements` - Create movement
- `PUT /api/movements/:id` - Update movement

### Photo Endpoints

- `POST /api/photos/upload` - Upload photo
- `GET /api/photos/asset/:assetId` - Get asset photos
- `GET /api/photos/file/:id` - Get photo file

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Use PostgreSQL for production database
3. Configure file upload storage (AWS S3, etc.)
4. Set up SSL/HTTPS
5. Use PM2 or similar for process management

### Web Application Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure API base URL for production

### Mobile Application Deployment

1. Build release APK/IPA:
   ```bash
   npm run build:android
   npm run build:ios
   ```

2. Deploy to app stores or distribute internally

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Asset management
  - Movement tracking
  - Photo documentation
  - QR scanning
  - User management
  - Web and mobile applications

