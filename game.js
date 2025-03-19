// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SHOOTER_ROTATION_SPEED = 3; // degrees per frame
const EMAIL_SPAWN_INTERVAL = 3500; // milliseconds - increased for better spacing
const EMAIL_FALL_SPEED = 1.5; // pixels per frame
const PROJECTILE_SPEED = 8; // pixels per frame
const MIN_EMAIL_SPACING_VERTICAL = 150; // Minimum vertical space between emails
const MIN_EMAIL_SPACING_HORIZONTAL = 250; // Minimum horizontal space between emails

// Game state
let score = 0;
let missedEmails = 0;
let handledEmails = 0;
let activeWeapon = "archive";
let shooterAngle = 0;
const emails = [];
const projectiles = [];
const keys = {};
let gameRunning = true;

// DOM Elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const shooter = document.getElementById("shooter");
const scoreDisplay = document.getElementById("score");
const missedDisplay = document.getElementById("missed");
const weaponElements = document.querySelectorAll(".weapon");

// Set canvas dimensions
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Sample email data
const sampleEmails = [
  {
    sender: "Newsletter Daily",
    subject: "Your Daily News Digest",
    snippet: "Check out the latest headlines and trending stories...",
    type: "newsletter",
  },
  {
    sender: "Social Media",
    subject: "You have new notifications",
    snippet: "John and 5 others liked your post...",
    type: "personal",
  },
  {
    sender: "Amazon",
    subject: "Your order has shipped",
    snippet: "Your recent purchase is on its way...",
    type: "important",
  },
  {
    sender: "LinkedIn",
    subject: "New job opportunities for you",
    snippet: "Based on your profile, we found these jobs...",
    type: "work",
  },
  {
    sender: "Unknown Sender",
    subject: "You won a prize!!!",
    snippet: "Click here to claim your $1,000,000 prize now...",
    type: "spam",
  },
  {
    sender: "Project Team",
    subject: "Meeting reminder",
    snippet: "Don't forget our team meeting tomorrow at 10 AM...",
    type: "work",
  },
  {
    sender: "Subscription Service",
    subject: "Renew your subscription",
    snippet: "Your premium subscription is about to expire...",
    type: "important",
  },
  {
    sender: "Friend",
    subject: "Weekend plans",
    snippet: "Hey, are you free this weekend? I was thinking...",
    type: "personal",
  },
  {
    sender: "Bank",
    subject: "Your account statement",
    snippet: "Your monthly statement is now available...",
    type: "important",
  },
  {
    sender: "Marketing Team",
    subject: "HUGE SALE - 80% OFF EVERYTHING",
    snippet: "Limited time offer! Shop now before it's too late...",
    type: "spam",
  },
  {
    sender: "HR Department",
    subject: "Important Policy Update",
    snippet:
      "Please review the updated company policies by the end of the week...",
    type: "work",
  },
  {
    sender: "Twitter",
    subject: "@user mentioned you in a tweet",
    snippet: "Check out this conversation you were mentioned in...",
    type: "personal",
  },
  {
    sender: "Mom",
    subject: "Family Dinner This Weekend",
    snippet: "We're planning to have everyone over for dinner on Sunday...",
    type: "personal",
  },
  {
    sender: "Netflix",
    subject: "New shows you might like",
    snippet:
      "Based on your viewing history, we think you'll enjoy these shows...",
    type: "newsletter",
  },
  {
    sender: "Charity Organization",
    subject: "Your donation makes a difference",
    snippet: "Thank you for your recent contribution to our cause...",
    type: "important",
  },
  {
    sender: "Tech Conference",
    subject: "Early bird tickets available now",
    snippet: "Register before May 1st to get 30% off your conference pass...",
    type: "newsletter",
  },
  {
    sender: "Credit Card Company",
    subject: "Suspicious activity detected",
    snippet: "We've noticed unusual activity on your account. Please verify...",
    type: "important",
  },
  {
    sender: "Dating Site",
    subject: "Someone viewed your profile",
    snippet: "A potential match is interested in you! Click to see who...",
    type: "spam",
  },
  {
    sender: "Boss",
    subject: "Quarterly Review",
    snippet:
      "Let's schedule some time to discuss your performance this quarter...",
    type: "work",
  },
  {
    sender: "Airline",
    subject: "Your upcoming flight details",
    snippet:
      "Here's everything you need to know about your flight next week...",
    type: "important",
  },
  {
    sender: "Pharmacy",
    subject: "Your prescription is ready",
    snippet: "Your medication is ready for pickup at your local store...",
    type: "important",
  },
  {
    sender: "Unknown",
    subject: "RE: Your Request",
    snippet: "Please find attached the documents you requested...",
    type: "spam",
  },
  {
    sender: "Streaming Service",
    subject: "Your subscription will renew soon",
    snippet:
      "Your monthly subscription will automatically renew on April 1st...",
    type: "newsletter",
  },
];

