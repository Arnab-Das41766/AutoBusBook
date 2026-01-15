# AutoBusBook Project Setup and Run Instructions

## 1. Project Directory
Ensure you are in the root directory of the project:
`c:\Users\Arnab Das\Desktop\AutoBusBook\AutoBusBook`

## 2. Prerequisites
- Node.js (v20 or later recommended)
- npm (comes with Node.js)

## 3. Installation
Open your terminal (PowerShell, Command Prompt, or VS Code Terminal) and run:

```bash
npm install
```

## 4. Environment Configuration
Ensure you have a `.env` file in the root directory. It should contain:

```env
DATABASE_URL=file:sqlite.db
```

## 5. Database Setup
Initialize the database schema:

```bash
npm run db:push
```

## 6. Running the Application
Start the development server:

```bash
npm run dev
```

The application will start, and you can access it at `http://localhost:5000`.
