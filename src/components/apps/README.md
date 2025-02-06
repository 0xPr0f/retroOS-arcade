## RetroOS Arcade Apps

This folder features a collection of apps built for the RetroOS Arcade platform. Adding new apps is simple and straightforward!

### How to add an app

1. Duplicate the `Custom` folder, rename and structure the folder appropriately.
2. The app should be rendered in the index of your app's folder.
3. Add the app's metadata to the `appDrawer.tsx` file after exporting it from `appExports.tsx`
4. On development, configuring the apps metadata would allow it to show on the desktop menu
5. Update the `appMap.tsx` file to include the new app and icon
6. Customize and render the app as you see fit (build anything from games to utilities).
7. Efficiently manage and optimize assets and other resources in the app's folder.

### Adding API Routes

You can add server-side functionality using Next.js API routes:

Create your API endpoints in `api/apps/yourapp/` folder
Example: `api/apps/yourapp/save.ts`, `api/apps/yourapp/scores.ts`

```typescript
// api/apps/yourapp/example.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Your server-side logic here
  res.status(200).json({ message: 'Success' })
}
```

That's it! Start building your amazing RetroOS app! 🚀

Have any questions? Reach out to the team!