// Weapon definitions
const weapons = {
  archive: {
    name: "Archive Missile",
    color: "#3498db",
    width: 10,
    height: 20,
    action: "Archived",
  },
  unsubscribe: {
    name: "Unsubscribe Laser",
    color: "#e74c3c",
    width: 5,
    height: 30,
    action: "Unsubscribed",
  },
  spam: {
    name: "Spam Bomb",
    color: "#e67e22",
    width: 15,
    height: 15,
    action: "Marked as Spam",
  },
  todo: {
    name: "To-Do Flag",
    color: "#2ecc71",
    width: 15,
    height: 15,
    action: "Added to To-Do",
  },
  reply: {
    name: "Reply Dart",
    color: "#9b59b6",
    width: 8,
    height: 15,
    action: "Replied",
  },
  forward: {
    name: "Forward Boomerang",
    color: "#f1c40f",
    width: 20,
    height: 10,
    action: "Forwarded",
  },
  snooze: {
    name: "Snooze Clock",
    color: "#34495e",
    width: 15,
    height: 15,
    action: "Snoozed",
  },
};

// Initialize the game
function init() {
  // Set initial shooter position and rotation
  shooter.style.transform = "translateX(-50%) rotate(0deg)";

  // Set initial active weapon
  setActiveWeapon("archive");
  
  // Initialize displays
  updateScore();
  updateMissedEmails();

  // Start spawning emails
  spawnEmail();

  // Start game loop
  requestAnimationFrame(gameLoop);

  // Add event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Add click listeners to weapon selection
  for (const element of weaponElements) {
    element.addEventListener("click", () => {
      setActiveWeapon(element.dataset.weapon);
    });
  }
  
  // Setup touch controls for mobile devices
  setupTouchControls();
  
  // Check if we're on a mobile device and show a message
  if (isMobileDevice()) {
    showMobileInstructions();
    handleOrientationChange();  // Check orientation immediately
  }
}

