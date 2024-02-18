webgl-3d-animation
==================

An interactive 3D animation using WebGL to depict a 2D predator prey ecology on a grid real-time mapped onto the surface of a 3D torus.  Sound file is parsed then visualized both in time and frequency domains as well as rendered using Web Audio API - this is an exercise where I taught myself how to display data for an ongoing project on sound synthesis 

# Installation

Visit [nodejs.org](http://nodejs.org) and install Node.js. 

Clone this repository to your local machine:

```bash
git clone git@github.com:scottstensland/webgl-3d-animation.git
```

Change directory into the project folder:
```bash
cd webgl-3d-animation
```

Then install the dependent modules:

```bash
npm install
```


Launch the nodejs app:

```bash
npm start
```


Using a WebGL savvy browser, point it at url

```bash
		 http://localhost:8888 
```

or ignore above and just see this WebGL app deployed live :

[https://cybrcr.com/webgl/](https://cybrcr.com/webgl/  "Scott Stensland's WebGL magic")

Feel free to contact me on twitter if you have any questions! 

... my twitter name is same as my github name

   instructions on how to drive this ...

	this will run on any browser however
	run this on a laptop/desktop to be able to navigate using below keyboard keys
    since I have not yet added ability to properly navigate using fingers on mobile devices
	see this video I created using similar logic which shows cool navigation flythrough

		 Predator Prey ecology agent based simulation in c++ OpenGL folds a 2d plane onto surface of a torus 
		https://www.youtube.com/watch?v=frYWtGXqBWc

    run on a computer not on a phone since it currently uses
   just the mouse and keyboard as controls

     mouse left button and middle scroll wheel
           page up / page down
     arrow keys  left/right/up/down
           also these keys :  w s a d

      it uses WebGL for graphics
    I wrote it in the language javascript infact this was my
      "Hello World" for both javascript and WebGL
