function initNav() {
 document.querySelectorAll('.site-nav').forEach(nav => {
 const currentPage = window.location.pathname.split('/').pop();
 const links = [
 { href: 'rrmnhc_coming_soon.html', label: 'Home' },
 { href: 'rrmnhc_news.html', label: 'News' },
 { href: 'artifacts-viewer.html', label: 'Artifacts' },
 { href: 'rrmnhc_coming_soon.html#contact', label: 'Contact Us' }
 ];
 nav.innerHTML = `
 <a href="${links[0].href}" class="cinzel font-bold text-xs tracking-widest text-red-800 nav-brand">RRMNHC</a>
 <div class="flex gap-8 text-xs uppercase tracking-widest font-medium opacity-70 nav-links">
 ${links.map(l => {
 const isActive = currentPage === l.href;
 return `<a href="${l.href}" class="nav-link hover:text-red-800 transition-colors${isActive ? ' text-red-800 font-bold' : ''}">${l.label}</a>`;
 }).join('')}
 </div>
 `;
 });
}