const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')
const scoreElement = document.getElementById('score')
const restartButton = document.getElementById('restart')
let width = 900
let height = 560
let rocket = {x:150,y:280,width:42,height:70,vy:0}
let gravity = 0.45
let thrust = -10
let obstacles = []
let obstacleTimer = 0
let obstacleInterval = 90
let speed = 3.5
let score = 0
let gameOver = false
let lastTime = 0
resize()
window.addEventListener('resize',resize)
window.addEventListener('keydown',handleKey)
window.addEventListener('pointerdown',handleInput)
restartButton.addEventListener('click',resetGame)
function resize(){
    width = Math.min(window.innerWidth-40,900)
    height = 560
    canvas.width = width
    canvas.height = height
}
function handleKey(event){
    if(event.code==='Space'){
        applyThrust()
    }
}
function handleInput(){
    applyThrust()
}
function applyThrust(){
    if(gameOver) return
    rocket.vy = thrust
}
function resetGame(){
    rocket.y = 280
    rocket.vy = 0
    obstacles = []
    obstacleTimer = 0
    score = 0
    gameOver = false
    lastTime = 0
    scoreElement.textContent = 'Score: 0'
    requestAnimationFrame(loop)
}
function spawnObstacle(){
    const gap = 180
    const minHeight = 80
    const maxHeight = height - gap - 120
    const topHeight = minHeight + Math.random() * (maxHeight - minHeight)
    obstacles.push({x:width,y:0,width:64,height:topHeight})
    obstacles.push({x:width,y:topHeight + gap,width:64,height:height - topHeight - gap})
}
function update(delta){
    if(gameOver) return
    rocket.vy += gravity
    rocket.y += rocket.vy
    if(rocket.y + rocket.height > height){
        rocket.y = height - rocket.height
        endGame()
    }
    if(rocket.y < 0){
        rocket.y = 0
        rocket.vy = 0
    }
    obstacleTimer += 1
    if(obstacleTimer >= obstacleInterval){
        obstacleTimer = 0
        spawnObstacle()
    }
    obstacles.forEach(ob => {
        ob.x -= speed
    })
    obstacles = obstacles.filter(ob => ob.x + ob.width > -10)
    obstacles.forEach(ob => {
        if(collide(rocket,ob)){
            endGame()
        }
    })
    if(!gameOver){
        score += delta * 0.01
        scoreElement.textContent = 'Score: ' + Math.floor(score)
    }
}
function collide(a,b){
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
function endGame(){
    gameOver = true
    scoreElement.textContent = 'Game Over  Score: ' + Math.floor(score)
}
function draw(){
    ctx.clearRect(0,0,width,height)
    drawBackground()
    drawRocket()
    drawObstacles()
}
function drawBackground(){
    const gradient = ctx.createLinearGradient(0,0,0,height)
    gradient.addColorStop(0,'#0d1d36')
    gradient.addColorStop(1,'#081221')
    ctx.fillStyle = gradient
    ctx.fillRect(0,0,width,height)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    for(let i=0;i<16;i++){
        ctx.fillRect((i*80 + Date.now()*0.03) % width,height-18,48,3)
    }
}
function drawRocket(){
    const x = rocket.x
    const y = rocket.y
    ctx.fillStyle = '#ffff00'
    ctx.beginPath()
    ctx.ellipse(x + rocket.width/2, y + rocket.height/2, 15, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.ellipse(x + rocket.width - 5, y + 15, 3, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.moveTo(x + rocket.width, y + 20)
    ctx.lineTo(x + rocket.width + 5, y + 18)
    ctx.lineTo(x + rocket.width, y + 22)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#0000ff'
    ctx.fillRect(x + 10, y + 25, 8, 4)
    ctx.fillRect(x + 24, y + 25, 8, 4)
}
function drawObstacles(){
    ctx.fillStyle = '#e23f3f'
    obstacles.forEach(ob => {
        ctx.fillRect(ob.x,ob.y,ob.width,ob.height)
    })
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
