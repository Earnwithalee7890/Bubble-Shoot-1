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
    const onLevelCompleteRef = useRef(onLevelComplete);

    useEffect(() => {
        onLevelCompleteRef.current = onLevelComplete;
    }, [onLevelComplete]);

    useEffect(() => {
        if (!containerRef.current) return;

        class GameScene extends Phaser.Scene {
            private bubbles: (Phaser.GameObjects.Sprite | null)[][] = [];
            private shooter: Phaser.GameObjects.Sprite | null = null;
            private nextBubble: Phaser.GameObjects.Sprite | null = null;
            private bullet: Phaser.Physics.Arcade.Sprite | null = null;
            private arrow: Phaser.GameObjects.Graphics | null = null;
            private bulletCleanupTimer: Phaser.Time.TimerEvent | null = null;
            private isSnapping: boolean = false;

            // Mobile Portrait Settings
            private readonly GAME_WIDTH = 360;
            private readonly GAME_HEIGHT = 640;
            private readonly BUBBLE_RADIUS = 20;
            private readonly GRID_ROWS = 14;
            private readonly GRID_COLS = 8;
            private readonly COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

            private score = 0;
            private scoreText: Phaser.GameObjects.Text | null = null;
            private isShooting = false;
            private isAiming = false;

            constructor() {
                super({ key: 'GameScene' });
            }

            preload() {
                const graphics = this.make.graphics({ x: 0, y: 0 });

                this.COLORS.forEach((color, index) => {
                    graphics.clear();

                    // Different designs based on level
                    if (level % 3 === 1) {
                        // Design 1: Glossy (Standard)
                        graphics.fillStyle(color, 1);
                        graphics.fillCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, this.BUBBLE_RADIUS);
                        graphics.fillStyle(0x000000, 0.2);
                        graphics.fillCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS + 2, this.BUBBLE_RADIUS - 2);
                        graphics.fillStyle(0xffffff, 0.6);
                        graphics.fillCircle(this.BUBBLE_RADIUS - 6, this.BUBBLE_RADIUS - 6, 6);
                    } else if (level % 3 === 2) {
                        // Design 2: Matte / Solid with Ring
                        graphics.fillStyle(color, 1);
                        graphics.fillCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, this.BUBBLE_RADIUS);
                        graphics.lineStyle(2, 0xffffff, 0.5);
                        graphics.strokeCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, this.BUBBLE_RADIUS - 2);
                    } else {
                        // Design 3: Neon / Metallic
                        graphics.fillStyle(color, 0.8);
                        graphics.fillCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, this.BUBBLE_RADIUS);
                        graphics.fillStyle(0xffffff, 0.8);
                        graphics.fillCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, 5); // Center dot
                        graphics.lineStyle(2, color, 1);
                        graphics.strokeCircle(this.BUBBLE_RADIUS, this.BUBBLE_RADIUS, this.BUBBLE_RADIUS);
                    }

                    graphics.generateTexture(`bubble_${index}`, this.BUBBLE_RADIUS * 2, this.BUBBLE_RADIUS * 2);
                });
            }

            create() {
                // Dynamic Background based on level
                const bgColors = [0x1e293b, 0x2e1065, 0x172554, 0x312e81, 0x4c1d95];
                const bgColor = bgColors[(level - 1) % bgColors.length];

                this.add.rectangle(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, this.GAME_WIDTH, this.GAME_HEIGHT, bgColor);
                this.physics.world.setBounds(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

                this.createGrid();
                this.createShooter();

                this.input.on('pointerdown', this.handlePointerDown, this);
                this.input.on('pointermove', this.handlePointerMove, this);
                this.input.on('pointerup', this.handlePointerUp, this);

                this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
                    fontSize: '20px',
                    color: '#ffffff',
                    fontFamily: 'Orbitron'
                });

                this.add.text(this.GAME_WIDTH / 2, this.GAME_HEIGHT - 100, 'Drag & Release', {
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'Inter'
                }).setOrigin(0.5).setAlpha(0.5);

                this.arrow = this.add.graphics();
            }

            private handlePointerDown(pointer: Phaser.Input.Pointer) {
                if (this.isShooting || !this.shooter) return;
                this.isAiming = true;
            }

            private handlePointerMove(pointer: Phaser.Input.Pointer) {
                if (!this.isAiming || !this.shooter || !this.arrow) return;

                const angle = Phaser.Math.Angle.Between(this.shooter.x, this.shooter.y, pointer.x, pointer.y);
                if (angle > 0.1 && angle < 3.0) return;

                this.arrow.clear();
                this.arrow.lineStyle(4, 0xffffff, 0.5);
                this.arrow.beginPath();
                this.arrow.moveTo(this.shooter.x, this.shooter.y);
                this.arrow.lineTo(this.shooter.x + Math.cos(angle) * 100, this.shooter.y + Math.sin(angle) * 100);
                this.arrow.strokePath();
            }

            private handlePointerUp(pointer: Phaser.Input.Pointer) {
                if (!this.isAiming) return;
                this.isAiming = false;
                if (this.arrow) this.arrow.clear();

                if (this.isShooting || !this.shooter) return;

                const angle = Phaser.Math.Angle.Between(this.shooter.x, this.shooter.y, pointer.x, pointer.y);
                if (angle > 0.1 && angle < 3.0) return;

                this.shoot(angle);
            }

            private wallHitEffect(x: number, y: number) {
                // Glitch / Shake effect
                this.cameras.main.shake(100, 0.01);

                // Particle burst
                const particles = this.add.particles(x, y, `bubble_${this.bullet?.getData('color') || 0}`, {
                    speed: { min: 50, max: 150 },
                    scale: { start: 0.2, end: 0 },
                    lifespan: 300,
                    quantity: 5,
                    blendMode: 'ADD'
                });
                this.time.delayedCall(300, () => particles.destroy());
            }

            update() {
                if (this.bullet && this.bullet.active && !this.isSnapping) {
                    const velocity = this.bullet.body!.velocity;

                    if (Math.abs(velocity.x) < 10 && Math.abs(velocity.y) < 10) {
                        this.snapBubble();
                        return;
                    }

                    // Wall bounce with Glitch Effect
                    if (this.bullet.x <= this.BUBBLE_RADIUS) {
                        this.bullet.setVelocityX(Math.abs(velocity.x));
                        this.wallHitEffect(this.bullet.x, this.bullet.y);
                    } else if (this.bullet.x >= this.GAME_WIDTH - this.BUBBLE_RADIUS) {
                        this.bullet.setVelocityX(-Math.abs(velocity.x));
                        this.wallHitEffect(this.bullet.x, this.bullet.y);
                    }

                    if (this.bullet.y <= this.BUBBLE_RADIUS) {
                        this.snapBubble();
                        return;
                    }

                    for (let r = 0; r < this.GRID_ROWS; r++) {
                        for (let c = 0; c < this.bubbles[r].length; c++) {
                            const bubble = this.bubbles[r][c];
                            if (bubble && bubble.visible) {
                                const dist = Phaser.Math.Distance.Between(this.bullet.x, this.bullet.y, bubble.x, bubble.y);
                                if (dist < this.BUBBLE_RADIUS * 2 - 5) {
                                    this.snapBubble();
                                    return;
                                }
                            }
                        }
                    }
                }
            }

            private createGrid() {
                this.bubbles = Array(this.GRID_ROWS).fill(null).map(() => Array(this.GRID_COLS).fill(null));
                const rowsToFill = Math.min(5 + Math.floor(level / 2), this.GRID_ROWS - 5);
                const gridWidth = this.GRID_COLS * this.BUBBLE_RADIUS * 2;
                const gridStartX = (this.GAME_WIDTH - gridWidth) / 2 + this.BUBBLE_RADIUS;

                for (let r = 0; r < rowsToFill; r++) {
                    const cols = r % 2 === 0 ? this.GRID_COLS : this.GRID_COLS - 1;
                    const offsetX = r % 2 === 0 ? 0 : this.BUBBLE_RADIUS;

                    for (let c = 0; c < cols; c++) {
                        const colorIdx = Phaser.Math.Between(0, this.COLORS.length - 1);
                        const x = gridStartX + offsetX + c * (this.BUBBLE_RADIUS * 2);
                        const y = this.BUBBLE_RADIUS + r * (this.BUBBLE_RADIUS * Math.sqrt(3));

                        const bubble = this.add.sprite(x, y, `bubble_${colorIdx}`);
                        bubble.setData('color', colorIdx);
                        this.bubbles[r][c] = bubble;
                    }
                }
            }

            private createShooter() {
                const centerX = this.GAME_WIDTH / 2;
                const bottomY = this.GAME_HEIGHT - 50;

                const colorIdx = Phaser.Math.Between(0, this.COLORS.length - 1);
                this.shooter = this.add.sprite(centerX, bottomY, `bubble_${colorIdx}`);
                this.shooter.setData('color', colorIdx);

                const nextColorIdx = Phaser.Math.Between(0, this.COLORS.length - 1);
                this.nextBubble = this.add.sprite(centerX + 60, bottomY, `bubble_${nextColorIdx}`);
                this.nextBubble.setData('color', nextColorIdx);
                this.nextBubble.setScale(0.8);
                this.add.text(centerX + 45, bottomY + 25, 'NEXT', { fontSize: '10px', fontFamily: 'Orbitron', color: '#94a3b8' });
            }

            private shoot(angle: number) {
                if (this.isShooting || !this.shooter) return;
                this.isShooting = true;

                this.bullet = this.physics.add.sprite(this.shooter.x, this.shooter.y, this.shooter.texture.key);
                this.bullet.setData('color', this.shooter.getData('color'));
                this.bullet.setCollideWorldBounds(true);
                this.bullet.setBounce(1, 1);

                const speed = 1000;
                this.bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

                this.shooter.setVisible(false);
                if (this.arrow) this.arrow.clear();

                if (this.bulletCleanupTimer) this.bulletCleanupTimer.destroy();
                this.bulletCleanupTimer = this.time.delayedCall(5000, () => {
                    this.cleanupBullet();
                    this.resetShooter();
                });
            }

            private cleanupBullet() {
                if (this.bullet) {
                    this.bullet.destroy();
                    this.bullet = null;
                }
                if (this.bulletCleanupTimer) {
                    this.bulletCleanupTimer.destroy();
                    this.bulletCleanupTimer = null;
                }
            }

            private snapBubble() {
                if (!this.bullet || this.isSnapping) return;
                this.isSnapping = true;

                this.bullet.setVelocity(0, 0);
                const x = this.bullet.x;
                const y = this.bullet.y;
                const color = this.bullet.getData('color');

                const gridWidth = this.GRID_COLS * this.BUBBLE_RADIUS * 2;
                const gridStartX = (this.GAME_WIDTH - gridWidth) / 2 + this.BUBBLE_RADIUS;
                const rowHeight = this.BUBBLE_RADIUS * Math.sqrt(3);

                let r = Math.round((y - this.BUBBLE_RADIUS) / rowHeight);
                if (r < 0) r = 0;
                if (r >= this.GRID_ROWS) r = this.GRID_ROWS - 1;

                const isEvenRow = r % 2 === 0;
                const rowOffsetX = isEvenRow ? 0 : this.BUBBLE_RADIUS;
                const effectiveX = x - gridStartX - rowOffsetX;

                let c = Math.round(effectiveX / (this.BUBBLE_RADIUS * 2));
                const maxCols = isEvenRow ? this.GRID_COLS : this.GRID_COLS - 1;
                if (c < 0) c = 0;
                if (c >= maxCols) c = maxCols - 1;

                const finalRowOffsetX = r % 2 === 0 ? 0 : this.BUBBLE_RADIUS;
                const finalX = gridStartX + finalRowOffsetX + c * (this.BUBBLE_RADIUS * 2);
                const finalY = this.BUBBLE_RADIUS + r * rowHeight;

                const newBubble = this.add.sprite(finalX, finalY, `bubble_${color}`);
                newBubble.setData('color', color);
                this.bubbles[r][c] = newBubble;

                this.cleanupBullet();
                this.isSnapping = false;

                this.checkMatches(r, c, color);
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
                    matches.forEach(m => {
                        const bubble = this.bubbles[m.r][m.c];
                        if (bubble) {
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

                    this.score += matches.length * 10;
                    if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);
                    this.removeOrphans();
                    if (this.isLevelClear()) {
                        onLevelCompleteRef.current(this.score);
                    }
                }
            }

            private getNeighbors(r: number, c: number) {
                const neighbors: { r: number, c: number }[] = [];
                const isEven = r % 2 === 0;
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
                const connected = new Set<string>();
                const queue: { r: number, c: number }[] = [];

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

                for (let r = 0; r < this.GRID_ROWS; r++) {
                    for (let c = 0; c < this.bubbles[r].length; c++) {
                        if (this.bubbles[r][c] && !connected.has(`${r},${c}`)) {
                            const bubble = this.bubbles[r][c];
                            if (bubble) {
                                this.tweens.add({
                                    targets: bubble,
                                    y: this.GAME_HEIGHT,
                                    alpha: 0,
                                    duration: 500,
                                    onComplete: () => bubble.destroy()
                                });
                                this.bubbles[r][c] = null;
                                this.score += 20;
                            }
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
                this.cleanupBullet();

                const nextColor = this.nextBubble.getData('color');
                this.shooter.setTexture(`bubble_${nextColor}`);
                this.shooter.setData('color', nextColor);
                this.shooter.setVisible(true);

                const newColor = Phaser.Math.Between(0, this.COLORS.length - 1);
                this.nextBubble.setTexture(`bubble_${newColor}`);
                this.nextBubble.setData('color', newColor);

                this.isShooting = false;
            }
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            width: 360,
            height: 640,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 360,
                height: 640,
            },
            backgroundColor: '#1e293b', // Default fallback
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false,
                },
            },
            scene: GameScene,
        };

        gameRef.current = new Phaser.Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [level]);

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div ref={containerRef} className="w-full h-full max-w-[360px] aspect-[9/16]" />
        </div>
    );
}
