document.addEventListener('DOMContentLoaded', function() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const menuBtn = document.getElementById('menuBtn');

    function closeDropdownMenu(event) {
        if (!dropdownMenu.contains(event.target) && event.target !== menuBtn) {
            dropdownMenu.classList.add('hidden');
        }
    }

    menuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', closeDropdownMenu);

    const sortOption = document.getElementById('sortOption');
    const sortOrder = document.getElementById('sortOrder');

    sortOption.addEventListener('change', applyFilters);
    sortOrder.addEventListener('change', applyFilters);

    function applyFilters() {
        const option = sortOption.value;
        const order = sortOrder.value;
    }
});
