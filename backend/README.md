# Asset Audit & Reconciliation Platform - Backend

This is the backend API for the Asset Audit & Reconciliation Platform, a comprehensive system for tracking, auditing, and managing assets.

## Features

- User authentication and authorization with role-based access control
- Asset management with detailed tracking and history
- Movement tracking for asset transfers and relocations
- Photo documentation for assets and movements
- Discrepancy tracking and resolution
- Comprehensive audit logging
- RESTful API design

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Multer for file uploads

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and update with your configuration:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your database credentials and other configuration

### Database Setup

The application will automatically create the necessary tables when started. Make sure your PostgreSQL server is running and the database specified in your `.env` file exists.

### Running the Application

```
npm start
```

For development with auto-reload:
```
npm run dev
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change user password

### User Management

- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Role Management

- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create a new role
- `PUT /api/roles/:id` - Update a role
- `DELETE /api/roles/:id` - Delete a role

### Asset Management

- `GET /api/assets` - Get all assets (with pagination and filtering)
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create a new asset
- `PUT /api/assets/:id` - Update an asset
- `DELETE /api/assets/:id` - Delete an asset
- `POST /api/assets/scan/:assetTag` - Scan an asset
- `GET /api/assets/categories/list` - Get asset categories
- `GET /api/assets/locations/list` - Get asset locations

### Movement Management

- `GET /api/movements` - Get all movements
- `GET /api/movements/:id` - Get movement by ID
- `POST /api/movements` - Create a new movement request
- `PUT /api/movements/:id` - Update a movement
- `DELETE /api/movements/:id` - Delete a movement
- `GET /api/movements/types/list` - Get movement types

### Photo Management

- `POST /api/photos/upload` - Upload a photo
- `GET /api/photos/asset/:assetId` - Get photos for an asset
- `GET /api/photos/movement/:movementId` - Get photos for a movement
- `GET /api/photos/:id` - Get photo by ID
- `PUT /api/photos/:id` - Update a photo's description
- `DELETE /api/photos/:id` - Delete a photo
- `GET /api/photos/file/:id` - Serve a photo file

### Discrepancy Management

- `GET /api/discrepancies` - Get all discrepancies
- `GET /api/discrepancies/:id` - Get discrepancy by ID
- `POST /api/discrepancies` - Create a new discrepancy
- `PUT /api/discrepancies/:id` - Update a discrepancy
- `DELETE /api/discrepancies/:id` - Delete a discrepancy
- `GET /api/discrepancies/types/list` - Get discrepancy types

### Audit Logs

- `GET /api/audit-logs` - Get all audit logs
- `GET /api/audit-logs/:id` - Get audit log by ID
- `GET /api/audit-logs/entity/:entityType/:entityId` - Get audit logs for a specific entity
- `GET /api/audit-logs/user/:userId` - Get audit logs for a specific user
- `GET /api/audit-logs/actions/list` - Get audit log actions
- `GET /api/audit-logs/entity-types/list` - Get audit log entity types

## Default Users

On first run, the system creates a default admin user:

- Username: admin
- Password: admin123

**Important**: Change the default admin password immediately after first login.

## License

This project is licensed under the MIT License.