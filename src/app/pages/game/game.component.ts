import { OnInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  context: CanvasRenderingContext2D;
  frames: number = 0;
  sprites: HTMLImageElement = new Image();
  activeScreen: any = {}
  RAD = Math.PI / 180;

  state: any = {
    points: 3,
    attemps: 0,
    moves: 0,
    spending: 0
  }

  sounds: any = {
    hit: new Audio('/assets/audio/hit.wav'),
    point: new Audio('/assets/audio/point.wav'),
    swoosh: new Audio('/assets/audio/swoosh.wav'),
    die: new Audio('/assets/audio/die.wav'),
    wing: new Audio('/assets/audio/wing.wav')
  }

  readMensage: any = {
    sx: 134,
    sy: 0,
    width: 174,
    height: 152,
    dx: 0,
    dy: 250,

    draw: () => {
      this.context.drawImage(
        this.sprites,
        this.readMensage.sx,
        this.readMensage.sy,
        this.readMensage.width,
        this.readMensage.height,
        this.readMensage.dx,
        this.readMensage.dy,
        this.readMensage.width,
        this.readMensage.height
      );
    }
  }

  background: any = {
    sx: 390,
    sy: 0,
    width: 275,
    height: 204,
    dx: 0,
    dy: 0,

    draw: () => {

      this.context.fillStyle = '#70c5ce';
      this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

      this.context.drawImage(
        this.sprites,
        this.background.sx,
        this.background.sy,
        this.background.width,
        this.background.height,
        this.background.dx,
        this.background.dy,
        this.background.width,
        this.background.height
      );

      this.context.drawImage(
        this.sprites,
        this.background.sx,
        this.background.sy,
        this.background.width,
        this.background.height,
        (this.background.dx + this.background.width),
        this.background.dy,
        this.background.width,
        this.background.height
      );
    }

  }

  floor: any = {}

  bird: any = {}

  pipes: any = {}

  screen: any = {
    width: 0,
    heigth: 0
  }

  screens: any = {
    GAME_OVER: {
      selected: true,
      draw: () => {
        this.background.draw();
        this.pipes.draw();
        this.floor.draw();
        this.bird.draw();
      },
      update: () => {
        this.bird.update();
      },
      click: () => {

        this.changeScreen(this.screens.HOME);
      }
    },
    HOME: {
      init: () => {
        this.onCreateBird();
        this.onCreateFloor();
        this.onCreatePipes();
        this.setInitialState();
      },
      draw: () => {
        this.background.draw();
        this.floor.draw();
        this.bird.draw();
        this.readMensage.draw();
      },
      update: () => {
        this.floor.update();
      },
      click: () => {
        if(this.state.points > 0) {
          this.state.points --
          this.state.spending ++
        }else {
          this.state.attemps ++
        }
        
        this.state.moves ++ 
        this.changeScreen(this.screens.GAME);
        this.sounds.swoosh.play();
        this.onClick()
      }
    },
    GAME: {
      draw: () => {
        this.background.draw();
        this.pipes.draw();
        this.floor.draw();
        this.bird.draw();
      },
      click: () => {
        this.bird.jump()
      },
      update: () => {
        this.bird.update();
        this.floor.update();
        this.pipes.update();
      }
    }
  }

  ngOnInit(): void {
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
    window.addEventListener('keydown', (event) => { this.onClick() })
  }

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.sprites.src = 'assets/sprites.png';
    this.changeScreen(this.screens.HOME);
    this.loop();

  }

  setInitialState() {
    this.floor.dy = this.screen.height - this.floor.height;
    this.background.dy = this.screen.height - this.background.height;
    this.readMensage.dx = (this.screen.width / 2) - this.readMensage.width / 2;
    this.bird.animations[0].src = '/assets/sprites/yellowbird-downflap.png';
    this.bird.animations[1].src = '/assets/sprites/yellowbird-midflap.png';
    this.bird.animations[2].src = '/assets/sprites/yellowbird-upflap.png';
  }

  loop() {
    this.activeScreen.draw();
    this.activeScreen.update();
    this.frames++;
    requestAnimationFrame(() => this.loop())
  }

  changeScreen(screen: any) {
    this.activeScreen = screen;

    if (this.activeScreen.init) {
      this.activeScreen.init();
    }
  }

  onClick() {
    if (this.activeScreen.click) {
      this.activeScreen.click();
    }
  }

  onColision(bird: any, floor: any) {
    const birdY = bird.y - 10
    const floorY = floor.dy;

    if (birdY >= floorY) {
      return true
    }

    return false

  }

  onCreateBird() {
    const bird: any = {

      animations: [
        { src: new Image() },
        { src: new Image() },
        { src: new Image() }
      ],
      width: 51.5,
      height: 34,
      gravity: 0.08,
      speed: 0,
      jumpForce: 3.2,
      rotation: 0,
      thrust: 8.6,
      atualFrame: 0,
      x: 100,
      y: 350,

      jump: () => {
        this.sounds.wing.load()
        this.sounds.wing.play();
        this.bird.speed = -this.bird.jumpForce;
      },
      updateAtualFrame: () => {
        const frameInterval = 12;
        const pastInterval = this.frames % frameInterval;

        if (pastInterval == 0) {
          const incrementBase = 1;
          const increment = incrementBase + this.bird.atualFrame;
          const repeat = this.bird.animations.length;
          this.bird.atualFrame = increment % repeat;
        }
      },
      update: () => {
        if (this.onColision(this.bird, this.floor) && this.activeScreen.selected) {
          this.changeScreen(this.screens.GAME_OVER)
          return
        } else if (this.onColision(this.bird, this.floor)) {
          this.sounds.hit.play()
          this.changeScreen(this.screens.GAME_OVER)
        }
        this.bird.y += this.bird.speed;
        this.bird.setRotation();
        this.bird.speed += this.bird.gravity;

      },

      draw: () => {
        this.bird.updateAtualFrame()
        const image = new Image()
        image.src = this.bird.animations[this.bird.atualFrame].src;


        this.context.save();
        this.context.translate(this.bird.x, this.bird.y);
        this.context.rotate(this.bird.rotatation * this.RAD);
        this.context.drawImage(
          image,
          0, 0,
          this.bird.width,
          this.bird.height,
          - this.bird.width,
          - this.bird.height / 2,
          this.bird.width,
          this.bird.height,
        );

        this.context.restore();
      },
      setRotation: () => {
        if (this.bird.speed <= 0) {
          this.bird.rotatation = Math.max(-25, (-25 * this.bird.speed) / (-1 * this.bird.thrust));
        } else if (this.bird.speed > 0) {
          this.bird.rotatation = Math.min(90, (90 * this.bird.speed) / (this.bird.thrust * 2));
        }
      },

    }

    this.bird = bird
  }

  onCreateFloor() {
    const floor: any = {
      sx: 0,
      sy: 610,
      width: 224,
      height: 112,
      dx: 0,
      dy: 0,

      update: () => {
        const steps = 2;
        const reapeat = floor.width / 2
        const movement = floor.dx - steps;

        floor.dx = movement % reapeat

      },

      draw: () => {

        for (let i = 0; i < this.screen.width / this.floor.width + 1; i++) {
          this.context.drawImage(
            this.sprites,
            this.floor.sx,
            this.floor.sy,
            this.floor.width,
            this.floor.height,
            (this.floor.dx + (this.floor.width * i)),
            this.floor.dy,
            this.floor.width,
            this.floor.height
          );
        }

      }
    }
    this.floor = floor;
  }



  onCreatePipes() {
    const pipes: any = {
      sprites: new Image(),
      width: 102,
      height: 600,
      gap: 98,
      top: {
        sx: 104,
        sy: 0,
        dx: 0,
        dy: 0
      },
      bottom: {
        sx: 0,
        sy: 0,
        dx: 0,
        dy: 0
      },
      pairs: [],

      draw: () => {
        this.pipes.pairs.forEach(pair => {
          this.pipes.sprites.src = 'assets/pipesSprites.png';
          const randomY = pair.y
          const topX = pair.x;
          const topY = randomY;
          const bottomX = pair.x;
          const bottomY = randomY + this.pipes.gap + this.pipes.height

          this.context.drawImage(
            this.pipes.sprites,
            this.pipes.top.sx,
            this.pipes.top.sy,
            this.pipes.width,
            this.pipes.height,
            topX, topY,
            this.pipes.width,
            this.pipes.height
          );

          this.context.drawImage(
            this.pipes.sprites,
            this.pipes.bottom.sx,
            this.pipes.bottom.sy,
            this.pipes.width,
            this.pipes.height,
            bottomX, bottomY,
            this.pipes.width,
            this.pipes.height
          );

          pair.top = {
            x: topX,
            y: this.pipes.height + topY
          }

          pair.bottom = {
            x: bottomX,
            y: parseFloat(bottomY)
          }

          pair.pass = false;
        });
      },

      onColision: (pair) => {

        if (!this.pipes.pairs.length) return false;
        const birdHead = Math.floor(this.bird.y)
        const birdFooter = Math.min(this.bird.y + this.bird.height)

        if (this.bird.x - 15 >= pair.x - 30 && pair.x > -40) {
          if (birdHead <= pair.top.y + 15 && this.bird.x - 5 > pair.top.x) {
            console.log('colidiu', '[bird top', birdHead, '[pipe top]', pair.top.y)
            return true
          }

          if (birdFooter >= pair.bottom.y + 25 && this.bird.x - 5 > pair.bottom.x) {
            console.log('colidiu', '[bottom bird]', birdFooter, '[bottom pipe]', pair.bottom.y)
            return true
          }
        } else if (pair.x < -90) {
          this.pipes.pairs.shift();
          this.sounds.point.play();
          this.state.points++;
        }


        return false;

      },
      update: () => {
        const last100Frames = this.frames % 160 === 0
        if (last100Frames) {
          const random = this.getRandom()

          this.pipes.pairs.push(
            { x: this.canvas.nativeElement.width, y: random }
          )
        }

        this.pipes.pairs.forEach(pair => {
          pair.x -= 2;

          if (this.pipes.onColision(pair)) {
            this.changeScreen(this.screens.GAME_OVER);
            this.sounds.hit.play()
            this.sounds.die.play()
          }

          if (pair.x + this.pipes.width <= 0) {
            this.pipes.pairs.shift();
          }
        })
      }
    }
    this.pipes = pipes
  }

  getRandom() {
    let max = 0;
    let min = 0;

    if (this.screen.width < 400) {
      max = 250;
      min = 180;
    } else {
      max = 250;
      min = 50;
    }
    const random = -310 * Math.min(Math.random() + 0.5, 1.8)
    return random
  }


}
