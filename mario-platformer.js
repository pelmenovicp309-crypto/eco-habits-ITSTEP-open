const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')
const scoreElement = document.getElementById('score')
const restartButton = document.getElementById('restart')
let width = 1200
let height = 600
let player = {x:100,y:400,width:42,height:70,vx:0,vy:0,onGround:false}
let gravity = 0.5
let jumpForce = -12
let speed = 5
let camera = {x:0,y:0}
let platforms = [
    {x:0,y:500,width:1200,height:100},
    {x:400,y:450,width:200,height:20},
    {x:800,y:480,width:200,height:20},
    {x:1200,y:430,width:200,height:20},
    {x:1600,y:470,width:200,height:20},
    {x:2000,y:420,width:200,height:20},
    {x:2400,y:460,width:200,height:20},
    {x:2800,y:430,width:200,height:20},
    {x:3200,y:470,width:200,height:20},
    {x:3600,y:440,width:200,height:20},
    {x:4000,y:480,width:200,height:20},
    {x:4400,y:450,width:200,height:20},
    {x:4800,y:500,width:200,height:20},
]
let enemies = [
    {x:750,y:390,width:40,height:40,vx:2,minX:700,maxX:900},
    {x:1850,y:430,width:40,height:40,vx:2,minX:1800,maxX:2000},
    {x:3050,y:400,width:40,height:40,vx:2,minX:3000,maxX:3200},
    {x:4250,y:440,width:40,height:40,vx:2,minX:4200,maxX:4400},
]
let checkpoint = {x:100,y:400}
let keys = {}
let jumpRequested = false
let score = 0
let gameOver = false
let lastTime = 0
resize()
window.addEventListener('resize',resize)
window.addEventListener('keydown', e => {
    if (e.code === 'Space') jumpRequested = true
    keys[e.code] = true
})
window.addEventListener('keyup', e => {
    if (e.code === 'Space') jumpRequested = false
    keys[e.code] = false
})
restartButton.addEventListener('click',resetGame)
function resize(){
    width = Math.min(window.innerWidth-40,1200)
    height = 600
    canvas.width = width
    canvas.height = height
}
function resetGame(){
    player.x = 100
    player.y = 400
    player.vx = 0
    player.vy = 0
    player.onGround = false
    camera.x = 0
    checkpoint.x = 100
    checkpoint.y = 400
    score = 0
    gameOver = false
    lastTime = 0
    scoreElement.textContent = 'Score: 0'
    requestAnimationFrame(loop)
}
function respawn(){
    player.x = checkpoint.x
    player.y = checkpoint.y
    player.vx = 0
    player.vy = 0
    player.onGround = false
    camera.x = Math.max(0, player.x - width / 2)
    scoreElement.textContent = 'Score: ' + Math.floor(score)
}
function update(delta){
    if(gameOver) return
    player.vx = 0
    if(keys.ArrowLeft) player.vx = -speed
    if(keys.ArrowRight) player.vx = speed
    if(jumpRequested && player.onGround){
        player.vy = jumpForce
        player.onGround = false
        jumpRequested = false
    }
    player.vy += gravity
    player.x += player.vx
    player.y += player.vy
    player.onGround = false
    platforms.forEach(p => {
        if(collide(player,p)){
            if(player.vy > 0 && player.y + player.height > p.y && player.y < p.y){
                player.y = p.y - player.height
                player.vy = 0
                player.onGround = true
                if (player.x > checkpoint.x + 200) {
                    checkpoint.x = player.x
                    checkpoint.y = player.y
                }
            } else if(player.vy < 0 && player.y < p.y + p.height){
                player.y = p.y + p.height
                player.vy = 0
            } else if(player.vx > 0 && player.x + player.width > p.x && player.x < p.x){
                player.x = p.x - player.width
            } else if(player.vx < 0 && player.x < p.x + p.width){
                player.x = p.x + p.width
            }
        }
    })
    enemies.forEach(enemy => {
        enemy.x += enemy.vx
        if(enemy.x < enemy.minX || enemy.x + enemy.width > enemy.maxX){
            enemy.vx *= -1
            enemy.x = Math.max(enemy.minX, Math.min(enemy.x, enemy.maxX - enemy.width))
        }
        if(collide(player, enemy)){
            respawn()
        }
    })
    if(player.y > height){
        respawn()
    }
    camera.x = player.x - width/2
    score = Math.max(score, player.x / 10)
    scoreElement.textContent = 'Score: ' + Math.floor(score)
    if (player.x > 5200) {
        winGame()
    }
}
function collide(a,b){
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
function endGame(){
    gameOver = true
    scoreElement.textContent = 'Game Over Score: ' + Math.floor(score)
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('add-points', Math.floor(score / 4))
}
function winGame(){
    gameOver = true
    scoreElement.textContent = 'Level Complete! Score: ' + Math.floor(score)
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('add-points', Math.floor(score / 4))
}
function draw(){
    ctx.clearRect(0,0,width,height)
    ctx.save()
    ctx.translate(-camera.x,0)
    drawBackground()
    drawPlatforms()
    drawEnemies()
    drawHazardLine()
    drawPlayer()
    ctx.restore()
}
function drawBackground(){
    ctx.fillStyle = '#0d1d36'
    ctx.fillRect(camera.x,0,width,height)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    for(let i=0;i<20;i++){
        ctx.fillRect(camera.x + i*80,height-18,48,3)
    }
}
function drawPlatforms(){
    platforms.forEach(p => {
        ctx.fillStyle = '#4a8b4a'
        ctx.fillRect(p.x, p.y, p.width, p.height)
        ctx.fillStyle = '#7ccd7c'
        ctx.fillRect(p.x, p.y, p.width, 10)
        ctx.fillStyle = '#3c802f'
        for (let i = 0; i < p.width; i += 14) {
            ctx.beginPath()
            ctx.moveTo(p.x + i, p.y + 10)
            ctx.lineTo(p.x + i + 7, p.y)
            ctx.lineTo(p.x + i + 14, p.y + 10)
            ctx.closePath()
            ctx.fill()
        }
    })
}
function drawEnemies(){
    enemies.forEach(enemy => {
        ctx.fillStyle = '#4a8b4a'
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        ctx.fillStyle = '#000000'
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8)
        ctx.fillRect(enemy.x + 24, enemy.y + 8, 8, 8)
    })
}
function drawHazardLine(){
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(camera.x, height - 4)
    ctx.lineTo(camera.x + width, height - 4)
    ctx.stroke()
}
function drawPlayer(){
    const x = player.x
    const y = player.y
    ctx.fillStyle = '#ffcc99'
    ctx.beginPath()
    ctx.ellipse(x + player.width/2, y + player.height/2, 15, 20, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.ellipse(x + 15, y + 15, 2, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + 27, y + 15, 2, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.ellipse(x + 21, y + 25, 3, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(x + 18, y + 10)
    ctx.lineTo(x + 16, y + 5)
    ctx.lineTo(x + 20, y + 5)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x + 24, y + 10)
    ctx.lineTo(x + 22, y + 5)
    ctx.lineTo(x + 26, y + 5)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ffcc99'
    ctx.fillRect(x + 10, y + 35, 6, 10)
    ctx.fillRect(x + 26, y + 35, 6, 10)
    ctx.fillStyle = '#000000'
    ctx.fillRect(x + 12, y + 45, 2, 5)
    ctx.fillRect(x + 28, y + 45, 2, 5)
}
function loop(timestamp){
    const delta = timestamp - lastTime
    lastTime = timestamp
    update(delta)
    draw()
    if(!gameOver){
        requestAnimationFrame(loop)
    }
}
requestAnimationFrame(loop)
