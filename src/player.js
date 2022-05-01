
class Player {
  constructor() {
    // initialize all components 
    console.log("HEAD")
    let head_comp = new Component(head_v, head_indices, head_indices.length);
    this.head = head_comp;


    let hat_comp = new Component(hat_v, hat_indices, hat_indices.length);
    this.hat = hat_comp;

    let upperL_comp = new Component(upper_v, upper_indices, upper_indices.length);
    this.upperL = upperL_comp;

    let upperR_comp = new Component(upper_v, upper_indices, upper_indices.length);
    this.upperR = upperR_comp;

    let lowerL_comp = new Component(lower_v, lower_indices, lower_indices.length);
    this.lowerL = lowerL_comp;

    let lowerR_comp = new Component(lower_v, lower_indices, lower_indices.length);
    this.lowerR = lowerR_comp;

    let footL_comp = new Component(footL_v, footL_indices, footL_indices.length);
    this.footL = footL_comp;

    let footR_comp = new Component(footR_v, footR_indices, footR_indices.length);
    this.footR = footR_comp;

    // initialize all state values:
    this.the_p = 0;
    this.the_n = 0;
    this.the_p1 = 0;
    this.the_n1 = 0;
    this.swing_L_up = 0;
    this.swing_R_up = 0;
    this.wing_L_lo = 0;
    this.swing_R_lo = 0;
    this.jump = 0;
    this.run = false; // toggle between run and idle
    this.fast = false; // toggle between fast and slow
    this.to_jump = false;
    this.up_or_down = 0;
    this.l_or_r = 0;
    this.x = 0;
    this.speed = 0;
    this.extra = 0.5;
    this.faster_speed = 0;
    this.move_x = 0;
    this.move_z = 0;
    this.move_y = 0;

    
  }

  // movement speed measure: fast T or F
  speedup() {
    // console.log("SPEED UP");
    if (fast) {
      this.speed = 0.25;  //linear velocity 
      this.faster_speed = 20; //swing speed
    }
    else {

      this.speed = 0.1;
      this.faster_speed = 0;
    }
  }
  // calculate location (move how far by frame) 
  location() {
    this.move_x = this.move_x + (this.speed / 5) * this.l_or_r;
    this.move_z = this.move_z + (this.speed / 5) * this.up_or_down;
    // console.log(move_z);
    this.move_y = -this.move_z;

    if (this.move_x >= n) { this.move_x = -n; }
    else if (this.move_x <= -n) { this.move_x = n; }
    if (this.move_y < -n) {
      this.move_z = -n;
    }
    else if (this.move_y > n) {
      this.move_z = n;
    }
  }

  legswing() {
    // console.log("LEG SWING");
    // update x
    if (this.run) {
      this.x = this.x + this.speed;
    }
    else {
      this.x = 0;
    }
    // get theta + and -

    this.the_p = Math.sin(this.x);
    this.the_n = 0 - Math.sin(this.x);
    this.the_p1 = Math.cos(this.x);
    this.the_n1 = 0 - Math.cos(this.x);

    // calculate leg swings around x axis
    if (this.run) {
      this.swing_L_up = 0 + this.the_n * (30 + this.faster_speed);
      this.swing_L_lo = 45 + this.the_p1 * 45;
      this.jump = Math.abs(this.the_p / 13);
    }
    else {
      this.swing_L_up = 0 + this.the_p * (30 + this.faster_speed);
      this.swing_L_lo = 45 + this.the_n1 * 45;
      this.jump = 0;
    }
    this.swing_R_up = 0 + this.the_p * (30 + this.faster_speed);
    this.swing_R_lo = 45 + this.the_n1 * 45;
  }

  set_scale(sScaleX, sScaleY, sScaleZ) {
    modelViewMatrix = mult(modelViewMatrix, scale(sScaleX, sScaleY, sScaleZ));
  }

