function initNav() {
  // 1. Inject CSS for the Hamburger Menu (so it works on every page without manual CSS edits)
  const style = document.createElement('style');
  style.textContent = `
    #sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      z-index: 150;
    }
    #sidebar {
      position: fixed;
      top: 0;
      left: -300px;
      width: 300px;
      height: 100%;
      background: #fdfcf9;
      border-right: 1px solid rgba(139,0,0,0.1);
      z-index: 160;
      transition: transform 0.3s ease;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      box-shadow: 10px 0 30px rgba(0,0,0,0.05);
    }
    #sidebar.open {
      transform: translateX(300px);
    }
    .sidebar-link {
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      letter-spacing: 0.15em;
      color: #2c2c2c;
      text-decoration: none;
      padding: 1.2rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      text-transform: uppercase;
      transition: color 0.2s ease;
    }
    .sidebar-link:hover {
      color: #8b0000;
    }
    .menu-toggle {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 170;
      background: #8b0000;
      color: white;
      padding: 0.6rem 1.2rem;
      font-family: 'Cinzel', serif;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      cursor: pointer;
      border: none;
      box-shadow: 0 4px 12px rgba(139,0,0,0.2);
      transition: background 0.2s;
    }
    .menu-toggle:hover {
      background: #a00000;
    }
  `;
  document.head.appendChild(style);

  // 2. Define the toggle function globally
  window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    } else {
      sidebar.classList.add('open');
      overlay.style.display = 'block';
    }
  };

  // 3. Inject the HTML structure into every .site-nav element
  document.querySelectorAll('.site-nav').forEach(nav => {
    const links = [
      { href: 'index.html', label: 'Home' },
      { href: 'news.html', label: 'News' },
      { href: 'artifacts-viewer.html', label: 'Artifacts' },
      { href: 'contact.html', label: 'Contact' }
    ];

    nav.innerHTML = `
      <button class="menu-toggle" onclick="toggleSidebar()">☰ MENU</button>
      <div id="sidebar-overlay" onclick="toggleSidebar()"></div>
      <nav id="sidebar">
        <h2 class="cinzel text-sm text-red-800 mb-8 opacity-60 uppercase tracking-widest" style="font-family: 'Cinzel', serif; color: #8b0000; font-size: 0.875rem; margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Navigation</h2>
        ${links.map(l => `<a href="${l.href}" class="sidebar-link">${l.label}</a>`).join('')}
      </nav>
    `;
  });
}
