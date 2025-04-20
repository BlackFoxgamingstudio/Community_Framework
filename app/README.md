# RawFuelFoods Website

A modern, responsive website for RawFuelFoods, focusing on plant-based nutrition and urban farming initiatives.

## Project Structure

```
rawfuelfoods/
├── index.html            # Home page
├── assets/
│   ├── images/          # Image files
│   └── fonts/           # Custom fonts
├── css/
│   └── styles.css       # Main stylesheet
├── js/
│   └── main.js          # Frontend JavaScript
├── config/
│   └── database.js      # Database configuration
├── server.js            # Express server
└── package.json         # Project dependencies
```

## Features

- Responsive design that works on all devices
- Mobile-friendly navigation menu
- Smooth scrolling for internal links
- Modern, clean UI with focus on readability
- Sections for Farms, Food, Health, Data Hub, and more
- PostgreSQL database integration
- RESTful API endpoints
- Blog system
- Events management

## Setup

### Frontend
1. Clone the repository
2. Open `index.html` in your web browser for static content viewing

### Backend
1. Install PostgreSQL if not already installed
2. Create a new database named 'rawfuelfoods'
3. Run the SQL schema from `build.md` to create tables
4. Install Node.js dependencies:
   ```bash
   npm install
   ```
5. Copy `.env.example` to `.env` and update with your configuration
6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- GET `/api/menu-items` - Get navigation menu items
- GET `/api/pages/:slug` - Get page content by slug
- GET `/api/events` - Get upcoming events
- GET `/api/blog-posts` - Get published blog posts
- GET `/api/blog-posts/:slug` - Get specific blog post

## Development

- HTML5 for structure
- CSS3 for styling (including Flexbox for layouts)
- Vanilla JavaScript for frontend interactivity
- Node.js/Express for backend
- PostgreSQL for database
- Mobile-first responsive design

## Contact

For any queries, please contact:
- Phone: 206.718.9951
- Email: rawfuelfoods@gmail.com 