  // update state: by each component and draw
  // same function as original draw_mesh()
  update(to_jump, run, l_or_r, around_y, up_or_down, fast) {


    
    this.run = run;
    this.fast = fast;
    this.to_jump = to_jump;
    this.up_or_down = up_or_down;
    this.l_or_r = l_or_r;

    this.speedup();

    this.location();

    this.legswing();

    this.set_scale(1, 1, 1);

    //adjust player position and angle
    modelViewMatrix = translate(this.move_x, this.jump + this.move_y, 0);
    // modelViewMatrix = mult(modelViewMatrix, translate(0, 0, -1));

    modelViewMatrix = mult(modelViewMatrix, rotate(around_y, vec3(0, 1, 0)));
    
    // rotate camera around x axis
    // todo: update later
    // console.log("TURN")
    // modelViewMatrix = mult(modelViewMatrix, rotate(30, vec3(0, 1, 0)));

    //start with head
    this.head.bind();
    this.head.set_joint(0, 0, 0);

    // gl.drawElements(gl.TRIANGLES, this.head.size(), gl.UNSIGNED_SHORT, 0);

    //checkpoint before legmoves
    var instanceMatrix1 = modelViewMatrix;



    // // then hat 
    // // set hat jump
    // modelViewMatrix = mult(modelViewMatrix, translate(0, 0.174 + this.jump * 1.5, 0.0));
    // this.hat.bind();
    // gl.uniform4fv(uColorLoc, [uColor[0] / 2, uColor[1] / 2, uColor[2] / 2, .5]);
    // this.hat.set_joint(0, 0, 0);
    // // reset color to original body color after printing hat
    // gl.uniform4fv(uColorLoc, uColor);
    // // reset location to correctly draw following parts
    // modelViewMatrix = mult(modelViewMatrix, translate(0, -(0.174 + this.jump), 0.0));

    // // set legs (upper, lower, foot)
    // // start with LEFT
    // // upper leg 
    // this.upperL.bind();
    // this.upperL.assemble_and_move(0.231, -0.209, 0.0, this.swing_L_up, 1, 0, 0);
    // // console.log(this.swing_L_up);
    // this.upperL.set_joint(0, -0.209, 0.0);
    // // gl.drawElements(gl.TRIANGLES, this.upperL.size(), gl.UNSIGNED_SHORT, 0);

    // // lower leg 
    // this.lowerL.bind();
    // this.lowerL.assemble_and_move(0, -0.426, 0, this.swing_L_lo, 1, 0, 0);
    // this.lowerL.set_joint(0, -0.213, 0.0);
    // // gl.drawElements(gl.TRIANGLES, this.lowerL.size(), gl.UNSIGNED_SHORT, 0);

    // // foot
    // this.footL.bind();
    // this.footL.assemble_and_move(0, -0.268, 0, 0, 0, 0, 0);
    // this.footL.set_joint(0, -0.134, 0.0);
    // // gl.drawElements(gl.TRIANGLES, this.footL.size(), gl.UNSIGNED_SHORT, 0);
    // // then RIGHT
    // // read from safe
    // modelViewMatrix = instanceMatrix1;
    // // upper leg 
    // this.upperR.bind();
    // // shift once on the X
    // this.upperR.assemble_and_move(-0.231, -0.209, 0.0, this.swing_R_up, 1, 0, 0);
    // this.upperR.set_joint(0, -0.209, 0.0);
    // // gl.drawElements(gl.TRIANGLES, this.upperR.size(), gl.UNSIGNED_SHORT, 0);

    // // lower leg 
    // this.lowerR.bind();
    // this.lowerR.assemble_and_move(0, -0.426, 0, this.swing_R_lo, 1, 0, 0);
    // this.lowerR.set_joint(0, -0.213, 0.0);
    // // gl.drawElements(gl.TRIANGLES, this.lowerR.size(), gl.UNSIGNED_SHORT, 0);

    // // foot
    // this.footR.bind();
    // this.footR.assemble_and_move(0, -0.268, 0, 0, 0, 0, 0);
    // this.footR.set_joint(0, -0.134, 0.0);
    // // gl.drawElements(gl.TRIANGLES, this.footR.size(), gl.UNSIGNED_SHORT, 0);

    modelViewMatrix = instanceMatrix1

    
  }






}

