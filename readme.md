# 🚀 Cosmic Defender

A modern, responsive space shooter game built with HTML5 Canvas, CSS3, and vanilla JavaScript. Defend your galaxy from alien invaders while collecting powerful upgrades!

![Cosmic Defender](https://img.shields.io/badge/Game-Cosmic%20Defender-00ffff?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🎮 Game Features

### Core Gameplay

- **Smooth Movement**: WASD or Arrow keys for precise control
- **Hold-to-Fire**: Hold spacebar for continuous shooting
- **Progressive Difficulty**: Enemies spawn faster as you level up
- **Lives System**: Start with 3 lives, lose one per collision
- **Score System**: Earn points by destroying enemies and collecting power-ups

### Power-Up System

- **Rapid Fire** 🔴: Increases firing rate by 70% for 8 seconds
- **Shield** 🟢: Protects from enemy collisions for 8 seconds
- **Multi Shot** 🟣: Fires 3 bullets simultaneously for 8 seconds
- **Speed Boost** 🟡: Increases movement speed by 60% for 8 seconds

### Visual Effects

- **Particle System**: Explosive effects when enemies are destroyed
- **Animated Starfield**: Scrolling background with twinkling stars
- **Glowing Effects**: Neon-style visual effects throughout
- **Smooth Animations**: 60fps gameplay with requestAnimationFrame
- **Level-Up Celebrations**: Animated messages with golden particle bursts
- **Developer Profile**: Animated profile button with pulsing glow and rainbow border

### Responsive Design

- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Touch Controls**: Dual control system - direct positioning or drag-to-move
- **Mobile Optimized**: Large canvas utilizing 80-85% of screen space
- **Adaptive UI**: Scales perfectly across all screen sizes
- **Professional Styling**: Sci-fi themed with Orbitron font

## 🎯 How to Play

### Desktop Controls

- **Movement**: WASD or Arrow Keys
- **Shoot**: Hold Spacebar
- **Pause**: ESC key

### Mobile Controls

- **Movement**: Touch where you want to go (direct) or drag to move (relative)
- **Shoot**: Touch anywhere on screen for auto-fire
- **Pause**: ESC key (if available)
- **High Sensitivity**: Responsive touch controls with dual control modes

### Game Mechanics

1. **Survive**: Avoid enemy ships or lose a life
2. **Shoot**: Destroy enemies to earn 100 points each
3. **Collect**: Grab power-ups for 50 points and special abilities
4. **Level Up**: Every 1000 points increases difficulty with celebration effects
5. **Special Rewards**: Bonus lives every 5 levels, double power-ups every 3 levels
6. **High Score**: Try to beat your personal best!

## 🚀 Quick Start

### Option 1: Direct Play

1. Download all files to a folder
2. Open `index.html` in any modern web browser
3. Click "Start Game" and enjoy!

### Option 2: Deploy to Netlify

1. Drag the entire folder to [Netlify](https://netlify.com)
2. Your game will be live instantly with a shareable URL
3. Perfect for sharing with friends!

### Option 3: Local Server

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Then visit http://localhost:8000
```

## 📁 File Structure

```
cosmic-defender/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # Game logic and mechanics
├── profile.png         # Developer profile image
├── README.md           # This file
└── CODE_EXPLANATION.md # Detailed code documentation
```

## 🛠️ Technical Specifications

### Technologies Used

- **HTML5 Canvas**: For game rendering and graphics
- **CSS3**: Modern styling with gradients, shadows, and animations
- **Vanilla JavaScript**: Pure JS with ES6+ features
- **Google Fonts**: Orbitron font for sci-fi aesthetic

### Performance Features

- **Optimized Rendering**: Efficient canvas drawing with proper clearing
- **Memory Management**: Automatic cleanup of off-screen objects
- **Smooth Animation**: 60fps with requestAnimationFrame
- **Responsive Canvas**: Dynamic sizing based on screen dimensions

### Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Easy Modifications

- **Colors**: Edit CSS variables for different themes
- **Difficulty**: Adjust spawn rates and enemy speeds in `script.js`
- **Power-ups**: Add new power-up types in the PowerUp class
- **Sounds**: Add audio files and integrate with game events

### Developer Info

The game includes a developer info modal accessible via the profile button in the top-right corner. Update the social links in `index.html` to customize.

## 🐛 Known Issues & Solutions

### Common Issues

1. **Game won't start**: Ensure all files are in the same directory
2. **Images not loading**: Check that `profile.png` exists
3. **Touch controls not working**: Make sure you're on a touch device
4. **Performance issues**: Close other browser tabs for better performance

### Troubleshooting

- **Clear browser cache** if experiencing issues
- **Check browser console** for any error messages
- **Ensure JavaScript is enabled** in your browser

## 🤝 Contributing

Feel free to fork this project and submit pull requests for:

- New power-up types
- Additional enemy patterns
- Sound effects integration
- New visual effects
- Performance optimizations

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 👨‍💻 Developer

**Abhieshek**

- GitHub: [@abhieshek11](https://github.com/abhieshek11)
- Instagram: [@abhisk02](https://www.instagram.com/abhisk02/)
- LinkedIn: [abhieshek11](https://www.linkedin.com/in/abhieshek11/)
- Email: abhieshek11@gmail.com

---

### 🌟 Enjoy the game and may the force be with you, space defender! 🌟

_Built with ❤️ and lots of ☕_
