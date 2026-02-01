artWidth = 500;
artHeight = 500;

function setup() {
  createCanvas(artWidth, artHeight);
  stroke(0, 0, 0, 15);
}

function draw() {
  randomChord()
  randomChord()
}
function randomChord(){
  // find a random point on a circle
  let angle = random(0, 2 * PI)
  let xpos1 = 200 + 200 * cos(angle);
  let ypos1 = 200 + 200 * sin(angle);
  
  //Find another random point on a circle
  let angle2 = random(0, 2 * PI);
  let xpos2 = 200 + 200 * cos(angle2);
  let ypos2 = 200 + 200 * sin(angle2);
  
  stroke(random (0, 255), random (0, 255),  0)
  line(xpos1, ypos1, xpos2, ypos2);
}