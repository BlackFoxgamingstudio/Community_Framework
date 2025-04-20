**1. Database Schema**

Using a simple relational CMS schema to store pages, menu items, and content sections.

```sql
-- Stores top-level navigation menu items
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(200) NOT NULL,
  display_order INT NOT NULL
);

-- Stores individual pages and their metadata
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores content sections for each page, allowing multiple sections per page
CREATE TABLE page_sections (
  id SERIAL PRIMARY KEY,
  page_id INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  heading VARCHAR(200),
  content TEXT NOT NULL,
  image_url VARCHAR(300),
  section_order INT NOT NULL
);

-- Stores event entries (for the Events page)
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  link VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores blog posts (for the Blog page)
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image VARCHAR(300),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores asset references (images, etc.)
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  asset_type VARCHAR(50),
  url VARCHAR(300) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

**2. File Structure**

```
rawfuelfoods/
├── index.html            # Home page
├── about.html            # About & Contact
├── farm.html             # Farms overview
├── food.html             # Eat & Drink
├── health.html           # Health & Wellness
├── data-hub.html         # Data Hub
├── communications.html   # Communications
├── networks.html         # Networks
├── blog.html             # Blog listing
├── outdoors-rx.html      # Outdoors RX
├── events.html           # Events listing
├── assets/
│   ├── images/           # Image files
│   └── fonts/            # Custom fonts (if any)
├── css/
│   └── styles.css        # Main stylesheet
└── js/
    └── main.js           # JavaScript (menu toggle, smooth scroll)
```

---

**3. HTML: `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RawFuelFoods - Plant Based Nutrition</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="logo">RawFuel<span>Foods</span></a>
      <button id="nav-toggle" class="nav-toggle">☰</button>
      <nav id="nav-menu" class="nav-menu">
        <ul>
          <li><a href="about.html">About & Contact</a></li>
          <li class="dropdown">
            <a href="farm.html" class="dropdown-toggle">Farms</a>
            <ul class="dropdown-menu">
              <li><a href="farm-locations.html">Locations</a></li>
              <li><a href="farm-products.html">Products</a></li>
              <li><a href="farm-partners.html">Partners</a></li>
            </ul>
          </li>
          <li class="dropdown">
            <a href="food.html" class="dropdown-toggle">Eat & Drink</a>
            <ul class="dropdown-menu">
              <li><a href="menu.html">Menu</a></li>
              <li><a href="recipes.html">Recipes</a></li>
              <li><a href="catering.html">Catering</a></li>
            </ul>
          </li>
          <li class="dropdown">
            <a href="health.html" class="dropdown-toggle">Health/Wellness</a>
            <ul class="dropdown-menu">
              <li><a href="nutrition.html">Nutrition</a></li>
              <li><a href="programs.html">Programs</a></li>
              <li><a href="resources.html">Resources</a></li>
            </ul>
          </li>
          <li><a href="data-hub.html">Data Hub</a></li>
          <li><a href="communications.html">Communications</a></li>
          <li><a href="networks.html">Networks</a></li>
          <li class="dropdown">
            <a href="blog.html" class="dropdown-toggle">Blog</a>
            <ul class="dropdown-menu">
              <li><a href="articles.html">Articles</a></li>
              <li><a href="news.html">News</a></li>
              <li><a href="stories.html">Stories</a></li>
            </ul>
          </li>
          <li><a href="outdoors-rx.html">Outdoors RX</a></li>
          <li><a href="events.html">Events</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="main-content">
    <section class="hero container">
      <h1>RawFuelFoods.</h1>
      <p>Plant based nutrition for health conscious &amp; curious eaters</p>
    </section>

    <section class="infofarm container">
      <h2>InfoFarm</h2>
      <p>Advancing micro to small scale city farms as economic opportunity and food security.</p>
    </section>

    <section class="features container">
      <div class="feature">
        <h3>FARMS</h3>
        <p>Learn about our urban farm initiatives and how they benefit communities.</p>
      </div>
      <div class="feature">
        <h3>EAT & DRINK</h3>
        <p>Discover plant-based foods crafted for peak nutrition and taste.</p>
      </div>
    </section>

    <section class="data-hub container">
      <h2>DATA HUB</h2>
      <p>We aggregate data on urban farming practices, productivity, resource use, and community impact.</p>
    </section>

    <section class="communications container">
      <h2>COMMUNICATIONS</h2>
      <p>Educational content including webinars, case studies, and video resources.</p>
    </section>

    <section class="networks container">
      <h2>NETWORKS</h2>
      <p>A digital community space for urban farmers to connect and collaborate.</p>
    </section>

    <footer class="site-footer container">
      <p>Call 206.718.9951 | rawfuelfoods@gmail.com</p>
    </footer>
  </main>

  <script src="js/main.js"></script>
</body>
</html>
```

---

**4. CSS: `css/styles.css`**

```css
/* Reset & Base */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { width: 90%; max-width: 1200px; margin: 0 auto; }
a { text-decoration: none; color: inherit; }

/* Header & Nav */
.site-header { background: #fff; border-bottom: 1px solid #ddd; position: sticky; top: 0; z-index: 100; }
.site-header .container { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; }
.logo { font-size: 1.5rem; font-weight: bold; }
.logo span { color: #28a745; }
.nav-toggle { display: none; font-size: 1.5rem; background: none; border: none; }
.nav-menu ul { display: flex; list-style: none; gap: 1rem; }
.nav-menu a:hover { color: #28a745; }

/* Hero */
.hero { text-align: center; padding: 4rem 0; background: #f9f9f9; }
.hero h1 { font-size: 3rem; margin-bottom: 0.5rem; }
.hero p { font-size: 1.25rem; }

/* Sections */
.infofarm, .data-hub, .communications, .networks { padding: 3rem 0; }
.infofarm h2, .data-hub h2, .communications h2, .networks h2 { font-size: 2rem; margin-bottom: 1rem; }
.features { display: flex; gap: 2rem; padding: 3rem 0; }
.feature { flex: 1; background: #fff; padding: 1.5rem; border: 1px solid #eee; border-radius: 8px; text-align: center; }
.feature h3 { margin-bottom: 1rem; color: #28a745; }

/* Footer */
.site-footer { text-align: center; padding: 2rem 0; background: #f1f1f1; margin-top: 2rem; }

/* Responsive */
@media (max-width: 768px) {
  .nav-menu ul { flex-direction: column; display: none; }
  .nav-menu ul.active { display: flex; }
  .nav-toggle { display: block; }
  .features { flex-direction: column; }
}
```

---

**5. JavaScript: `js/main.js`**

```javascript
// Toggle mobile navigation
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu').querySelector('ul');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});
```

