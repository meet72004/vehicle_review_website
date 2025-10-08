# Setup Instructions

## Database Setup

The app now includes a Review system that requires database migration. Follow these steps:

### 1. Update Database Schema

Run the following commands to update your database with the new Review model:

```bash
# Push the schema changes to your database
npm run db:push

# Generate the Prisma client
npm run db:generate
```

Or run both at once:

```bash
npm run db:migrate
```

### 2. Test Database Connection

Test if the database is working properly:

```bash
npm run test-db
```

### 3. Start the Development Server

```bash
npm run dev
```

## Troubleshooting

### Review Submission Issues

If you're getting "Failed to submit" errors:

1. **Check Database Connection**: Make sure your `DATABASE_URL` in `.env.local` is correct
2. **Run Migration**: Ensure you've run `npm run db:migrate`
3. **Check Console**: Look at browser console and server logs for detailed error messages
4. **Test API**: Visit `/api/test-db` to verify database connectivity

### Theme Toggle Issues

If the theme toggle isn't working:

1. **Clear Browser Cache**: Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. **Check Console**: Look for any JavaScript errors
3. **Verify Classes**: The theme should add/remove `dark` class from `<html>` and `<body>` elements

## New Features Added

### 🌟 Review System

- Star ratings (1-5 stars)
- Text comments
- Review history in sidebar
- Average ratings display on car cards

### 🎨 Theme Toggle

- Light/Dark mode toggle
- Persistent theme preference
- Smooth transitions

### 📱 Enhanced UI

- Better responsive design
- Improved loading states
- Error handling and validation
