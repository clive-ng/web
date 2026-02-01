size= 20;
let res =0.008;
function setup()
{
  createCanvas(windowWidth-20, windowHeight-70);
  strokeWeight(3);
  background(185);
  for(let x=0;x<width;x+=size)
    {
      for(let y=0;y<height;y+=size){
        n=noise(x*res,y*res)-0.2;
        c=random(2);
        if(c<1){
          line(x,y,x+size,y+size);
          
        }
          else if(c<2){
            line(x,y+size,x+size,y);}
            else if (c<3)
            {
              line(x,y,x,y+size);
            }
            else if (c<4){
              line(x,y,x+size,y);
            }
            }
          }
        }