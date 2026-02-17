---
description: Standard development workflow for building, committing, and pushing changes
---

// turbo-all

1. Build the project:
```
npx next build 2>&1 | Select-Object -Last 15
```

2. Stage all changes:
```
git add -A
```

3. Commit with a descriptive message:
```
git commit -m "<message>"
```

4. Push to main:
```
git push origin main
```
