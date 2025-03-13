# Team Formation Project
## How To Run The App

### Prerequisites

Ensure the following programs are installed on your system:

- **Docker**
- **Flyway**
- **Azure Core Tools**
- **Prisma**

---
### 1. Clone the Repository

Clone the Team Formation repository by running the following command in your terminal:

```bash
git clone https://github.com/Anand-Ramnarain-27/team-formation-project.git
```

---

### 2. Install Node Modules

Run the following command in these directories:

- **Root** directory

```bash
npm i && npm install
```

### 3. Create `.env` Files

**In the `root` directory:**
Create a `.env` file with the following:
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
```

**In the `./apps/frontend` directory:**
Create a `.env` file with:

```env
CLIENT_ID=Ov23ctYJiAt4UinW7HXi
```

**In the `./apps/backend` directory:**
Create a `.env` file with:

```env
DATABASE_URL="postgresql://admin:password@localhost:5432/team_formation"

GITHUB_CLIENT_ID='Ov23ctYJiAt4UinW7HXi'
GITHUB_CLIENT_SECRET='b632339aa8e40d6ecf50dd9214d5cc7331ab7188'
```

---

### 4. Run the Project

#### Make sure docker is open

#### Terminal 1: Backend

Run the backend:

   ```bash
   npm run backend
   ```
#### Terminal 2: Frontend

Run the frontend:

```bash
npm run frontend
```

### 5. Opening Application in browswer
1. Search for this in the terminal where you ran `npm run frontend`:
```

<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:code/, http://[::1]:code/
<i> [webpack-dev-server] On Your Network (IPv4): http://your-ip-address:code/
<i> [webpack-dev-server] Content not from webpack is served 
from 'local location of repository' directory
<i> [webpack-dev-server] 404s will fallback to '/index.html'<i> [webpack-dev-middleware] wait until bundle finished: /
```
2. ctrl + left-click on the http://localhost:code/ and this will open the application in your browser
3. Make sure the link is correct, you can copy and paste this one or click on it:

   http://localhost:4200/login
---

## How It Works

### LogIn

If you log in using a Gmail email, you will be assigned the "Admin" role. If you log in with any other email, you will be assigned the "Student" role.
