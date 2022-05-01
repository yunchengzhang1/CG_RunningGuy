
"use strict";			// Enforce typing in javascript


var canvas, gl, program;			// Drawing surface, Graphics context

var n = 0;

var radius;
var map_vertices;
var eye;
var theta_zero = [0, 0, 0];
var theta = 0.0;
var phi = 0.0;
var shadow_scale=2;


var flag = false;		// Toggle Rotation Control
var show_scraper = true;
var run = false; // toggle between run and idle
var fast = false; // toggle between fast and slow
var to_jump = false;
var up_or_down = 0;
var l_or_r = 0;


// uniforms on the JS end
var sScaleX = 1.0;       // Identiy for scaling is 1
var sScaleY = 1.0;
var sScaleZ = 1.0;
var sDeltaX;
var sDeltaY;
var sDeltaZ;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var resetMatrix;
var nMatrix, nMatrixLoc;
var uColorLoc, uColor;
// global buffers
var iBuffer;
var vBuffer;
var cBuffer;



// lighting values
var radius = 1.5;
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(1, 1, 1, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var lightx=0;
var lighty=0;
var lightz=0;



// global shader variable
var aPosition;
var aColor;
var around_x = 0.0;
var around_y = 0.0;
var around_z = 0.0;

var eye;
// at: where the obj is placed
var at = vec3(0.0, 0.0, 0.0);
// up: where camera points at
var up = vec3(0.0, 1.0, 0.0);

var player; 
var wallpaper;
var lightsource;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas"
    );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    // navy blue
    // gl.clearColor(0.02, 0.05, 0.25, .9);
    // near black
    gl.clearColor(0.01, 0.01, 0.01, 1);
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    ////////////////////////////////////////////////////////////////////////////////  
    // Associate out shader variables with our data buffer
    aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);

    // Associate out shader variables with our data buffer
    aColor = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(aColor);

    uColorLoc = gl.getUniformLocation(program, "uColor");
    uColor = [Math.random(), Math.random(), Math.random(), 1]
    gl.uniform4fv(uColorLoc, uColor);

    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
    // declare a player object
    
    wallpaper = new Component(background_v, background_i, background_i.length);
    lightsource = new Component(hat_v, hat_indices, hat_indices.length);
    player = new Player();
    
    //event listeners for buttons or sliders
    document.getElementById("lookaroundY").onchange = function (event) {
        around_y = event.target.value;
    };
    document.getElementById("lightX").onchange = function (event) {
        lightx = event.target.value;
    };
    document.getElementById("lightY").onchange = function (event) {
        lighty = event.target.value;
    };
    document.getElementById("lightZ").onchange = function (event) {
        lightz = event.target.value;
    };
    // document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    // document.getElementById("Button1").onclick = function(){radius *= 0.5;};

    // take keyboard inputs
    document.addEventListener('keydown', function (event) {
        if (event.key == " ") {
            to_jump = true;
            uColor = [Math.random(), Math.random(), Math.random(), 0.6]
            gl.uniform4fv(uColorLoc, uColor);
        }
        if (event.key == "d") {
            run = true;
            l_or_r = 1;
            around_y = 90;
        }
        else if (event.key == "a") {
            run = true;
            l_or_r = -1;
            around_y = -90;
        }
        else if (event.key == "s") {
            run = true;
            up_or_down = 1;
            around_y = -180;

        }
        else if (event.key == "w") {
            around_y = -0;
            up_or_down = -1;
            run = true;
        }
        else if (event.key == "Shift") {
            fast = true;
        }
    });
    document.addEventListener('keyup', function (event) {
        if (event.key == " ") {
            to_jump = false;
        }
        if (event.key == "d") {
            around_y = 0;
            l_or_r = 0;
            run = false;
        }
        else if (event.key == "a") {
            around_y = 0;
            l_or_r = 0;
            run = false;
        }
        else if (event.key == "s") {
            around_y = 0;
            up_or_down = 0;
            run = false;
        }
        else if (event.key == "w") {
            around_y = 0;
            up_or_down = 0;
            run = false;
        }
        if (event.key == "Shift") {
            fast = false;
        }
    });

    

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix")
    n = 1;
    projectionMatrix = ortho(-n, n, -n, n, -n, n);
    // console.log(projectionMatrix);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // start modelviewmatrix from somewhere
    modelViewMatrix = scale(1, 1, 1);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    // modelViewMatrix = lookAt(eye, at , up);
    
    resetMatrix = modelViewMatrix;
    console.log(resetMatrix)

    // console.log(gl);
    render();

    
    
}

function vertexAttrib() {
    // (x,y,z) floating point values provided
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
    // (r,g,b,a) floating point values provided
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
}




// values define movement and position
var the_p, the_n, the_p1, the_n1, swing_L_up, swing_R_up, swing_L_lo, swing_R_lo, jump =0;
var x = 0;
var speed=0;
var extra = 0.5;
var faster = 0;
var move_x = 0;
var move_z = 0;
var move_y = 0;


// var HEAD_HEIGHT =0;
// var UPPER_ARM_HEIGHT=
// hierarchy: 
// head
//   /      \
//upperL    upperR
//lowerL    lowerR
//footL     footR


var render_c = 0;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // set to normal ortho for object itself
    lightPosition = vec4(lightx, lighty, lightz, 1.0);
    // gl.uniform4fv(gl.getUniformLocation(program,
    //     "uLightPosition"), flatten(lightPosition));


    // console.log("before",modelViewMatrix);
    projectionMatrix = ortho(-n, n, -n, n, -n, n);
    // console.log(projectionMatrix);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    // lightPosition = mult(modelViewMatrix, lightPosition);
    // console.log(modelViewMatrix);
    gl.uniform4fv(gl.getUniformLocation(program,
        "uLightPosition"), flatten(lightPosition));


    // when draws happen
    player.update(to_jump, run, l_or_r, around_y, up_or_down, fast);
    // wallpaper.draw_wallpaper();
    // lightsource.draw_lightsource();
    


    // console.log("after",modelViewMatrix);
    // console.log("light loc", lightPosition);
    
    requestAnimationFrame(render);	// Call to browser to refresh display
}

