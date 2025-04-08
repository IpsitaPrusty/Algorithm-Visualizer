// Tab switching logic
const tabButtons = document.querySelectorAll('.tab-btn');
const sortingCard = document.getElementById('sorting-card');
const pathfindingCard = document.getElementById('pathfinding-card');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    if (button.dataset.tab === 'sorting') {
      sortingCard.classList.remove('hidden');
      pathfindingCard.classList.add('hidden');
    } else {
      sortingCard.classList.add('hidden');
      pathfindingCard.classList.remove('hidden');
    }
  });
});

// Algorithm selection logic
const algoButtons = document.querySelectorAll('.algo-btn');

algoButtons.forEach(button => {
  button.addEventListener('click', () => {
    const parent = button.closest('.algorithm-card');
    parent.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});