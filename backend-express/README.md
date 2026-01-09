# CampusMarket Express Backend

This is a rewrite of the NestJS backend using **Express.js**. It maintains 100% API compatibility with the original NestJS implementation.

## Why Express.js?

The team found NestJS too complex to maintain. This Express version:
- Uses simple, readable JavaScript
- Has minimal dependencies
- Is easier for junior developers to understand
- Maintains all the same functionality

## Project Structure

```
backend-express/
├── server.js              # Entry point (replaces main.ts)
├── config/
│   └── db.js              # MySQL connection pool (replaces TypeOrmModule)
├── controllers/
│   ├── auth.controller.js    # Auth logic (replaces AuthService + AuthController)
│   └── products.controller.js # Products logic (replaces ProductsService + ProductsController)
├── middleware/
│   ├── auth.js            # JWT + Admin guards (replaces JwtAuthGuard, AdminGuard, JwtStrategy)
│   ├── validation.js      # Request validation (replaces class-validator DTOs)
│   └── upload.js          # File uploads (replaces FileInterceptor with multer)
├── routes/
│   ├── auth.routes.js     # Auth endpoints (replaces @Controller('auth'))
│   └── products.routes.js # Products endpoints (replaces @Controller('products'))
├── uploads/
│   ├── profiles/          # User profile pictures
│   └── products/          # Product images
├── seed.js                # Database seeder (replaces seed.ts)
└── package.json
```

## NestJS to Express Mapping

| NestJS Concept | Express Equivalent |
|----------------|-------------------|
| `@Controller('path')` | `express.Router()` + `app.use('/path', router)` |
| `@Get()`, `@Post()`, etc. | `router.get()`, `router.post()`, etc. |
| `@UseGuards(JwtAuthGuard)` | `authMiddleware` function |
| `@UseGuards(AdminGuard)` | `adminMiddleware` function |
| `@Body() dto` | `req.body` + validation middleware |
| `@Request() req` | `req` (user attached by auth middleware) |
| `@Param('id')` | `req.params.id` |
| `@Query('page')` | `req.query.page` |
| `@UseInterceptors(FileInterceptor)` | `multer` middleware |
| `TypeOrmModule` | `mysql2/promise` connection pool |
| `@InjectRepository(Entity)` | Direct `pool.execute()` queries |
| `ValidationPipe` + DTOs | Custom validation middleware |
| `ConflictException` | `res.status(409).json({...})` |
| `UnauthorizedException` | `res.status(401).json({...})` |
| `ForbiddenException` | `res.status(403).json({...})` |
| `NotFoundException` | `res.status(404).json({...})` |

## API Endpoints

All endpoints are identical to the NestJS version:

### Auth Routes
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login and get JWT |
| GET | `/auth/profile` | ✅ | Get current user profile |
| PATCH | `/auth/profile/picture` | ✅ | Upload profile picture |

### Products Routes
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/products` | ❌ | List products (paginated) |
| GET | `/products/:id` | ❌ | Get single product |
| POST | `/products` | ✅ | Create new listing |
| PATCH | `/products/:id` | ✅ | Update listing (owner/admin) |
| DELETE | `/products/:id` | ✅ | Delete listing (owner/admin) |
| GET | `/products/pending` | 👑 | List pending products (admin) |
| PATCH | `/products/:id/approve` | 👑 | Approve product (admin) |
| PATCH | `/products/:id/reject` | 👑 | Reject product (admin) |

## Setup

### Prerequisites
- Node.js 18+
- MySQL (via XAMPP or standalone)
- Existing `campus_market` database with tables

### Installation

```bash
cd backend-express
npm install
```

### Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=1234
DB_DATABASE=campus_market
JWT_SECRET=your_secret_key
```

### Running

Development (with auto-restart on file changes):
```bash
npm run dev
```

Production:
```bash
npm start
```

### Seeding Demo Data

```bash
npm run seed
```

## Demo Credentials

- **Regular User:** `sarah.chen@campus.edu` / `password123`
- **Admin User:** `admin@campus.edu` / `password123`

## Dependencies

| Package | Purpose | Replaces in NestJS |
|---------|---------|-------------------|
| `express` | Web framework | `@nestjs/core`, `@nestjs/platform-express` |
| `mysql2` | Database driver | `typeorm`, `@nestjs/typeorm` |
| `jsonwebtoken` | JWT handling | `@nestjs/jwt`, `passport-jwt` |
| `bcrypt` | Password hashing | Same |
| `multer` | File uploads | Same (via `@nestjs/platform-express`) |
| `cors` | CORS middleware | Built into NestJS |
| `dotenv` | Environment vars | `@nestjs/config` |

## Notes

1. **No ORM**: Uses raw SQL queries with `mysql2/promise` for simplicity and performance.

2. **Same Database**: Works with the existing database schema created by NestJS/TypeORM.

3. **Same Response Format**: All API responses match the NestJS format exactly.

4. **Same File Paths**: Uploaded files are stored in the same locations with the same naming convention.

5. **Same Validation**: Request validation mirrors class-validator behavior.