// Check if the user is on a mobile device
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Show game instructions
function showMobileInstructions() {
  const instructions = document.createElement("div");
  instructions.className = "mobile-instructions";
  
  // Different instructions based on device type
  if (isMobileDevice()) {
    instructions.innerHTML = `
      <div class="instructions-content">
        <h1 class="game-logo">Email Blaster</h1>
        <div class="by-line">by <a href="https://getinboxzero.com" target="_blank">Inbox Zero</a></div>
        <h3>Mobile Controls</h3>
        <p>• Tap a weapon name to select it</p>
        <p>• Drag finger left/right to move shooter</p>
        <p>• Tap the red FIRE button to shoot</p>
        <p>• Don't miss more than 5 emails!</p>
        <button id="close-instructions">Start Playing!</button>
      </div>
    `;
  } else {
    instructions.innerHTML = `
      <div class="instructions-content">
        <h1 class="game-logo">Email Blaster</h1>
        <div class="by-line">by <a href="https://getinboxzero.com" target="_blank">Inbox Zero</a></div>
        <h3>Keyboard Controls</h3>
        <p>• Press 1-7 to select weapons</p>
        <p>• Use LEFT/RIGHT arrows to move</p>
        <p>• Press SPACE to shoot</p>
        <p>• Don't miss more than 5 emails!</p>
        <button id="close-instructions">Start Playing!</button>
      </div>
    `;
  }
  
  document.querySelector(".game-container").appendChild(instructions);
  
  document.getElementById("close-instructions").addEventListener("click", () => {
    instructions.remove();
  });
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;

  // Clear canvas
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Update shooter rotation
  updateShooterRotation();

  // Update emails
  updateEmails();

  // Update projectiles
  updateProjectiles();

  // Check for collisions
  checkCollisions();

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Update shooter rotation based on key presses
function updateShooterRotation() {
  if (keys.ArrowLeft) {
    shooterAngle = Math.max(shooterAngle - SHOOTER_ROTATION_SPEED, -60);
  }
  if (keys.ArrowRight) {
    shooterAngle = Math.min(shooterAngle + SHOOTER_ROTATION_SPEED, 60);
  }

  shooter.style.transform = `translateX(-50%) rotate(${shooterAngle}deg)`;
}

// Update email positions
function updateEmails() {
  for (let i = emails.length - 1; i >= 0; i--) {
    const email = emails[i];
    email.y += EMAIL_FALL_SPEED;

    // Update DOM element position
    email.element.style.top = `${email.y}px`;
    email.element.style.left = `${email.x}px`;

    // Remove emails that fall off the screen
    if (email.y > GAME_HEIGHT) {
      email.element.remove();
      emails.splice(i, 1);
      // Penalty for missing an email
      score = Math.max(0, score - 5);
      updateScore();
      
      // Increment missed emails counter
      missedEmails++;
      updateMissedEmails();
      
      // Check for game over condition
      if (missedEmails >= 5) {
        gameOver();
      }
    }
  }
}

// Update projectile positions
function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    // Calculate movement based on angle
    const radians = ((projectile.angle - 90) * Math.PI) / 180;
    projectile.x += Math.cos(radians) * PROJECTILE_SPEED;
    projectile.y += Math.sin(radians) * PROJECTILE_SPEED;

    // Update DOM element position
    projectile.element.style.top = `${projectile.y}px`;
    projectile.element.style.left = `${projectile.x}px`;

    // Remove projectiles that go off screen
    if (projectile.y < 0 || projectile.x < 0 || projectile.x > GAME_WIDTH) {
      projectile.element.remove();
      projectiles.splice(i, 1);
    }
  }
}

// Check for collisions between projectiles and emails
function checkCollisions() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    for (let j = emails.length - 1; j >= 0; j--) {
      const email = emails[j];

      // Simple collision detection
      if (isColliding(projectile, email)) {
        // Handle the hit
        handleHit(projectile, email);

        // Remove the projectile
        projectile.element.remove();
        projectiles.splice(i, 1);
        break;
      }
    }
  }
}

// Check if two objects are colliding
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Handle a hit between a projectile and an email
function handleHit(projectile, email) {
  // Add hit animation class
  email.element.style.animation = "hit 0.5s forwards";

  // Remove the email after animation
  setTimeout(() => {
    email.element.remove();
    const index = emails.indexOf(email);
    if (index > -1) {
      emails.splice(index, 1);
    }
  }, 500);

  // Show action feedback
  showActionFeedback(email, weapons[projectile.type].action);

  // Update score
  score += 10;
  updateScore();
  
  // Increment handled emails counter
  handledEmails++;
}

