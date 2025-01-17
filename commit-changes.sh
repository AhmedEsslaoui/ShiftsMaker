#!/bin/bash
git add components/ModernScheduleMaker.tsx types/types.ts lib/firebase.ts
git commit -m "Add auto-archive functionality with timezone support:
- Auto-archive tables 15 minutes after shift end
- Handle different timezones (UTC+2 for Egypt, UTC+1 for Morocco)
- Only archive today's tables
- Fix timezone calculations for all shift types"
git push
