import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const Battle2DPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Game Constants & State
        const keys = new Set<string>();
        const floorY = 420;
        const groundLineY = floorY + 8;
        const GRAVITY = 1500;
        const PUNCH_ACTIVE_TIME = 0.18;
        const PLAYER_PUNCH_CD = 0.10;
        const ENEMY_ATTACK_CD = 0.60;
        const HIT_IFRAMES = 0.18;
        const DMG_PLAYER = 12;
        const DMG_ENEMY = 10;
        const KNOCKBACK_X = 280;
        const KNOCKBACK_Y = 140;

        let gameState = "PLAY";
        let animationFrameId: number;

        const player = {
            x: 240, y: floorY,
            w: 44, h: 86,
            vx: 0, vy: 0,
            speed: 320,
            jump: 640,
            onGround: true,
            facing: 1,
            punching: false,
            punchTime: 0,
            punchCooldown: 0,
            hp: 100,
            iframes: 0
        };

        const enemy = {
            x: 680, y: floorY,
            w: 44, h: 86,
            vx: 0, vy: 0,
            speed: 240,
            onGround: true,
            facing: -1,
            punching: false,
            punchTime: 0,
            attackCooldown: 0,
            thinkCooldown: 0,
            hp: 100,
            iframes: 0
        };

        // Input Handling
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.add(e.key.toLowerCase());
            if (e.key.toLowerCase() === "r") resetGame();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keys.delete(e.key.toLowerCase());
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        function resetGame() {
            gameState = "PLAY";
            player.x = 240; player.y = floorY; player.vx = 0; player.vy = 0; player.hp = 100;
            player.punching = false; player.punchTime = 0; player.punchCooldown = 0; player.iframes = 0;

            enemy.x = 680; enemy.y = floorY; enemy.vx = 0; enemy.vy = 0; enemy.hp = 100;
            enemy.punching = false; enemy.punchTime = 0; enemy.attackCooldown = 0; enemy.thinkCooldown = 0; enemy.iframes = 0;
        }

        const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

        function rectsCollide(a: any, b: any) {
            return (
                a.x < b.x + b.w &&
                a.x + a.w > b.x &&
                a.y < b.y + b.h &&
                a.y + a.h > b.y
            );
        }

        function roundRect(x: number, y: number, w: number, h: number, r: number) {
            if (!ctx) return;
            const rr = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + rr, y);
            ctx.arcTo(x + w, y, x + w, y + h, rr);
            ctx.arcTo(x + w, y + h, x, y + h, rr);
            ctx.arcTo(x, y + h, x, y, rr);
            ctx.arcTo(x, y, x + w, y, rr);
            ctx.closePath();
        }

        function drawFighter(f: any, baseColor: string, blinking: boolean) {
            if (!ctx) return;
            // sombra
            ctx.fillStyle = "rgba(0,0,0,.28)";
            ctx.beginPath();
            ctx.ellipse(f.x + f.w / 2, floorY + 26, 30, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            if (blinking) ctx.globalAlpha = 0.55;

            // corpo
            ctx.fillStyle = baseColor;
            roundRect(f.x, f.y - f.h, f.w, f.h, 10);
            ctx.fill();

            // cabeça
            ctx.beginPath();
            ctx.arc(f.x + f.w / 2, f.y - f.h - 12, 12, 0, Math.PI * 2);
            ctx.fill();

            // soco
            if (f.punching) {
                ctx.fillStyle = "#ffd740";
                const hx = f.x + (f.facing === 1 ? f.w : -34);
                const hy = f.y - 62;
                roundRect(hx, hy, 34, 22, 6);
                ctx.fill();
            }

            ctx.restore();
        }

        function drawHPBar(label: string, x: number, y: number, w: number, h: number, hp01: number) {
            if (!ctx) return;
            // fundo
            ctx.fillStyle = "rgba(255,255,255,.12)";
            roundRect(x, y, w, h, 8); ctx.fill();

            // fill
            ctx.fillStyle = "#ff4040";
            roundRect(x, y, w * hp01, h, 8); ctx.fill();

            // borda
            ctx.strokeStyle = "rgba(255,255,255,.35)";
            ctx.lineWidth = 1;
            roundRect(x, y, w, h, 8); ctx.stroke();

            // texto
            ctx.fillStyle = "rgba(255,255,255,.90)";
            ctx.font = "800 12px system-ui, Arial";
            ctx.fillText(label, x, y - 6);
        }

        function drawEndOverlay(text: string) {
            if (!ctx || !canvas) return;
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,.55)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(255,255,255,.94)";
            ctx.textAlign = "center";
            ctx.font = "900 54px system-ui, Arial";
            ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 10);

            ctx.font = "700 16px system-ui, Arial";
            ctx.fillStyle = "rgba(255,255,255,.82)";
            ctx.fillText("Pressione R para reiniciar", canvas.width / 2, canvas.height / 2 + 30);
            ctx.restore();
        }

        let last = performance.now();

        function update(dt: number) {
            if (gameState !== "PLAY") return;

            // timers
            player.punchCooldown = Math.max(0, player.punchCooldown - dt);
            player.iframes = Math.max(0, player.iframes - dt);
            enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
            enemy.thinkCooldown = Math.max(0, enemy.thinkCooldown - dt);
            enemy.iframes = Math.max(0, enemy.iframes - dt);

            // ========== Player input ==========
            player.vx = 0;
            if (keys.has("a")) { player.vx = -player.speed; player.facing = -1; }
            if (keys.has("d")) { player.vx = player.speed; player.facing = 1; }

            if (keys.has("w") && player.onGround) {
                player.vy = -player.jump;
                player.onGround = false;
            }

            if (keys.has("j") && !player.punching && player.punchCooldown <= 0) {
                player.punching = true;
                player.punchTime = PUNCH_ACTIVE_TIME;
                player.punchCooldown = PLAYER_PUNCH_CD;
            }

            // ========== Enemy AI ==========
            const dx = (player.x + player.w / 2) - (enemy.x + enemy.w / 2);
            const adx = Math.abs(dx);
            enemy.facing = dx >= 0 ? 1 : -1;

            const desiredRange = 90;

            if (enemy.thinkCooldown <= 0) {
                enemy.thinkCooldown = 0.08;

                if (enemy.hp > 0 && player.hp > 0) {
                    if (adx > desiredRange) {
                        enemy.vx = enemy.speed * (dx >= 0 ? 1 : -1);
                    } else {
                        enemy.vx = 0;
                        if (!enemy.punching && enemy.attackCooldown <= 0) {
                            enemy.punching = true;
                            enemy.punchTime = PUNCH_ACTIVE_TIME;
                            enemy.attackCooldown = ENEMY_ATTACK_CD;
                        }
                    }
                } else {
                    enemy.vx = 0;
                }
            }

            // ========== Física ==========
            player.vy += GRAVITY * dt;
            enemy.vy += GRAVITY * dt;

            player.x += player.vx * dt;
            player.y += player.vy * dt;

            enemy.x += enemy.vx * dt;
            enemy.y += enemy.vy * dt;

            // limites
            if (canvas) {
                player.x = clamp(player.x, 40, canvas.width - 40 - player.w);
                enemy.x = clamp(enemy.x, 40, canvas.width - 40 - enemy.w);
            }

            // chão
            if (player.y >= floorY) { player.y = floorY; player.vy = 0; player.onGround = true; }
            if (enemy.y >= floorY) { enemy.y = floorY; enemy.vy = 0; enemy.onGround = true; }

            // ========== Socos tempo ==========
            if (player.punching) { player.punchTime -= dt; if (player.punchTime <= 0) player.punching = false; }
            if (enemy.punching) { enemy.punchTime -= dt; if (enemy.punchTime <= 0) enemy.punching = false; }

            // ========== Hit detection ==========
            // Player acerta enemy
            if (player.punching && enemy.hp > 0 && enemy.iframes <= 0) {
                const hit = {
                    x: player.x + (player.facing === 1 ? player.w : -34),
                    y: player.y - 62,
                    w: 34,
                    h: 22
                };
                const box = { x: enemy.x, y: enemy.y - enemy.h, w: enemy.w, h: enemy.h };

                if (rectsCollide(hit, box)) {
                    enemy.hp = Math.max(0, enemy.hp - DMG_PLAYER);
                    enemy.iframes = HIT_IFRAMES;
                    enemy.vx += player.facing * KNOCKBACK_X;
                    enemy.vy -= KNOCKBACK_Y;
                    player.punching = false;
                }
            }

            // Enemy acerta player
            if (enemy.punching && player.hp > 0 && player.iframes <= 0) {
                const hit = {
                    x: enemy.x + (enemy.facing === 1 ? enemy.w : -34),
                    y: enemy.y - 62,
                    w: 34,
                    h: 22
                };
                const box = { x: player.x, y: player.y - player.h, w: player.w, h: player.h };

                if (rectsCollide(hit, box)) {
                    player.hp = Math.max(0, player.hp - DMG_ENEMY);
                    player.iframes = HIT_IFRAMES;
                    player.vx += enemy.facing * KNOCKBACK_X;
                    player.vy -= KNOCKBACK_Y;
                    enemy.punching = false;
                }
            }

            // ========== Final do jogo ==========
            if (enemy.hp <= 0) gameState = "WIN";
            if (player.hp <= 0) gameState = "LOSE";
        }

        function draw() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // “chão”
            ctx.fillStyle = "rgba(255,255,255,.06)";
            ctx.fillRect(0, groundLineY, canvas.width, 2);
            ctx.fillStyle = "#1f294d";
            ctx.fillRect(0, groundLineY + 2, canvas.width, canvas.height - (groundLineY + 2));

            // HP (DENTRO DO CANVAS — não sofre sobreposição do HUD)
            drawHPBar("PLAYER", 28, 18, 220, 14, player.hp / 100);
            drawHPBar("ENEMY", canvas.width - 28 - 220, 18, 220, 14, enemy.hp / 100);

            // lutadores
            drawFighter(player, "#ffffff", player.iframes > 0);
            drawFighter(enemy, "#ff6b6b", enemy.iframes > 0);

            // overlay fim
            if (gameState === "WIN") drawEndOverlay("VOCÊ VENCEU!");
            if (gameState === "LOSE") drawEndOverlay("VOCÊ PERDEU!");
        }

        function tick(now: number) {
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;

            update(dt);
            draw();

            animationFrameId = requestAnimationFrame(tick);
        }

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div style={{
            margin: 0,
            background: '#0b1020',
            overflow: 'hidden',
            fontFamily: 'system-ui,Arial',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            placeItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1000
        }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 100,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                🔙 Voltar
            </button>

            <div style={{
                position: 'fixed',
                top: '56px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontWeight: 800,
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
                background: 'rgba(0,0,0,.28)',
                border: '1px solid rgba(255,255,255,.12)',
                padding: '10px 12px',
                borderRadius: '12px',
                backdropFilter: 'blur(6px)',
                zIndex: 10,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
            }}>
                <div>⬅️➡️ <kbd style={kbdStyle}>A</kbd>/<kbd style={kbdStyle}>D</kbd> mover</div>
                <div>⬆️ <kbd style={kbdStyle}>W</kbd> pular</div>
                <div>👊 <kbd style={kbdStyle}>J</kbd> soco</div>
                <div style={{ opacity: .85 }}>Inimigo: aproxima e ataca</div>
            </div>

            <div className="wrap">
                <canvas
                    ref={canvasRef}
                    width={960}
                    height={520}
                    style={{
                        display: 'block',
                        width: 'min(980px, 100vw)',
                        height: 'min(520px, 100vh)',
                        margin: '0 auto',
                        background: 'radial-gradient(1200px 520px at 50% 20%, rgba(55,140,255,.12), transparent 60%), linear-gradient(180deg,#141a33 0%,#0b1020 100%)'
                    }}
                />
            </div>
        </div>
    );
};

const kbdStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,.10)',
    border: '1px solid rgba(255,255,255,.14)',
    fontWeight: 900,
};
