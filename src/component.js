// 

class Component {
    constructor(vBuffer_arr, iBuffer_arr, indice_size) {
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vBuffer_arr, gl.STATIC_DRAW);
        // create the indice buffer
        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(iBuffer_arr),
            gl.STATIC_DRAW
        );
        this.indice_count = indice_size;
        // lighting init for a single component
        this.materialAmbient = vec4(1.0, 1.0, 1.0, 1);
        this.materialDiffuse = vec4(0.8, 0.8, 0.8, 1);
        this.materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        this.materialShininess = 30.0;
        this.normalsArray = [];


        this.getNormals(vBuffer_arr, iBuffer_arr);
        // this.normals32 = new Float32Array(this.normalsArray.length *4);
        // for (var i =0; i< this.normalsArray.length; i++){
        //     this.normals32[i*4] = this.normalsArray[i][0];
        //     this.normals32[(i*4)+1] = this.normalsArray[i][1];
        //     this.normals32[(i*4)+2] = this.normalsArray[i][2];
        //     this.normals32[(i*4)+3] = this.normalsArray[i][3];
        // }
        // console.log(this.normals32);
        // console.log("normalsArray", this.normalsArray);
        // console.log(iBuffer_arr.length);

        this.ambientProduct = mult(lightAmbient, this.materialAmbient);
        this.diffuseProduct = mult(lightDiffuse, this.materialDiffuse);
        this.specularProduct = mult(lightSpecular, this.materialSpecular);
        // setup object nBuffer for normals
        this.nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.normals32, gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normalsArray), gl.STATIC_DRAW);
        this.normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(this.normalLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.normalLoc);

        this.setUniforms()
    }

    setUniforms() {
        gl.uniform4fv(gl.getUniformLocation(program,
            "uAmbientProduct"), flatten(this.ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(program,
            "uDiffuseProduct"), flatten(this.diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(program,
            "uSpecularProduct"), flatten(this.specularProduct));
        gl.uniform1f(gl.getUniformLocation(program,
            "uShininess"), this.materialShininess);
    }




    getNormals(vBuffer_arr, iBuffer_arr) {
        var caaa = 0
        for (var i = 0; i < this.indice_count / 3; i++) {
            // get point indices from indice buffer
            var index_a = iBuffer_arr[3 * i];
            var index_b = iBuffer_arr[3 * i + 1];
            var index_c = iBuffer_arr[3 * i + 2];
            // use indices to find vertices from vBuffer
            // vBuffer structure for one vertex: [x,y,z,R,G,B,A]
            // a = vec4(x, y, z, 1)
            var a = vec4(vBuffer_arr[7 * index_a], vBuffer_arr[7 * index_a + 1], vBuffer_arr[7 * index_a + 2], 1);
            var b = vec4(vBuffer_arr[7 * index_b], vBuffer_arr[7 * index_b + 1], vBuffer_arr[7 * index_b + 2], 1);
            var c = vec4(vBuffer_arr[7 * index_c], vBuffer_arr[7 * index_c + 1], vBuffer_arr[7 * index_c + 2], 1);
            // load a,b,c into calcNormal
            this.calcNormal(a, b, c);
            caaa++;
        }
        console.log("norms", this.normalsArray);
        console.log(iBuffer_arr);
        console.log(vBuffer_arr);
        // console.log("caaa: ", caaa);

    }

    calcNormal(a, b, c) {
        // console.log(a, b, c)
        var t1 = subtract(b, a);
        var t2 = subtract(c, a);
        var normal = normalize(cross(t2, t1));
        normal = vec4(normal[0], normal[1], normal[2], 0.0);

        
        this.normalsArray.push(normal);
        this.normalsArray.push(normal);
        this.normalsArray.push(normal);
    }

    size() {
        return this.indice_count;
    }

    vertexAttrib() {
        // (x,y,z) floating point values provided
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        // (r,g,b,a) floating point values provided
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    }

    bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        vertexAttrib();
    }
    // state updates:
    // assemble (place the parts in place before movement)
    // then movement
    assemble_and_move(tx, ty, tz, theta, rx, ry, rz) {
        // if transformation has input, do mult
        if (tx != 0 || ty != 0 || tz != 0) {
            modelViewMatrix = mult(modelViewMatrix, translate(tx, ty, tz));
        }
        // rotation/movement based on the current location
        if (theta != 0) {
            modelViewMatrix = mult(modelViewMatrix, rotate(theta, vec3(rx, ry, rz)));
        }
    }
    // set where the object rotate from after (assign joint)  
    set_joint(tx, ty, tz) {
        // instance of setting the center of component
        var instanceMatrix = translate(tx, ty, tz);
        // taking existing modelview with data related to Head, relay to child component UpperLeg
        // mash-up with instance

        var t = mult(modelViewMatrix, instanceMatrix);

        nMatrix = normalMatrix(modelViewMatrix, true);
        gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
       
        gl.drawElements(gl.POINTS, this.indice_count, gl.UNSIGNED_SHORT, 0);
        gl.drawElements(gl.TRIANGLES, this.indice_count, gl.UNSIGNED_SHORT, 0);
    }

    draw_wallpaper() {
        this.bind();
        var tempMatrix = modelViewMatrix;
        // set modelview to fixed
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, [2,0,0,0,
                                                        0,2,0,0,
                                                        0,0,1,0,
                                                        0,0,0,1]);
        gl.drawElements(gl.TRIANGLES, this.indice_count, gl.UNSIGNED_SHORT, 0);
        // gl.uniformMatrix4fv(modelViewMatrixLoc, false, tempMatrix);
    }


    draw_lightsource() {
        this.bind();
        var tempMatrix = translate(lightPosition[0], lightPosition[1], lightPosition[2])
        // console.log(tempMatrix);
        // console.log(modelViewMatrix);
        // set modelview to fixed
        tempMatrix = mult(tempMatrix, scale(.5, .5, .5));
        // console.log("modelview:", modelViewMatrix);
        // console.log("tempMatrix:", tempMatrix[0][3], tempMatrix[1][3],tempMatrix[2][3], tempMatrix[3][3]);
        // console.log("tempMatrix:", tempMatrix[0][0], tempMatrix[0][1],tempMatrix[0][2], tempMatrix[0][3]);
        // var temparr = [
        //     tempMatrix[0][0],tempMatrix[0][1],tempMatrix[0][2],tempMatrix[0][3],
        //     tempMatrix[1][0],tempMatrix[1][1],tempMatrix[1][2],tempMatrix[1][3],
        //     tempMatrix[2][0],tempMatrix[2][1],tempMatrix[2][2],tempMatrix[2][3],
        //     tempMatrix[3][0],tempMatrix[3][1],tempMatrix[3][2],tempMatrix[3][3]];
        var temparr = flatten(tempMatrix);
        // console.log("temparr", temparr)
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, temparr);
        gl.drawElements(gl.TRIANGLES, this.indice_count, gl.UNSIGNED_SHORT, 0);
        // gl.uniformMatrix4fv(modelViewMatrixLoc, false, tempMatrix);
    }


}