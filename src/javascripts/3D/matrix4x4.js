/*
 * Based on sample code from the OpenGL(R) ES 2.0 Programming Guide, which carriers
 * the following header:
 *
 * Book:      OpenGL(R) ES 2.0 Programming Guide
 * Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
 * ISBN-10:   0321502795
 * ISBN-13:   9780321502797
 * Publisher: Addison-Wesley Professional
 * URLs:      http://safari.informit.com/9780321563835
 *            http://www.opengles-book.com
 */

//
// A simple 4x4 Matrix utility class
//

function Matrix4x4() {
  this.elements = Array(16);
  this.loadIdentity();
}

Matrix4x4.prototype = {
  scale: function (sx, sy, sz) {
    this.elements[0] *= sx;
    this.elements[1] *= sx;
    this.elements[2] *= sx;
    this.elements[3] *= sx;

    this.elements[4] *= sy;
    this.elements[5] *= sy;
    this.elements[6] *= sy;
    this.elements[7] *= sy;

    this.elements[8] *= sz;
    this.elements[9] *= sz;
    this.elements[10] *= sz;
    this.elements[11] *= sz;

    return this;
  },

  translate: function (tx, ty, tz) {
    this.elements[12] += this.elements[0] * tx + this.elements[4] * ty + this.elements[8] * tz;
    this.elements[13] += this.elements[1] * tx + this.elements[5] * ty + this.elements[9] * tz;
    this.elements[14] += this.elements[2] * tx + this.elements[6] * ty + this.elements[10] * tz;
    this.elements[15] += this.elements[3] * tx + this.elements[7] * ty + this.elements[11] * tz;

    return this;
  },

  rotate: function (angle, x, y, z) {
    var mag = Math.sqrt(x*x + y*y + z*z) * 1.05;
    var sinAngle = Math.sin(angle * Math.PI / 180.0);
    var cosAngle = Math.cos(angle * Math.PI / 180.0);


    if (mag > 0) {
      var xx, yy, zz, xy, yz, zx, xs, ys, zs;
      var oneMinusCos;
      var rotMat;

      x /= mag;
      y /= mag;
      z /= mag;

      xx = x * x;
      yy = y * y;
      zz = z * z;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * sinAngle;
      ys = y * sinAngle;
      zs = z * sinAngle;
      oneMinusCos = 1.0 - cosAngle;

      rotMat = new Matrix4x4();

      rotMat.elements[0] = (oneMinusCos * xx) + cosAngle;
      rotMat.elements[1] = (oneMinusCos * xy) - zs;
      rotMat.elements[2] = (oneMinusCos * zx) + ys;
      rotMat.elements[3] = 0.0;

      rotMat.elements[4] = (oneMinusCos * xy) + zs;
      rotMat.elements[5] = (oneMinusCos * yy) + cosAngle;
      rotMat.elements[6] = (oneMinusCos * yz) - xs;
      rotMat.elements[7] = 0.0;

      rotMat.elements[8] = (oneMinusCos * zx) - ys;
      rotMat.elements[9] = (oneMinusCos * yz) + xs;
      rotMat.elements[10] = (oneMinusCos * zz) + cosAngle;
      rotMat.elements[11] = 0.0;

      rotMat.elements[12] = 0.0;
      rotMat.elements[13] = 0.0;
      rotMat.elements[14] = 0.0;
      rotMat.elements[15] = 1.0;

      rotMat = rotMat.multiply(this);
      this.elements = rotMat.elements;
    }

    return this;
  },

  frustum: function (left, right, bottom, top, nearZ, farZ) {
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;
    var frust;

    if ( (nearZ <= 0.0) || (farZ <= 0.0) ||
        (deltaX <= 0.0) || (deltaY <= 0.0) || (deltaZ <= 0.0) )
         return this;

    frust = new Matrix4x4();

    frust.elements[0] = 2.0 * nearZ / deltaX;
    frust.elements[1] = frust.elements[2] = frust.elements[3] = 0.0;

    frust.elements[5] = 2.0 * nearZ / deltaY;
    frust.elements[4] = frust.elements[6] = frust.elements[7] = 0.0;

    frust.elements[8] = (right + left) / deltaX;
    frust.elements[9] = (top + bottom) / deltaY;
    frust.elements[10] = -(nearZ + farZ) / deltaZ;
    frust.elements[11] = -1.0;

    frust.elements[14] = -2.0 * nearZ * farZ / deltaZ;
    frust.elements[12] = frust.elements[13] = frust.elements[15] = 0.0;

    frust = frust.multiply(this);
    this.elements = frust.elements;

    return this;
  },

  perspective: function (fovy, aspect, nearZ, farZ) {
    var frustumH = Math.tan(fovy / 360.0 * Math.PI) * nearZ;
    var frustumW = frustumH * aspect;

    return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
  },

  ortho: function (left, right, bottom, top, nearZ, farZ) {
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;

    var ortho = new Matrix4x4();

    if ( (deltaX === 0.0) || (deltaY === 0.0) || (deltaZ === 0.0) )
        return this;

    ortho.elements[0] = 2.0 / deltaX;
    ortho.elements[12] = -(right + left) / deltaX;
    ortho.elements[5] = 2.0 / deltaY;
    ortho.elements[13] = -(top + bottom) / deltaY;
    ortho.elements[10] = -2.0 / deltaZ;
    ortho.elements[14] = -(nearZ + farZ) / deltaZ;

    ortho = ortho.multiply(this);
    this.elements = ortho.elements;

    return this;
  },

  multiply: function (right) {
    var tmp = new Matrix4x4();

    for (var i = 0; i < 4; i++) {
      tmp.elements[i*4] =
	(this.elements[i*4] * right.elements[0]) +
	(this.elements[i*4+1] * right.elements[4]) +
	(this.elements[i*4+2] * right.elements[8]) +
	(this.elements[i*4+3] * right.elements[12]) ;

      tmp.elements[i*4+1] =
	(this.elements[i*4] * right.elements[1]) +
	(this.elements[i*4+1] * right.elements[5]) +
	(this.elements[i*4+2] * right.elements[9]) +
	(this.elements[i*4+3] * right.elements[13]) ;

      tmp.elements[i*4+2] =
	(this.elements[i*4] * right.elements[2]) +
	(this.elements[i*4+1] * right.elements[6]) +
	(this.elements[i*4+2] * right.elements[10]) +
	(this.elements[i*4+3] * right.elements[14]) ;

      tmp.elements[i*4+3] =
	(this.elements[i*4] * right.elements[3]) +
	(this.elements[i*4+1] * right.elements[7]) +
	(this.elements[i*4+2] * right.elements[11]) +
	(this.elements[i*4+3] * right.elements[15]) ;
    }

    this.elements = tmp.elements;
    return this;
  },

  copy: function () {
    var tmp = new Matrix4x4();
    for (var i = 0; i < 16; i++) {
      tmp.elements[i] = this.elements[i];
    }
    return tmp;
  },

  get: function (row, col) {
    return this.elements[4*row+col];
  },

  // In-place inversion
  invert: function () {
    var tmp_0 = this.get(2,2) * this.get(3,3);
    var tmp_1 = this.get(3,2) * this.get(2,3);
    var tmp_2 = this.get(1,2) * this.get(3,3);
    var tmp_3 = this.get(3,2) * this.get(1,3);
    var tmp_4 = this.get(1,2) * this.get(2,3);
    var tmp_5 = this.get(2,2) * this.get(1,3);
    var tmp_6 = this.get(0,2) * this.get(3,3);
    var tmp_7 = this.get(3,2) * this.get(0,3);
    var tmp_8 = this.get(0,2) * this.get(2,3);
    var tmp_9 = this.get(2,2) * this.get(0,3);
    var tmp_10 = this.get(0,2) * this.get(1,3);
    var tmp_11 = this.get(1,2) * this.get(0,3);
    var tmp_12 = this.get(2,0) * this.get(3,1);
    var tmp_13 = this.get(3,0) * this.get(2,1);
    var tmp_14 = this.get(1,0) * this.get(3,1);
    var tmp_15 = this.get(3,0) * this.get(1,1);
    var tmp_16 = this.get(1,0) * this.get(2,1);
    var tmp_17 = this.get(2,0) * this.get(1,1);
    var tmp_18 = this.get(0,0) * this.get(3,1);
    var tmp_19 = this.get(3,0) * this.get(0,1);
    var tmp_20 = this.get(0,0) * this.get(2,1);
    var tmp_21 = this.get(2,0) * this.get(0,1);
    var tmp_22 = this.get(0,0) * this.get(1,1);
    var tmp_23 = this.get(1,0) * this.get(0,1);

    var t0 = ((tmp_0 * this.get(1,1) + tmp_3 * this.get(2,1) + tmp_4 * this.get(3,1)) -
              (tmp_1 * this.get(1,1) + tmp_2 * this.get(2,1) + tmp_5 * this.get(3,1)));
    var t1 = ((tmp_1 * this.get(0,1) + tmp_6 * this.get(2,1) + tmp_9 * this.get(3,1)) -
              (tmp_0 * this.get(0,1) + tmp_7 * this.get(2,1) + tmp_8 * this.get(3,1)));
    var t2 = ((tmp_2 * this.get(0,1) + tmp_7 * this.get(1,1) + tmp_10 * this.get(3,1)) -
              (tmp_3 * this.get(0,1) + tmp_6 * this.get(1,1) + tmp_11 * this.get(3,1)));
    var t3 = ((tmp_5 * this.get(0,1) + tmp_8 * this.get(1,1) + tmp_11 * this.get(2,1)) -
              (tmp_4 * this.get(0,1) + tmp_9 * this.get(1,1) + tmp_10 * this.get(2,1)));

    var d = 1.0 / (this.get(0,0) * t0 + this.get(1,0) * t1 + this.get(2,0) * t2 + this.get(3,0) * t3);

    var out_00 = d * t0;
    var out_01 = d * t1;
    var out_02 = d * t2;
    var out_03 = d * t3;

    var out_10 = d * ((tmp_1 * this.get(1,0) + tmp_2 * this.get(2,0) + tmp_5 * this.get(3,0)) -
                      (tmp_0 * this.get(1,0) + tmp_3 * this.get(2,0) + tmp_4 * this.get(3,0)));
    var out_11 = d * ((tmp_0 * this.get(0,0) + tmp_7 * this.get(2,0) + tmp_8 * this.get(3,0)) -
                      (tmp_1 * this.get(0,0) + tmp_6 * this.get(2,0) + tmp_9 * this.get(3,0)));
    var out_12 = d * ((tmp_3 * this.get(0,0) + tmp_6 * this.get(1,0) + tmp_11 * this.get(3,0)) -
                      (tmp_2 * this.get(0,0) + tmp_7 * this.get(1,0) + tmp_10 * this.get(3,0)));
    var out_13 = d * ((tmp_4 * this.get(0,0) + tmp_9 * this.get(1,0) + tmp_10 * this.get(2,0)) -
                      (tmp_5 * this.get(0,0) + tmp_8 * this.get(1,0) + tmp_11 * this.get(2,0)));

    var out_20 = d * ((tmp_12 * this.get(1,3) + tmp_15 * this.get(2,3) + tmp_16 * this.get(3,3)) -
                      (tmp_13 * this.get(1,3) + tmp_14 * this.get(2,3) + tmp_17 * this.get(3,3)));
    var out_21 = d * ((tmp_13 * this.get(0,3) + tmp_18 * this.get(2,3) + tmp_21 * this.get(3,3)) -
                      (tmp_12 * this.get(0,3) + tmp_19 * this.get(2,3) + tmp_20 * this.get(3,3)));
    var out_22 = d * ((tmp_14 * this.get(0,3) + tmp_19 * this.get(1,3) + tmp_22 * this.get(3,3)) -
                      (tmp_15 * this.get(0,3) + tmp_18 * this.get(1,3) + tmp_23 * this.get(3,3)));
    var out_23 = d * ((tmp_17 * this.get(0,3) + tmp_20 * this.get(1,3) + tmp_23 * this.get(2,3)) -
                      (tmp_16 * this.get(0,3) + tmp_21 * this.get(1,3) + tmp_22 * this.get(2,3)));

    var out_30 = d * ((tmp_14 * this.get(2,2) + tmp_17 * this.get(3,2) + tmp_13 * this.get(1,2)) -
                      (tmp_16 * this.get(3,2) + tmp_12 * this.get(1,2) + tmp_15 * this.get(2,2)));
    var out_31 = d * ((tmp_20 * this.get(3,2) + tmp_12 * this.get(0,2) + tmp_19 * this.get(2,2)) -
                      (tmp_18 * this.get(2,2) + tmp_21 * this.get(3,2) + tmp_13 * this.get(0,2)));
    var out_32 = d * ((tmp_18 * this.get(1,2) + tmp_23 * this.get(3,2) + tmp_15 * this.get(0,2)) -
                      (tmp_22 * this.get(3,2) + tmp_14 * this.get(0,2) + tmp_19 * this.get(1,2)));
    var out_33 = d * ((tmp_22 * this.get(2,2) + tmp_16 * this.get(0,2) + tmp_21 * this.get(1,2)) -
                      (tmp_20 * this.get(1,2) + tmp_23 * this.get(2,2) + tmp_17 * this.get(0,2)));

    this.elements[0] = out_00;
    this.elements[1] = out_01;
    this.elements[2] = out_02;
    this.elements[3] = out_03;
    this.elements[4] = out_10;
    this.elements[5] = out_11;
    this.elements[6] = out_12;
    this.elements[7] = out_13;
    this.elements[8] = out_20;
    this.elements[9] = out_21;
    this.elements[10] = out_22;
    this.elements[11] = out_23;
    this.elements[12] = out_30;
    this.elements[13] = out_31;
    this.elements[14] = out_32;
    this.elements[15] = out_33;
    return this;
  },

  // Returns new matrix which is the inverse of this
  inverse: function () {
    var tmp = this.copy();
    return tmp.invert();
  },

  // In-place transpose
  transpose: function () {
    var tmp = this.elements[1];
    this.elements[1] = this.elements[4];
    this.elements[4] = tmp;

    tmp = this.elements[2];
    this.elements[2] = this.elements[8];
    this.elements[8] = tmp;

    tmp = this.elements[3];
    this.elements[3] = this.elements[12];
    this.elements[12] = tmp;

    tmp = this.elements[6];
    this.elements[6] = this.elements[9];
    this.elements[9] = tmp;

    tmp = this.elements[7];
    this.elements[7] = this.elements[13];
    this.elements[13] = tmp;

    tmp = this.elements[11];
    this.elements[11] = this.elements[14];
    this.elements[14] = tmp;

    return this;
  },

  loadIdentity: function () {
    for (var i = 0; i < 16; i++)
      this.elements[i] = 0;
    this.elements[0] = 1.0;
    this.elements[5] = 1.0;
    this.elements[10] = 1.0;
    this.elements[15] = 1.0;
    return this;
  }
};

module.exports = Matrix4x4;
