
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.site-nav');
    if (!navContainer) return;

    const menuItems = [
        { name: 'Home', path: 'index.html' },
        { name: 'News', path: 'news.html' },
        { name: 'Artifacts', path: 'artifacts-viewer.html' }
    ];

    // Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'site-nav-overlay';
    document.body.appendChild(overlay);

    // Create Sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'site-nav-sidebar';
    
    const navLinks = document.createElement('nav');
    navLinks.style.display = 'flex';
    navLinks.style.flexDirection = 'column';

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    menuItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.path;
        link.textContent = item.name;
        link.className = 'site-nav-link';
        if (currentPath === item.path) {
            link.classList.add('active');
        }
        navLinks.appendChild(link);
    });

    sidebar.appendChild(navLinks);
    document.body.appendChild(sidebar);

    // Create Toggle Button
    const toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.textContent = '☰ Menu';
    navContainer.appendChild(toggle);

    const toggleMenu = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    toggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
});
