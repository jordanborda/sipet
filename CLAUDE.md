# SIPeT Project Memory

## Project: Information System for Thesis Projects (SIPeT)

### General Project Information
- **Name**: SIPeT (Sistema de Información para Proyectos de Tesis)
- **Technology Stack**: Next.js + TypeScript + Tailwind CSS
- **Database**: Supabase
- **UI Components**: Radix UI + Lucide React (icons)
- **Package Manager**: pnpm
- **Location**: `/home/jordan/Documents/Software/SIPeT/sipet/`

### System Roles Structure
- **Tesista**: Students working on their theses
- **Docente**: Supervising professors
- **Coordinador**: Academic coordinators
- **Administrator**: System administrators (recently added)

### Supabase MCP Configuration

#### Configuration File: `.mcp.json`
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=oydittvsdhggwfzxlnib"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_bfa2cdbd0d46ca103c9d23c2da235294a0fcd194"
      }
    }
  }
}
```

#### Supabase Credentials
- **Project Reference**: `oydittvsdhggwfzxlnib`
- **Supabase URL**: `https://oydittvsdhggwfzxlnib.supabase.co`
- **Access Token**: `sbp_bfa2cdbd0d46ca103c9d23c2da235294a0fcd194`

### MCP Connection Process with Supabase

#### Steps to Establish Correct Connection:

1. **Verify MCP Configuration**
   ```bash
   # Verify that .mcp.json exists and is properly configured
   cat /home/jordan/Documents/Software/SIPeT/sipet/.mcp.json
   ```

2. **Use Claude Code Task Tool for MCP**
   - **DO NOT use direct bash commands** with MCP server
   - Supabase MCP server is designed to work through Claude Code
   - Use the `Task` tool with `subagent_type: "general-purpose"`

3. **Example of Successful Connection**:
   ```
   Task tool parameters:
   - description: "Execute Supabase MCP operations"
   - prompt: "Connect to Supabase database with project reference oydittvsdhggwfzxlnib and execute [specific operation]"
   - subagent_type: "general-purpose"
   ```

#### Successful MCP Operations Performed:

**✅ Administrator Column Creation (2025-08-05)**
- **Operation**: `ALTER TABLE users ADD COLUMN is_administrator BOOLEAN DEFAULT FALSE;`
- **Table**: `users`
- **Type**: `BOOLEAN`
- **Default Value**: `FALSE`
- **Status**: Successfully implemented
- **Existing Users**: 3 (all with `is_administrator = false` by default)

### Database Schema

#### `users` Table (Primary)
- **Total columns**: 62
- **Main fields**:
  - `id`, `auth_user_id`, `email`, `phone`
  - `first_name`, `last_name`, `full_name`, `display_name`
  - `provider`, `last_sign_in_at`, `sign_in_count`
  - `student_id`, `student_status`, `academic_level`, `major`
  - `notification_preferences`, `privacy_settings`, `app_preferences`
  - `is_administrator` (NEW - added 2025-08-05)
  - `created_at`, `updated_at`, `deleted_at`

#### `user_stats` Table
- User statistics

### Development Scripts
```json
"scripts": {
  "dev": "next dev",
  "build": "next build", 
  "start": "next start",
  "lint": "next lint"
}
```

### Key Project Files
- **Supabase Configuration**: `/lib/supabase.ts`
- **Utilities**: `/lib/utils.ts`
- **Middleware**: `/middleware.ts`
- **Main Pages**: 
  - `/pages/dashboard.tsx`
  - `/pages/admin.tsx`
  - `/pages/tesista.tsx`
  - `/pages/docente.tsx`
  - `/pages/coordinador.tsx`

### Recommended Next Steps

1. **Update TypeScript Interfaces**
   - Add `is_administrator: boolean` to user interfaces
   - Update queries in `/lib/supabase.ts`

2. **Implement Administrator Logic**
   - Modify `/pages/dashboard.tsx` to handle administrators
   - Integrate with existing `/pages/admin.tsx`

3. **Testing**
   - Test new column with test users
   - Verify permissions and access by role

### Utility Commands
```bash
# Navigate to project
cd /home/jordan/Documents/Software/SIPeT/sipet/

# Install dependencies
pnpm install

# Run in development
pnpm dev

# Verify MCP configuration
cat .mcp.json
```

### Claude Code Custom Commands

#### Database Analysis Command: `/db-analyze`
**Location**: `.claude/commands/db-analyze.md`
**Purpose**: Complete database schema analysis and preparation for operations

**Usage**: `/db-analyze`
**Description**: Analyzes the Supabase database schema comprehensively and prepares for user operations like creating tables, editing, deleting, making APIs, etc.

---
**Last Updated**: 2025-08-05
**Status**: Administrator column successfully implemented