function draw_mesh() {
  // calculate movement speed
  if (fast) {
    speed = 0.25;
    faster = 20;
  }
  else {
    speed = 0.1;
    faster = 0;
  }
  // calculate movement posi            // move towards right of canvas

  move_x = move_x + (speed / 5) * l_or_r;
  move_z = move_z + (speed / 5) * up_or_down;
  // console.log(move_z);
  move_y = -move_z;

  if (move_x >= n) { move_x = -n; }
  else if (move_x <= -n) { move_x = n; }
  if (move_y < -n) {
    move_z = -n;
  }
  else if (move_y > n) {
    move_z = n;
  }


  // update x
  if (run) {
    x = x + speed;
  }
  else {
    x = 0;
  }
  // get theta + and -
  the_p = Math.sin(x);
  the_n = 0 - Math.sin(x);
  the_p1 = Math.cos(x);
  the_n1 = 0 - Math.cos(x);
  // calculate leg swings around x axis
  if (run) {
    swing_L_up = 0 + the_n * (30 + faster);
    swing_L_lo = 45 + the_p1 * 45;
    jump = Math.abs(the_p / 13);
  }
  else {
    swing_L_up = 0 + the_p * (30 + faster);
    swing_L_lo = 45 + the_n1 * 45;
    jump = 0;
  }
  swing_R_up = 0 + the_p * (30 + faster);
  swing_R_lo = 45 + the_n1 * 45;


  modelViewMatrix = mult(modelViewMatrix, scale(sScaleX, sScaleY, sScaleZ));


  modelViewMatrix = translate(move_x, jump + move_y, 0);

  modelViewMatrix = mult(modelViewMatrix, rotate(around_y, vec3(0, 1, 0)));
  // rotate camera around x axis
  modelViewMatrix = mult(modelViewMatrix, rotate(30, vec3(0, 1, 0)));



  // console.log("after rotate",modelViewMatrix);
  bindHead();
  setHead();
  // save modelview matrix before diversion (render one leg first, then the other comes back to is modelview)
  var instanceMatrix1 = modelViewMatrix;

  // draw hat
  modelViewMatrix = mult(modelViewMatrix, translate(0, 0.174 + jump * 1.5, 0.0));
  bindHat();
  setHat();
  modelViewMatrix = mult(modelViewMatrix, translate(0, -(0.174 + jump), 0.0));
  // TRUE is Left, FALSE is Right
  // bind  L upper buffers, then draw 
  // update modelviewMatrix
  // translation here define rotation pivot relative to the parent joint
  modelViewMatrix = mult(modelViewMatrix, translate(0.231, -0.418 * 0.5, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(swing_L_up, vec3(1, 0, 0)));
  // modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], vec3(0, 0, 1 )));
  bindUpper();
  setUpper();

  // bind  L lower buffers, then draw 
  modelViewMatrix = mult(modelViewMatrix, translate(0, (0.418 - 0.844), 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(swing_L_lo, vec3(1, 0, 0)));
  bindLower();
  setLower();

  // bind L footL buffers, then draw 
  modelViewMatrix = mult(modelViewMatrix, translate(0, (0.844 - 1.112), 0.0));
  bindFootL();
  setFootL();
  // console.log(modelViewMatrix);
  // return modelview matrix back to instance
  modelViewMatrix = instanceMatrix1;
  // bind R foot buffers, then draw 
  modelViewMatrix = mult(modelViewMatrix, translate(-0.231, -0.418 * 0.5, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(swing_R_up, vec3(1, 0, 0)));
  bindUpper();
  setUpper();

  // bind R lower buffers, then draw 
  modelViewMatrix = mult(modelViewMatrix, translate(0, (0.418 - 0.844), 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(swing_R_lo, vec3(1, 0, 0)));
  bindLower();
  setLower();

  // bind R foot buffers, then draw 
  modelViewMatrix = mult(modelViewMatrix, translate(0, (0.844 - 1.112), 0.0));
  bindFootR();
  setFootR();
}