// Show feedback when an email is hit
function showActionFeedback(email, action) {
  const feedback = document.createElement("div");
  feedback.textContent = action;
  feedback.style.position = "absolute";
  feedback.style.top = `${email.y}px`;
  feedback.style.left = `${email.x + email.width / 2}px`;
  feedback.style.transform = "translate(-50%, -50%)";
  feedback.style.color = "white";
  feedback.style.fontWeight = "bold";
  feedback.style.fontSize = "18px";
  feedback.style.textShadow = "0 0 3px black";
  feedback.style.zIndex = "3";
  feedback.style.pointerEvents = "none";

  document.querySelector(".game-container").appendChild(feedback);

  // Animate and remove
  feedback.style.animation = "fadeUp 1s forwards";
  setTimeout(() => feedback.remove(), 1000);
}

// Add fadeUp animation to stylesheet
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeUp {
        0% { opacity: 1; transform: translate(-50%, -50%); }
        100% { opacity: 0; transform: translate(-50%, -100%); }
    }
`;
document.head.appendChild(style);

// Spawn a new email
function spawnEmail() {
  if (!gameRunning) return;

  // Check if there's enough space between emails
  let canSpawn = true;
  
  // If there are emails on screen, check their positions
  if (emails.length > 0) {
    // Find the lowest email (the one closest to the top of the screen)
    const lowestEmail = emails.reduce((lowest, current) => {
      return current.y < lowest.y ? current : lowest;
    }, { y: GAME_HEIGHT });
    
    // If the lowest email is too close to the top, delay spawning
    if (lowestEmail.y < MIN_EMAIL_SPACING_VERTICAL) {
      canSpawn = false;
      // Try again after a short delay
      setTimeout(spawnEmail, 500);
      return;
    }
  }

  // If we can spawn, proceed with email creation
  if (canSpawn) {
    // Get random email data
    const emailData =
      sampleEmails[Math.floor(Math.random() * sampleEmails.length)];

    // Create email element
    const emailElement = document.createElement("div");
    emailElement.className = `email ${emailData.type}`;

    // Create email content
    const sender = document.createElement("div");
    sender.className = "sender";
    sender.textContent = emailData.sender;

    const subject = document.createElement("div");
    subject.className = "subject";
    subject.textContent = emailData.subject;

    const snippet = document.createElement("div");
    snippet.className = "snippet";
    snippet.textContent = emailData.snippet;

    emailElement.appendChild(sender);
    emailElement.appendChild(subject);
    emailElement.appendChild(snippet);

    // Position the email
    const emailWidth = 200;
    const emailHeight = 100;
    
    // Find a suitable horizontal position that's not too close to other emails
    let x;
    let attempts = 0;
    const maxAttempts = 10;
    
    let isTooClose = false;
    do {
      x = Math.random() * (GAME_WIDTH - emailWidth);
      attempts++;
      
      // Check if this position is far enough from other emails horizontally
      isTooClose = emails.some(email => {
        // Only check emails that are near the top of the screen
        if (email.y < 150) {
          const horizontalDistance = Math.abs(email.x - x);
          return horizontalDistance < MIN_EMAIL_SPACING_HORIZONTAL;
        }
        return false;
      });
      
    } while (isTooClose && attempts < maxAttempts);
    
    const y = -emailHeight;

    emailElement.style.width = `${emailWidth}px`;
    emailElement.style.height = `${emailHeight}px`;
    emailElement.style.top = `${y}px`;
    emailElement.style.left = `${x}px`;

    // Add to game container
    document.querySelector(".game-container").appendChild(emailElement);

    // Add to emails array
    emails.push({
      element: emailElement,
      x: x,
      y: y,
      width: emailWidth,
      height: emailHeight,
      type: emailData.type,
    });
  }

  // Schedule next email spawn with some randomness
  setTimeout(spawnEmail, EMAIL_SPAWN_INTERVAL * (0.8 + Math.random() * 0.4));
}

// Fire a projectile
function fireProjectile() {
  const projectileElement = document.createElement("div");
  projectileElement.className = `projectile ${activeWeapon}`;

  // Get weapon properties
  const weapon = weapons[activeWeapon];

  // Set projectile style
  projectileElement.style.width = `${weapon.width}px`;
  projectileElement.style.height = `${weapon.height}px`;
  projectileElement.style.backgroundColor = weapon.color;

  // Calculate starting position (from shooter)
  const shooterRect = shooter.getBoundingClientRect();
  const gameContainerRect = document
    .querySelector(".game-container")
    .getBoundingClientRect();

  // Position at the top of the shooter
  const x =
    shooterRect.left +
    shooterRect.width / 2 -
    gameContainerRect.left -
    weapon.width / 2;
  const y = shooterRect.top - gameContainerRect.top;

  projectileElement.style.top = `${y}px`;
  projectileElement.style.left = `${x}px`;

  // Add to game container
  document.querySelector(".game-container").appendChild(projectileElement);

  // Add to projectiles array
  projectiles.push({
    element: projectileElement,
    x: x,
    y: y,
    width: weapon.width,
    height: weapon.height,
    angle: shooterAngle,
    type: activeWeapon,
  });
}

// Set the active weapon
function setActiveWeapon(weapon) {
  activeWeapon = weapon;

  // Update UI
  for (const element of weaponElements) {
    if (element.dataset.weapon === weapon) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  }
}

// Update score display
function updateScore() {
  scoreDisplay.textContent = score;
}

// Update missed emails display
function updateMissedEmails() {
  missedDisplay.textContent = missedEmails;
}

// Game over function
function gameOver() {
  gameRunning = false;
  
  // Create game over overlay
  const gameOverOverlay = document.createElement('div');
  gameOverOverlay.className = 'game-over-overlay';
  gameOverOverlay.innerHTML = `
    <div class="game-over-content">
      <h1 class="game-logo">Email Blaster</h1>
      <div class="by-line">by <a href="https://getinboxzero.com" target="_blank">Inbox Zero</a></div>
      <h2>Game Over!</h2>
      <div class="game-stats">
        <div class="stat">
          <span class="stat-label">Emails Missed:</span>
          <span class="stat-value">${missedEmails}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Emails Handled:</span>
          <span class="stat-value">${handledEmails}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Emails:</span>
          <span class="stat-value">${missedEmails + handledEmails}</span>
        </div>
        <div class="stat highlight">
          <span class="stat-label">Final Score:</span>
          <span class="stat-value">${score}</span>
        </div>
      </div>
      <button id="restart-button">Play Again</button>
    </div>
  `;

  // Center the overlay in the viewport
  gameOverOverlay.style.position = 'fixed';
  gameOverOverlay.style.top = '0';
  gameOverOverlay.style.left = '0';
  gameOverOverlay.style.width = '100%';
  gameOverOverlay.style.height = '100%';
  
  // Add to game container and ensure it's at the top level for proper positioning
  const gameContainer = document.querySelector('.game-container');
  gameContainer.appendChild(gameOverOverlay);
  
  // Make sure the overlay is properly positioned
  gameOverOverlay.style.zIndex = '1000';
  
  // Add restart button event listener
  document.getElementById('restart-button').addEventListener('click', restartGame);
}

// Restart game function
function restartGame() {
  // Remove game over overlay
  const gameOverOverlay = document.querySelector('.game-over-overlay');
  if (gameOverOverlay) {
    gameOverOverlay.remove();
  }
  
  // Reset game state
  score = 0;
  missedEmails = 0;
  handledEmails = 0;
  shooterAngle = 0;
  activeWeapon = 'archive';
  gameRunning = true;
  
  // Clear all emails and projectiles
  for (const email of emails) {
    email.element.remove();
  }
  emails.length = 0;
  
  for (const projectile of projectiles) {
    projectile.element.remove();
  }
  projectiles.length = 0;
  
  // Reset displays
  updateScore();
  updateMissedEmails();
  
  // Reset shooter position
  shooter.style.transform = 'translateX(-50%) rotate(0deg)';
  
  // Restart game loop
  requestAnimationFrame(gameLoop);
  
  // Start spawning emails again
  spawnEmail();
}

// Handle keydown events
function handleKeyDown(e) {
  keys[e.key] = true;

  // Weapon selection with number keys
  if (e.key >= "1" && e.key <= "7") {
    const weaponIndex = Number.parseInt(e.key) - 1;
    const weaponElement = weaponElements[weaponIndex];
    if (weaponElement) {
      setActiveWeapon(weaponElement.dataset.weapon);
    }
  }

  // Fire with spacebar
  if (e.key === " ") {
    fireProjectile();
    e.preventDefault();
  }
}

// Handle keyup events
function handleKeyUp(e) {
  keys[e.key] = false;
}

// Touch controls for mobile
function setupTouchControls() {
  // Touch event for weapon selection
  for (const weapon of weaponElements) {
    weapon.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Prevent default touch behavior
      setActiveWeapon(weapon.dataset.weapon);
    });
  }

  // Touch events for shooter movement
  const gameContainer = document.querySelector(".game-container");
  let touchStartX = 0;

  gameContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  gameContainer.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling when touching the game
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    
    // Update shooter position based on touch movement
    const shooter = document.querySelector(".shooter");
    const shooterRect = shooter.getBoundingClientRect();
    const gameContainerRect = gameContainer.getBoundingClientRect();
    
    // Calculate new position ensuring the shooter stays within bounds
    let newPosition = shooterRect.left + deltaX - gameContainerRect.left;
    if (newPosition < 0) newPosition = 0;
    if (newPosition > GAME_WIDTH - shooterRect.width) newPosition = GAME_WIDTH - shooterRect.width;
    
    shooter.style.left = `${newPosition}px`;
    
    // Update touch start position for the next move
    touchStartX = touchX;
  });

  // Add fire button for mobile
  createMobileControls();
}

// Create mobile controls
function createMobileControls() {
  // Check if mobile controls already exist
  if (document.querySelector(".mobile-controls")) return;
  
  const mobileControls = document.createElement("div");
  mobileControls.className = "mobile-controls";
  
  // Only show mobile controls on mobile devices
  if (!isMobileDevice()) {
    mobileControls.style.display = "none";
  }
  
  const fireButton = document.createElement("button");
  fireButton.id = "mobile-fire-button";
  fireButton.textContent = "FIRE";
  
  // Add both touch and click events for the fire button
  fireButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (gameRunning) {
      fireProjectile();
    }
  });
  
  // Also add click event for desktop testing
  fireButton.addEventListener("click", () => {
    if (gameRunning) {
      fireProjectile();
    }
  });
  
  mobileControls.appendChild(fireButton);
  document.querySelector(".game-container").appendChild(mobileControls);
}

// Handle orientation changes on mobile
function handleOrientationChange() {
  if (isMobileDevice()) {
    // Check if we're in landscape mode
    if (window.innerWidth > window.innerHeight) {
      // Show landscape warning if not already present
      if (!document.querySelector('.landscape-warning')) {
        const warning = document.createElement('div');
        warning.className = 'landscape-warning';
        warning.innerHTML = `
          <div class="warning-content">
            <h3>Please Rotate Your Device</h3>
            <p>This game works best in portrait mode.</p>
            <div class="rotate-icon"></div>
          </div>
        `;
        document.body.appendChild(warning);
      }
    } else {
      // Remove landscape warning if it exists
      const warning = document.querySelector('.landscape-warning');
      if (warning) {
        warning.remove();
      }
    }
  }
}

// Start the game when the page loads
window.addEventListener("load", init);

// Listen for orientation changes
window.addEventListener("resize", handleOrientationChange);
