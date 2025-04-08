class PathfindingVisualizer {
    constructor() {
      this.grid = [];
      this.gridSize = 20;
      this.gridContainer = document.getElementById('grid-container');
      this.visitedNodes = 0;
      this.pathLength = 0;
      this.isRunning = false;
      this.startPos = { x: 1, y: 1 };
      this.endPos = { x: 18, y: 18 };
      this.delay = 20;
      this.lockedMaze = null;
  
      this.generateMaze();
      this.setupEventListeners();
    }
  
    generateMaze() {
      if (this.lockedMaze) {
        this.grid = JSON.parse(JSON.stringify(this.lockedMaze));
      } else {
        this.grid = Array(this.gridSize).fill().map(() =>
          Array(this.gridSize).fill().map(() => Math.random() > 0.7 ? 1 : 0)
        );
        
        // Ensure start and end positions are clear
        this.grid[this.startPos.y][this.startPos.x] = 0;
        this.grid[this.endPos.y][this.endPos.x] = 0;
      }
      
      this.visitedNodes = 0;
      this.pathLength = 0;
      this.updateStats();
      this.render();
    }
  
    toggleMazeLock() {
      const lockBtn = document.getElementById('lock-maze');
      if (this.lockedMaze) {
        this.lockedMaze = null;
        lockBtn.classList.remove('active');
        lockBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Lock Maze
        `;
      } else {
        this.lockedMaze = JSON.parse(JSON.stringify(this.grid));
        lockBtn.classList.add('active');
        lockBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Unlock Maze
        `;
      }
    }
  
    setupEventListeners() {
      document.getElementById('generate-maze').addEventListener('click', () => this.generateMaze());
      document.getElementById('start-pathfinding').addEventListener('click', () => this.startPathfinding());
      document.getElementById('lock-maze').addEventListener('click', () => this.toggleMazeLock());
    }
  
    async startPathfinding() {
      if (this.isRunning) return;
      this.isRunning = true;
  
      const algorithm = document.querySelector('#pathfinding-card .algo-btn.active').dataset.algo;
      const startButton = document.getElementById('start-pathfinding');
      startButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        Pause
      `;
  
      this.visitedNodes = 0;
      this.pathLength = 0;
      this.updateStats();
  
      let path;
      switch (algorithm) {
        case 'bfs':
          path = await this.bfs();
          break;
        case 'dfs':
          path = await this.dfs();
          break;
        case 'dijkstra':
          path = await this.dijkstra();
          break;
        case 'astar':
          path = await this.astar();
          break;
        case 'greedy':
          path = await this.greedyBfs();
          break;
      }
  
      if (path) {
        this.pathLength = path.length;
        this.updateStats();
        await this.visualizePath(path);
      }
  
      this.isRunning = false;
      startButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Start
      `;
    }
  
    updateStats() {
      document.getElementById('visited-nodes').textContent = this.visitedNodes;
      document.getElementById('path-length').textContent = this.pathLength;
    }
  
    render() {
      this.gridContainer.innerHTML = '';
      
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          
          if (x === this.startPos.x && y === this.startPos.y) {
            cell.classList.add('start');
          } else if (x === this.endPos.x && y === this.endPos.y) {
            cell.classList.add('end');
          } else if (this.grid[y][x] === 1) {
            cell.classList.add('wall');
          }
          
          this.gridContainer.appendChild(cell);
        }
      }
    }
  
    async visualizeVisited(x, y) {
      if (x === this.startPos.x && y === this.startPos.y) return;
      if (x === this.endPos.x && y === this.endPos.y) return;
      
      const index = y * this.gridSize + x;
      const cell = this.gridContainer.children[index];
      cell.classList.add('visited');
      this.visitedNodes++;
      this.updateStats();
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
  
    async visualizePath(path) {
      for (const { x, y } of path) {
        if (x === this.startPos.x && y === this.startPos.y) continue;
        if (x === this.endPos.x && y === this.endPos.y) continue;
        
        const index = y * this.gridSize + x;
        const cell = this.gridContainer.children[index];
        cell.classList.add('path');
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
  
    isValid(x, y) {
      return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize && this.grid[y][x] !== 1;
    }
  
    // Pathfinding Algorithms
    async bfs() {
      const queue = [{ x: this.startPos.x, y: this.startPos.y, path: [] }];
      const visited = new Set();
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
      while (queue.length > 0) {
        const { x, y, path } = queue.shift();
        const key = `${x},${y}`;
  
        if (visited.has(key)) continue;
        visited.add(key);
  
        if (x === this.endPos.x && y === this.endPos.y) {
          return [...path, { x, y }];
        }
  
        await this.visualizeVisited(x, y);
  
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          
          if (this.isValid(newX, newY) && !visited.has(`${newX},${newY}`)) {
            queue.push({
              x: newX,
              y: newY,
              path: [...path, { x, y }]
            });
          }
        }
      }
  
      return null;
    }
  
    async dfs() {
      const stack = [{ x: this.startPos.x, y: this.startPos.y, path: [] }];
      const visited = new Set();
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
      while (stack.length > 0) {
        const { x, y, path } = stack.pop();
        const key = `${x},${y}`;
  
        if (visited.has(key)) continue;
        visited.add(key);
  
        if (x === this.endPos.x && y === this.endPos.y) {
          return [...path, { x, y }];
        }
  
        await this.visualizeVisited(x, y);
  
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          
          if (this.isValid(newX, newY) && !visited.has(`${newX},${newY}`)) {
            stack.push({
              x: newX,
              y: newY,
              path: [...path, { x, y }]
            });
          }
        }
      }
  
      return null;
    }
  
    manhattan(x1, y1, x2, y2) {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
  
    async dijkstra() {
      const distances = {};
      const previous = {};
      const unvisited = new Set();
      
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (this.grid[y][x] !== 1) {
            const key = `${x},${y}`;
            distances[key] = Infinity;
            unvisited.add(key);
          }
        }
      }
      
      const startKey = `${this.startPos.x},${this.startPos.y}`;
      distances[startKey] = 0;
      
      while (unvisited.size > 0) {
        let minDistance = Infinity;
        let current = null;
        
        for (const key of unvisited) {
          if (distances[key] < minDistance) {
            minDistance = distances[key];
            current = key;
          }
        }
        
        if (!current) break;
        
        const [x, y] = current.split(',').map(Number);
        if (x === this.endPos.x && y === this.endPos.y) {
          const path = [];
          let curr = current;
          while (curr) {
            const [x, y] = curr.split(',').map(Number);
            path.unshift({ x, y });
            curr = previous[curr];
          }
          return path;
        }
        
        unvisited.delete(current);
        await this.visualizeVisited(x, y);
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          const newKey = `${newX},${newY}`;
          
          if (this.isValid(newX, newY) && unvisited.has(newKey)) {
            const alt = distances[current] + 1;
            if (alt < distances[newKey]) {
              distances[newKey] = alt;
              previous[newKey] = current;
            }
          }
        }
      }
      
      return null;
    }
  
    async astar() {
      const openSet = new Set([`${this.startPos.x},${this.startPos.y}`]);
      const cameFrom = {};
      const gScore = { [`${this.startPos.x},${this.startPos.y}`]: 0 };
      const fScore = {
        [`${this.startPos.x},${this.startPos.y}`]: this.manhattan(
          this.startPos.x,
          this.startPos.y,
          this.endPos.x,
          this.endPos.y
        )
      };
  
      while (openSet.size > 0) {
        let current = null;
        let minF = Infinity;
  
        for (const pos of openSet) {
          if (fScore[pos] < minF) {
            minF = fScore[pos];
            current = pos;
          }
        }
  
        const [x, y] = current.split(',').map(Number);
  
        if (x === this.endPos.x && y === this.endPos.y) {
          const path = [];
          let curr = current;
          while (curr) {
            const [x, y] = curr.split(',').map(Number);
            path.unshift({ x, y });
            curr = cameFrom[curr];
          }
          return path;
        }
  
        openSet.delete(current);
        await this.visualizeVisited(x, y);
  
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          const neighbor = `${newX},${newY}`;
  
          if (this.isValid(newX, newY)) {
            const tentativeG = gScore[current] + 1;
  
            if (!gScore[neighbor] || tentativeG < gScore[neighbor]) {
              cameFrom[neighbor] = current;
              gScore[neighbor] = tentativeG;
              fScore[neighbor] = tentativeG + this.manhattan(newX, newY, this.endPos.x, this.endPos.y);
              openSet.add(neighbor);
            }
          }
        }
      }
  
      return null;
    }
  
    async greedyBfs() {
      const queue = [{ x: this.startPos.x, y: this.startPos.y, path: [] }];
      const visited = new Set();
  
      while (queue.length > 0) {
        queue.sort((a, b) => {
          const distA = this.manhattan(a.x, a.y, this.endPos.x, this.endPos.y);
          const distB = this.manhattan(b.x, b.y, this.endPos.x, this.endPos.y);
          return distA - distB;
        });
  
        const { x, y, path } = queue.shift();
        const key = `${x},${y}`;
  
        if (visited.has(key)) continue;
        visited.add(key);
  
        if (x === this.endPos.x && y === this.endPos.y) {
          return [...path, { x, y }];
        }
  
        await this.visualizeVisited(x, y);
  
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          
          if (this.isValid(newX, newY) && !visited.has(`${newX},${newY}`)) {
            queue.push({
              x: newX,
              y: newY,
              path: [...path, { x, y }]
            });
          }
        }
      }
  
      return null;
    }
  }
  
  // Initialize pathfinding visualizer
  const pathfindingVisualizer = new PathfindingVisualizer();