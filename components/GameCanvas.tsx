"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface GameCanvasProps {
    level: number;
    onLevelComplete: (score: number) => void;
    isPaused: boolean;
}

export default function GameCanvas({ level, onLevelComplete, isPaused }: GameCanvasProps) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        class GameScene extends Phaser.Scene {
            private bubbles: (Phaser.GameObjects.Sprite | null)[][] = [];
            private shooter: Phaser.GameObjects.Sprite | null = null;
            private nextBubble: Phaser.GameObjects.Sprite | null = null;
            private bullet: Phaser.Physics.Arcade.Sprite | null = null;
            private arrow: Phaser.GameObjects.Graphics | null = null;

            private readonly BUBBLE_RADIUS = 20;
            private readonly GRID_ROWS = 12;
            private readonly GRID_COLS = 10; // For even rows
            private readonly COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

            private score = 0;
            private scoreText: Phaser.GameObjects.Text | null = null;
            private isShooting = false;

            constructor() {
                super({ key: 'GameScene' });
            }

            preload() {
                // Generate bubble textures using Graphics
                const graphics = this.make.graphics({ x: 0, y: 0 });

                this.COLORS.forEach((color, index) => {
                    graphics.clear();
                    graphics.fillStyle(color, 1);
                    graphics.fillCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, this.BUBBLE_RADIUS);

                    // Add a shine effect
                    graphics.fillStyle(0xffffff, 0.4);
                    graphics.fillCircle(this.BUBBLE_RADIUS - 5, this.BUBBLE_RADIUS - 5, 5);

                    graphics.generateTexture(`bubble_${index}`, this.BUBBLE_RADIUS * 2, this.BUBBLE_RADIUS * 2);
                });
            }

            create() {
                // Background
                this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

                // Physics bounds
                this.physics.world.setBounds(0, 0, 800, 600);

                // Initialize Grid
                this.createGrid();

                // Shooter Setup
                this.createShooter();

                // Input
                this.input.on('pointerdown', this.shoot, this);
                this.input.on('pointermove', this.updateArrow, this);

                // Score
                this.scoreText = this.add.text(10, 560, `Score: ${this.score}`, {
                    fontSize: '24px',
                    color: '#ffffff',
                    fontFamily: 'Orbitron'
                });

                // Arrow
                this.arrow = this.add.graphics();
            }

            update() {
                if (this.bullet && this.bullet.active) {
                    // Check collision with walls
                    if (this.bullet.x <= this.BUBBLE_RADIUS || this.bullet.x >= 800 - this.BUBBLE_RADIUS) {
                        this.bullet.setVelocityX(-this.bullet.body!.velocity.x);
                    }

                    // Check collision with top
                    if (this.bullet.y <= this.BUBBLE_RADIUS) {
                        this.snapBubble();
                    }

                    // Check collision with other bubbles
                    // Simple distance check for now (can be optimized with quadtree or grid lookup)
                    for (let r = 0; r < this.GRID_ROWS; r++) {
                        for (let c = 0; c < this.bubbles[r].length; c++) {
                            const bubble = this.bubbles[r][c];
                            if (bubble && bubble.visible) {
                                const dist = Phaser.Math.Distance.Between(this.bullet.x, this.bullet.y, bubble.x, bubble.y);
                                if (dist < this.BUBBLE_RADIUS * 2 - 5) { // -5 for some overlap forgiveness
                                    this.snapBubble();
                                    return;
                                }
                            }
                        }
                    }
                }
            }

            private createGrid() {
                // Clear existing
                this.bubbles = Array(this.GRID_ROWS).fill(null).map(() => Array(this.GRID_COLS).fill(null));

                // Fill top rows based on level
                const rowsToFill = Math.min(3 + Math.floor(level / 2), this.GRID_ROWS - 4);

                for (let r = 0; r < rowsToFill; r++) {
                    const cols = r % 2 === 0 ? this.GRID_COLS : this.GRID_COLS - 1;
                    const offsetX = r % 2 === 0 ? this.BUBBLE_RADIUS : this.BUBBLE_RADIUS * 2;

                    for (let c = 0; c < cols; c++) {
                        const colorIdx = Phaser.Math.Between(0, this.COLORS.length - 1);
                        const x = offsetX + c * (this.BUBBLE_RADIUS * 2) + (800 - (this.GRID_COLS * this.BUBBLE_RADIUS * 2)) / 2;
                        const y = this.BUBBLE_RADIUS + r * (this.BUBBLE_RADIUS * 1.732); // Hex height

                        const bubble = this.add.sprite(x, y, `bubble_${colorIdx}`);
                        bubble.setData('color', colorIdx);
                        this.bubbles[r][c] = bubble;
                    }
                }
            }

            private createShooter() {
                const centerX = 400;
                const bottomY = 550;

                // Current bubble to shoot
                const colorIdx = Phaser.Math.Between(0, this.COLORS.length - 1);
                this.shooter = this.add.sprite(centerX, bottomY, `bubble_${colorIdx}`);
                this.shooter.setData('color', colorIdx);

                // Next bubble preview
                const nextColorIdx = Phaser.Math.Between(0, this.COLORS.length - 1);
                this.nextBubble = this.add.sprite(centerX + 100, bottomY, `bubble_${nextColorIdx}`);
                this.nextBubble.setData('color', nextColorIdx);
                this.nextBubble.setScale(0.8);
                this.add.text(centerX + 80, bottomY + 30, 'NEXT', { fontSize: '12px', fontFamily: 'Orbitron' });
            }

            private updateArrow(pointer: Phaser.Input.Pointer) {
                if (this.isShooting || !this.shooter || !this.arrow) return;

                const angle = Phaser.Math.Angle.Between(this.shooter.x, this.shooter.y, pointer.x, pointer.y);

                // Limit angle to avoid shooting too flat
                if (angle > -0.2 || angle < -2.9) return;

                this.arrow.clear();
                this.arrow.lineStyle(2, 0xffffff, 0.5);
                this.arrow.beginPath();
                this.arrow.moveTo(this.shooter.x, this.shooter.y);
                this.arrow.lineTo(this.shooter.x + Math.cos(angle) * 100, this.shooter.y + Math.sin(angle) * 100);
                this.arrow.strokePath();
            }

            private shoot(pointer: Phaser.Input.Pointer) {
                if (this.isShooting || !this.shooter) return;

                const angle = Phaser.Math.Angle.Between(this.shooter.x, this.shooter.y, pointer.x, pointer.y);
                if (angle > -0.2 || angle < -2.9) return; // Constraint shooting angle

                this.isShooting = true;

                // Create physics body for the bullet
                this.bullet = this.physics.add.sprite(this.shooter.x, this.shooter.y, this.shooter.texture.key);
                this.bullet.setData('color', this.shooter.getData('color'));
                this.bullet.setCollideWorldBounds(true);
                this.bullet.setBounce(1);

                // Calculate velocity
                const speed = 800;
                this.bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

                // Hide shooter bubble temporarily
                this.shooter.setVisible(false);
                if (this.arrow) this.arrow.clear();
            }

            private snapBubble() {
                if (!this.bullet) return;

                this.bullet.setVelocity(0, 0);
                const x = this.bullet.x;
                const y = this.bullet.y;
                const color = this.bullet.getData('color');

                // Find nearest grid position
                // This is a simplified grid mapping
                const gridWidth = (800 - (this.GRID_COLS * this.BUBBLE_RADIUS * 2)) / 2;
                const rowHeight = this.BUBBLE_RADIUS * 1.732;

                let r = Math.round((y - this.BUBBLE_RADIUS) / rowHeight);
                if (r < 0) r = 0;
                if (r >= this.GRID_ROWS) r = this.GRID_ROWS - 1;

                const isEvenRow = r % 2 === 0;
                const offsetX = isEvenRow ? this.BUBBLE_RADIUS : this.BUBBLE_RADIUS * 2;
                const effectiveX = x - gridWidth - offsetX + this.BUBBLE_RADIUS;

                let c = Math.round(effectiveX / (this.BUBBLE_RADIUS * 2));
                const maxCols = isEvenRow ? this.GRID_COLS : this.GRID_COLS - 1;
                if (c < 0) c = 0;
                if (c >= maxCols) c = maxCols - 1;

                // If spot is taken, try to find nearest open spot (simple BFS or check neighbors could go here)
                // For this prototype, we just overwrite or stop if taken (improved logic needed for real game)
                if (this.bubbles[r][c]) {
                    // Very basic collision resolution: just place it where it is roughly
                    // In a real game, you'd calculate the exact neighbor position based on impact angle
                }

                // Place bubble
                const finalX = gridWidth + offsetX + c * (this.BUBBLE_RADIUS * 2);
                const finalY = this.BUBBLE_RADIUS + r * rowHeight;

                const newBubble = this.add.sprite(finalX, finalY, `bubble_${color}`);
                newBubble.setData('color', color);
                this.bubbles[r][c] = newBubble;

                // Destroy bullet
                this.bullet.destroy();
                this.bullet = null;

                // Check matches
                this.checkMatches(r, c, color);

                // Reset shooter
                this.resetShooter();
            }

            private checkMatches(startR: number, startC: number, color: number) {
                const visited = new Set<string>();
                const matches: { r: number, c: number }[] = [];
                const queue: { r: number, c: number }[] = [{ r: startR, c: startC }];

                visited.add(`${startR},${startC}`);
                matches.push({ r: startR, c: startC });

                while (queue.length > 0) {
                    const { r, c } = queue.shift()!;
                    const neighbors = this.getNeighbors(r, c);

                    for (const n of neighbors) {
                        const key = `${n.r},${n.c}`;
                        if (!visited.has(key)) {
                            const bubble = this.bubbles[n.r][n.c];
                            if (bubble && bubble.getData('color') === color) {
                                visited.add(key);
                                matches.push(n);
                                queue.push(n);
                            }
                        }
                    }
                }

                if (matches.length >= 3) {
                    // Pop bubbles
                    matches.forEach(m => {
                        const bubble = this.bubbles[m.r][m.c];
                        if (bubble) {
                            // Animation
                            this.tweens.add({
                                targets: bubble,
                                scale: 0,
                                duration: 200,
                                onComplete: () => {
                                    bubble.destroy();
                                }
                            });
                            this.bubbles[m.r][m.c] = null;
                        }
                    });

                    // Update score
                    this.score += matches.length * 10;
                    if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);

                    // Check for floating bubbles (orphans)
                    this.removeOrphans();

                    // Check win condition
                    if (this.isLevelClear()) {
                        onLevelComplete(this.score);
                    }
                }
            }

            private getNeighbors(r: number, c: number) {
                const neighbors: { r: number, c: number }[] = [];
                const isEven = r % 2 === 0;

                // Directions: [dr, dc]
                // For even rows: TL(-1, -1), TR(-1, 0), L(0, -1), R(0, 1), BL(1, -1), BR(1, 0)
                // For odd rows: TL(-1, 0), TR(-1, 1), L(0, -1), R(0, 1), BL(1, 0), BR(1, 1)

                const offsets = isEven ?
                    [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] :
                    [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];

                for (const [dr, dc] of offsets) {
                    const nr = r + dr;
                    const nc = c + dc;

                    if (nr >= 0 && nr < this.GRID_ROWS) {
                        const maxCols = nr % 2 === 0 ? this.GRID_COLS : this.GRID_COLS - 1;
                        if (nc >= 0 && nc < maxCols) {
                            neighbors.push({ r: nr, c: nc });
                        }
                    }
                }

                return neighbors;
            }

            private removeOrphans() {
                // BFS from top row to find all connected bubbles
                const connected = new Set<string>();
                const queue: { r: number, c: number }[] = [];

                // Add all bubbles in top row
                for (let c = 0; c < this.GRID_COLS; c++) {
                    if (this.bubbles[0][c]) {
                        queue.push({ r: 0, c });
                        connected.add(`0,${c}`);
                    }
                }

                while (queue.length > 0) {
                    const { r, c } = queue.shift()!;
                    const neighbors = this.getNeighbors(r, c);

                    for (const n of neighbors) {
                        const key = `${n.r},${n.c}`;
                        if (!connected.has(key) && this.bubbles[n.r][n.c]) {
                            connected.add(key);
                            queue.push(n);
                        }
                    }
                }

                // Remove any bubble not in connected set
                for (let r = 0; r < this.GRID_ROWS; r++) {
                    for (let c = 0; c < this.bubbles[r].length; c++) {
                        if (this.bubbles[r][c] && !connected.has(`${r},${c}`)) {
                            const bubble = this.bubbles[r][c];
                            // Drop animation
                            this.tweens.add({
                                targets: bubble,
                                y: 600,
                                alpha: 0,
                                duration: 500,
                                onComplete: () => {
                                    bubble.destroy();
                                }
                            });
                            this.bubbles[r][c] = null;
                            this.score += 20; // Bonus for dropping
                        }
                    }
                }
                if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);
            }

            private isLevelClear() {
                for (let r = 0; r < this.GRID_ROWS; r++) {
                    for (let c = 0; c < this.bubbles[r].length; c++) {
                        if (this.bubbles[r][c]) return false;
                    }
                }
                return true;
            }

            private resetShooter() {
                if (!this.shooter || !this.nextBubble) return;

                // Move next bubble to shooter position
                const nextColor = this.nextBubble.getData('color');
                this.shooter.setTexture(`bubble_${nextColor}`);
                this.shooter.setData('color', nextColor);
                this.shooter.setVisible(true);

                // Generate new next bubble
                const newColor = Phaser.Math.Between(0, this.COLORS.length - 1);
                this.nextBubble.setTexture(`bubble_${newColor}`);
                this.nextBubble.setData('color', newColor);

                this.isShooting = false;
            }
        }

        // Game configuration
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            width: 800,
            height: 600,
            backgroundColor: '#1a1a2e',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false,
                },
            },
            scene: GameScene,
        };

        // Initialize game
        gameRef.current = new Phaser.Game(config);

        // Cleanup
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [level, onLevelComplete]);

    // Handle pause
    useEffect(() => {
        if (gameRef.current) {
            const scene = gameRef.current.scene.getScene('GameScene');
            if (scene) {
                if (isPaused) {
                    scene.scene.pause();
                } else {
                    scene.scene.resume();
                }
            }
        }
    }, [isPaused]);

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className="rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-400/50"
                style={{ width: '800px', height: '600px' }}
            />
        </div>
    );
}
